# filename: ssh_exec.py
import paramiko
import json
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
    out = stdout.read().decode(errors="ignore")
    err = stderr.read().decode(errors="ignore")
    exit_status = stdout.channel.recv_exit_status()
    return exit_status, out, err


def send_prompt(
    client: paramiko.SSHClient,
    prompt: str,
    model: str = "llama3.1:8b",
    api_url: str = "http://127.0.0.1:11434/api/generate",
    options: dict | None = None,
    timeout: int = 180,
) -> dict:
    """
    Uzak sunucudaki Ollama HTTP API'ye prompt gönderir, streaming JSON'u birleştirerek düz metin yanıt döndürür.
    Dönen: {"ok": bool, "text": str, "raw": str, "stderr": str}
    """
    payload = {
        "model": model,
        "prompt": prompt,
    }
    if options:
        payload["options"] = (
            options  # örn: {"temperature": 0.2, "top_p": 0.9, "num_predict": 256}
        )

    # curl ile POST; -s = silent. Ollama satır satır JSON üretir (stream).
    # json.dumps içinde tekrar json.dumps(payload) yapmıyoruz; shell tarafında tek tırnak kaçmasını önlemek için repr benzeri kullanıyoruz.
    data_literal = json.dumps(payload, ensure_ascii=False)
    cmd = (
        "curl -s -X POST "
        f"{api_url} "
        "-H 'Content-Type: application/json' "
        f"-d {json.dumps(data_literal)}"
    )

    _, out, err = run_remote(client, cmd, timeout=timeout)

    # Streaming JSON her satırı parse edip 'response' alanlarını birleştir
    pieces = []
    for line in out.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
            if "response" in obj:
                pieces.append(obj["response"])
        except Exception:
            # parse edilemeyen satır varsa raw içinde kalır, text'e ekleme.
            pass

    text = "".join(pieces).strip() if pieces else out.strip()
    return {"ok": bool(text), "text": text, "raw": out, "stderr": err}

