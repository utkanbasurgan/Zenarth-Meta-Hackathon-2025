# filename: python_api.py
from __future__ import annotations
import paramiko
import json
from pathlib import Path
import pandas as pd
from typing import Optional, Dict, Any


class Config:
    """Global configuration manager that reads from model_config.txt."""

    _instance: Optional[Config] = None
    _config: Dict[str, Dict[str, Any]] = {}

    def __init__(self):
        if Config._instance is not None:
            raise RuntimeError("Use Config.get() to access the config")
        self.reload()

    @classmethod
    def get(cls) -> Config:
        """Get the singleton Config instance, creating it if needed."""
        if cls._instance is None:
            cls._instance = Config()
        return cls._instance

    def reload(self) -> None:
        """Reload configuration from model_config.txt."""
        config_path = Path(__file__).parent / "model_config.txt"
        if not config_path.exists():
            raise FileNotFoundError(f"Config file not found: {config_path}")

        config: Dict[str, Dict[str, str]] = {}
        current_section = None

        for line in config_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            if line.startswith("[") and line.endswith("]"):
                current_section = line[1:-1]
                config[current_section] = {}
                continue

            if current_section and "=" in line:
                key, value = line.split("=", 1)
                config[current_section][key.strip()] = value.strip()

        # Convert types for known numeric fields
        api = config.get("API", {})
        if "NUM_PREDICT" in api:
            api["NUM_PREDICT"] = int(api["NUM_PREDICT"])
        if "TEMPERATURE" in api:
            api["TEMPERATURE"] = float(api["TEMPERATURE"])
        if "TIMEOUT" in api:
            api["TIMEOUT"] = int(api["TIMEOUT"])

        ssh = config.get("SSH", {})
        if "PORT" in ssh:
            ssh["PORT"] = int(ssh["PORT"])

        self._config = config

    def __getitem__(self, section: str) -> Dict[str, Any]:
        """Get a config section by name, raising KeyError if missing."""
        if section not in self._config:
            raise KeyError(f"Missing config section: {section}")
        return self._config[section]

    def get_section(
        self, section: str, default: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Get a config section by name, returning default if missing."""
        return self._config.get(section, default or {})


def _read_passphrase(passfile: Optional[str]) -> Optional[str]:
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
    host: Optional[str] = None,
    port: Optional[int] = None,
    username: Optional[str] = None,
    key_path: Optional[str] = None,
    passfile_path: Optional[str] = None,
    timeout: int = 30,
) -> paramiko.SSHClient:
    """
    SSH bağlantısı kurar. Parametreler verilmezse model_config.txt'den okur.
    Başarılıysa açık bir paramiko.SSHClient döner (kapatmayı sen yaparsın).
    """
    # Config'den SSH ayarlarını al
    cfg = Config.get()["SSH"]

    # Parametre verilmişse onu kullan, yoksa config'den al
    host = host or cfg["HOST"]
    port = port or cfg["PORT"]
    username = username or cfg["USER"]
    key_path = key_path or cfg["KEY_PATH"]
    passfile_path = passfile_path or cfg.get("PASSFILE_PATH")
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
) -> tuple[int, str, str]:
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
    model: Optional[str] = None,
    api_url: Optional[str] = None,
    options: Optional[dict] = None,
    timeout: Optional[int] = None,
    system: Optional[str] = None,
) -> dict:
    """
    Ollama /api/generate API'sine istek gönderir.
    Tüm ayarları model_config.txt'den okur.

    Args:
        client: SSH bağlantısı
        prompt: Gönderilecek prompt
        model: Model adı (yoksa config'den)
        api_url: API endpoint (yoksa config'den)
        options: Özel model ayarları (yoksa config'den)
        timeout: Timeout süresi (yoksa config'den)
        system: System prompt (opsiyonel)

    Returns:
        dict: {"ok": bool, "text": str, "raw": str, "stderr": str}
    """
    # API ayarlarını config'den al
    cfg = Config.get()["API"]

    payload = {
        "model": model or cfg["MODEL"],
        "prompt": prompt,
        "stream": False,
        "keep_alive": cfg["KEEP_ALIVE"],
    }
    if system:
        payload["system"] = system

    # Model ayarları (önce config'den al, sonra options ile override et)
    model_opts = {"num_predict": cfg["NUM_PREDICT"], "temperature": cfg["TEMPERATURE"]}
    if options:
        model_opts.update(options)
    payload["options"] = model_opts

    # API URL ve timeout
    final_url = api_url or cfg["API_URL"]
    final_timeout = timeout or cfg["TIMEOUT"]

    # Kabuk güvenli here-doc (hiçbir $ / ${} genişlemesi olmaz)
    payload_json = json.dumps(payload, ensure_ascii=False)
    cmd = (
        "curl -s -X POST "
        f"{final_url} "
        "-H 'Content-Type: application/json' "
        "--data-binary @- <<'JSON'\n"
        f"{payload_json}\n"
        "JSON"
    )

    _, out, err = run_remote(client, cmd, timeout=final_timeout, pty=False)

    text = ""
    try:
        obj = json.loads(out) if out.strip() else {}
        text = obj.get("response", "") if isinstance(obj, dict) else ""
    except Exception:
        text = out.strip()

    return {"ok": bool(text), "text": text.strip(), "raw": out, "stderr": err}
