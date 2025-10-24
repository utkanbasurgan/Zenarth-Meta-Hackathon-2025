# filename: ssh_exec.py
import paramiko
from pathlib import Path


def _read_passphrase(passfile: str | None) -> str | None:
    """passphrase.key dosyasını temiz biçimde oku (BOM/boşluk kırp)."""
    if not passfile:
        return None
    p = Path(passfile)
    if not p.exists():
        return None
    raw = p.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):  # UTF-8 BOM temizle
        raw = raw[3:]
    return raw.strip().decode("utf-8", errors="ignore")


def connect_ssh(
    host: str,
    port: int,
    username: str,
    key_path: str,
    passfile_path: str | None = None,
    timeout: int = 30,
) -> paramiko.SSHClient:
    """
    Private key ve (varsa) passphrase dosyadan okunarak SSH bağlantısı kurar.
    Başarılıysa açık bir paramiko.SSHClient döner (kapatmayı sen yaparsın).
    """
    passphrase = _read_passphrase(passfile_path)
    try:
        pkey = paramiko.RSAKey.from_private_key_file(key_path, password=passphrase)
    except Exception as e:
        raise RuntimeError(f"Private key yüklenemedi: {e}")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(
            hostname=host,
            port=port,
            username=username,
            pkey=pkey,
            timeout=timeout,
            allow_agent=False,
            look_for_keys=False,
        )
    except Exception as e:
        raise RuntimeError(f"SSH bağlantı hatası: {e}")

    return client


def run_remote(
    client: paramiko.SSHClient, command: str, timeout: int = 120, pty: bool = True
):
    """
    Açık SSH bağlantısı üzerinde verilen komutu çalıştırır.
    Dönen: (exit_status:int, stdout:str, stderr:str)
    """
    stdin, stdout, stderr = client.exec_command(command, get_pty=pty, timeout=timeout)
    # Tüm çıktıyı oku
    out = stdout.read().decode(errors="ignore")
    err = stderr.read().decode(errors="ignore")
    exit_status = stdout.channel.recv_exit_status()
    return exit_status, out, err


# -----------------------------
# Örnek kullanım
# -----------------------------
if __name__ == "__main__":
    HOST = "83.104.230.246"
    PORT = 31103
    USER = "root"

    # DİKKAT: gerçek dosya yollarını yaz
    KEY_PATH = "./APP_Api/llama_ssh.txt"
    PASSFILE_PATH = "./App_api/passphrase.txt"

    # 1) bağlan
    ssh = connect_ssh(HOST, PORT, USER, KEY_PATH, PASSFILE_PATH)

    try:
        # 2) istediğin komutu çalıştır: örnek—ollama ile llama3 prompt’u
        prompt = "Merhaba Llama 3, tek cümlede cevap ver."
        # heredoc ile güvenli prompt aktarımı (özel karakter derdin kalmaz)
        cmd = f"echo Hello World"

        code, out, err = run_remote(ssh, cmd, timeout=180)

        print("exit_status:", code)
        print("stdout:\n", out)
        print("stderr:\n", err)

        cmd = f"ollama run llama3.1:8b"

    finally:
        ssh.close()
