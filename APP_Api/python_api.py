# filename: ssh_exec.py
import paramiko
import json
from pathlib import Path
import pandas as pd


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
    client: paramiko.SSHClient, command: str, timeout: int = 120, pty: bool = False
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
    timeout: int = 600,
    system: str | None = None,  # ✅ YENİ
) -> dict:
    """
    Ollama /api/generate (stream=false). 'system' alanını da destekler.
    Dönen: {"ok": bool, "text": str, "raw": str, "stderr": str}
    """
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "keep_alive": "30m",
    }
    if system:
        payload["system"] = system  # ✅ system desteği

    default_opts = {"num_predict": 2048, "temperature": 0.1}
    if options:
        default_opts.update(options)
    payload["options"] = default_opts

    # Kabuk güvenli here-doc (hiçbir $ / ${} genişlemesi olmaz)
    payload_json = json.dumps(payload, ensure_ascii=False)
    cmd = (
        "curl -s -X POST "
        f"{api_url} "
        "-H 'Content-Type: application/json' "
        "--data-binary @- <<'JSON'\n"
        f"{payload_json}\n"
        "JSON"
    )

    _, out, err = run_remote(client, cmd, timeout=timeout, pty=False)

    text = ""
    try:
        obj = json.loads(out) if out.strip() else {}
        text = obj.get("response", "") if isinstance(obj, dict) else ""
    except Exception:
        text = out.strip()

    return {"ok": bool(text), "text": text.strip(), "raw": out, "stderr": err}
