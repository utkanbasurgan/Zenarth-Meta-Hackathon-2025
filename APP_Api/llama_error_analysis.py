# filename: llama_error_analysis.py
from __future__ import annotations
from pathlib import Path
from datetime import datetime
import json
import re
from python_api import connect_ssh, send_prompt


# =========================================================
# 🔧 Yardımcı Fonksiyonlar
# =========================================================

def _read_text(p: Path) -> str:
    """Belirtilen dosyayı UTF-8 ile okur, hata varsa atlar."""
    return p.read_text(encoding="utf-8", errors="ignore")

def _write_text(p: Path, text: str) -> None:
    """Metni belirtilen dosyaya yazar, gerekirse klasörleri oluşturur."""
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8")


# =========================================================
# 🧠 Model Yanıtını İstenen JSON Şemasına Dönüştür:
#     code_change = {
#       "<file_path>": {
#           "code": "<entire updated file content>",
#           "changes": {
#               "<line>": {"remove": [...], "add": [...]},
#               ...
#           }
#       },
#       ...
#     }
#     root, fix, raw
# =========================================================

# Hunk başlığı örnekleri:
#   src/components/Secondary.js-10
#   src/components/Secondary.js - 10
#   src/components/Secondary.js - (10)
_HEADER_RE = re.compile(r"^(?P<file>.+?)\s*-\s*\(?(?P<line>\d+)\)?\s*$")

_ROOT_RE = re.compile(r"^Root of the problem:\s*$", re.IGNORECASE)
_FIX_RE  = re.compile(r"^How to fix:\s*$", re.IGNORECASE)

# Bölüm başlıkları
_UPDATED_FILES_RE = re.compile(r"^UPDATED FILES\s*$", re.IGNORECASE)
_CHANGES_RE       = re.compile(r"^CHANGES\s*$", re.IGNORECASE)

# UPDATED FILES altında dosya yolu satırını tanıma:
# - boşlukla başlamaz
# - .js, .jsx, .ts, .tsx ile biter
_PATH_LINE_RE = re.compile(r"^[^\s].+\.(?:js|jsx|ts|tsx)$")


def _parse_updated_files(lines: list[str], start_idx: int) -> tuple[dict[str, str], int]:
    """
    UPDATED FILES bölümünden dosya->tam içerik haritasını çıkarır.
    start_idx: 'UPDATED FILES' satırının *sonraki* satır indeksi.
    Dönüş: (updated_files, next_index)  ; next_index genelde 'CHANGES' satırına gelir.
    """
    updated_files: dict[str, str] = {}
    i = start_idx
    n = len(lines)

    current_path: str | None = None
    current_buf: list[str] = []

    def _flush():
        nonlocal current_path, current_buf
        if current_path is not None:
            # Tam dosya içeriğini tek string olarak kaydet
            updated_files[current_path] = "\n".join(current_buf).rstrip("\n")
        current_path = None
        current_buf = []

    while i < n:
        line = lines[i]
        if _CHANGES_RE.match(line):
            # Bölüm bitti
            _flush()
            return updated_files, i  # i: CHANGES satırının indeksi

        # Yeni bir dosya yolu mu?
        if _PATH_LINE_RE.match(line):
            # Öncekini flush et
            _flush()
            current_path = line.strip()
            current_buf = []
            i += 1
            continue

        # Dosya içeriği topla (her satırı ekle)
        if current_path is not None:
            current_buf.append(line)
        # Eğer henüz path görmediysek ve serbest satırlar varsa, atla
        i += 1

    # Son flush
    _flush()
    return updated_files, i


def _parse_model_response_to_struct(response_text: str) -> dict:
    """
    Model yanıtını şu yapıya dönüştürür:

    {
      "code_change": {
        "<file>": {
          "code": "<entire updated file content>",
          "changes": {
            "<line>": {
              "remove": [str, ...],   # varsa
              "add":    [str, ...]    # varsa
            },
            ...
          }
        },
        ...
      },
      "root": str,
      "fix":  str,
      "raw":  str
    }
    """
    code_change: dict[str, dict] = {}
    lines = response_text.splitlines()

    # 1) UPDATED FILES bölümünü yakala (varsa)
    i = 0
    n = len(lines)
    updated_files: dict[str, str] = {}
    while i < n:
        if _UPDATED_FILES_RE.match(lines[i]):
            updated_files, i = _parse_updated_files(lines, i + 1)
            break
        i += 1

    # 2) CHANGES bölümünden diff hunks + root/fix topla
    # i şu an CHANGES veya son satırda olabilir; CHANGES başlığını geç
    while i < n and not _CHANGES_RE.match(lines[i]):
        i += 1
    if i < n and _CHANGES_RE.match(lines[i]):
        i += 1  # "CHANGES" satırını atla

    current_file: str | None = None
    current_line: int | None = None
    in_root = False
    in_fix = False
    root_lines: list[str] = []
    fix_lines: list[str] = []

    while i < n:
        line = lines[i]

        # Bölüm başlıkları
        if _ROOT_RE.match(line):
            in_root, in_fix = True, False
            i += 1
            continue
        if _FIX_RE.match(line):
            in_root, in_fix = False, True
            i += 1
            continue

        # Root / Fix içerik
        if in_root:
            if _HEADER_RE.match(line) or _FIX_RE.match(line):
                in_root = False
                continue
            root_lines.append(line)
            i += 1
            continue

        if in_fix:
            if _HEADER_RE.match(line) or _ROOT_RE.match(line):
                in_fix = False
                continue
            fix_lines.append(line)
            i += 1
            continue

        # Hunk başlığı
        m = _HEADER_RE.match(line)
        if m:
            current_file = m.group("file").strip()
            try:
                current_line = int(m.group("line"))
            except Exception:
                current_line = None

            if current_file not in code_change:
                code_change[current_file] = {"code": "", "changes": {}}
            if current_line is not None:
                changes = code_change[current_file]["changes"]
                if str(current_line) not in changes:
                    changes[str(current_line)] = {"remove": [], "add": []}
            i += 1
            continue

        # Hunk içeriği
        if current_file is not None and current_line is not None:
            stripped = line.strip()

            # REMOVE
            if stripped.startswith("- "):
                code_str = line[line.index("- ") + 2 :] if "- " in line else line.lstrip("-").lstrip()
                code_change[current_file]["changes"][str(current_line)]["remove"].append(code_str)
                i += 1
                continue

            # ADD
            if stripped.startswith("+ "):
                code_str = line[line.index("+ ") + 2 :] if "+ " in line else line.lstrip("+").lstrip()
                code_change[current_file]["changes"][str(current_line)]["add"].append(code_str)
                i += 1
                continue

            # Bağlam / boş satır: atla
            i += 1
            continue

        i += 1

    # 3) UPDATED FILES içeriğini code_change'e yerleştir
    for path, full_code in updated_files.items():
        if path not in code_change:
            code_change[path] = {"code": full_code, "changes": {}}
        else:
            # changes zaten var; code'u ekle
            code_change[path]["code"] = full_code

    # 4) Boş listeleri temizle
    for f, obj in code_change.items():
        changes_map = obj.get("changes", {})
        for ln, chg in list(changes_map.items()):
            if not chg["remove"]:
                chg.pop("remove", None)
            if not chg["add"]:
                chg.pop("add", None)

    # 5) Root/Fix metinlerini sıkıştır
    def _squash(xs: list[str]) -> str:
        txt = "\n".join([x.rstrip() for x in xs]).strip()
        return re.sub(r"\n{3,}", "\n\n", txt)

    return {
        "code_change": code_change,
        "root": _squash(root_lines),
        "fix": _squash(fix_lines),
        "raw": response_text.strip(),
    }


# =========================================================
# 🤖 Ana Fonksiyon: analyze_errors_with_llama
# =========================================================

def analyze_errors_with_llama(
    ssh,
    log_path: str,
    codes_file_path: str = r"ctx_out/ctx_handleLogging_files.txt",
    prompt_format_path: str = "APP_Api/prompt_format.txt",
    model: str = "llama3.1:8b",
    out_dir: str = "error_analysis_reports",
    temperature: float = 0.1,
    num_predict: int = 2048,
    timeout: int = 600,
    system_prompt: str | None = None,
):
    """
    🔍 React projesindeki hataları analiz eder ve Llama modeline gönderir.
    Kaynak kodu, tek dosya (ctx_out/ctx_handleLogging_files.txt) olarak alır.
    - Prompt'u txt + JSON olarak kaydeder
    - Yanıtı txt + JSON (file -> {"code": full, "changes": {...}}) olarak kaydeder
    """
    log_file = Path(log_path)
    codes_file = Path(codes_file_path)
    prompt_template = Path(prompt_format_path)

    if not log_file.exists():
        raise FileNotFoundError(f"Log file not found: {log_file}")
    if not codes_file.exists():
        raise FileNotFoundError(f"Codes file not found: {codes_file}")
    if not prompt_template.exists():
        raise FileNotFoundError(f"Prompt format file not found: {prompt_template}")

    log_text = _read_text(log_file).strip()
    codes_block = _read_text(codes_file).strip()

    prompt_format = _read_text(prompt_template)
    prompt = prompt_format.format(
        log_text=log_text,
        codes_block=codes_block,
    )

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    session_dir = Path(out_dir) / f"analysis_{timestamp}"
    session_dir.mkdir(parents=True, exist_ok=True)

    prompt_txt_path = session_dir / "full_prompt.txt"
    _write_text(prompt_txt_path, prompt)

    prompt_json = {
        "timestamp": timestamp,
        "model": model,
        "temperature": temperature,
        "num_predict": num_predict,
        "system_prompt_present": bool(system_prompt),
        "prompt_text": prompt,
        "log_source": str(log_file),
        "codes_file": str(codes_file),
    }
    prompt_json_path = session_dir / "prompt.json"
    _write_text(prompt_json_path, json.dumps(prompt_json, ensure_ascii=False, indent=2))

    print(f"[*] Sending prompt ({len(prompt)} chars) using codes file: {codes_file} ...")

    res = send_prompt(
        ssh,
        prompt=prompt,
        model=model,
        options={"temperature": temperature, "num_predict": num_predict},
        timeout=timeout,
        system=system_prompt,
    )

    response_text = (res.get("text") or "").strip() or "_(no response)_"
    response_txt_path = session_dir / "response.txt"
    _write_text(response_txt_path, response_text)

    response_struct = _parse_model_response_to_struct(response_text)
    response_json_path = session_dir / "response.json"
    _write_text(response_json_path, json.dumps(response_struct, ensure_ascii=False, indent=2))

    meta = {
        "log_file": str(log_file),
        "codes_file": str(codes_file),
        "model": model,
        "prompt_file_txt": str(prompt_txt_path),
        "prompt_file_json": str(prompt_json_path),
        "response_file_txt": str(response_txt_path),
        "response_file_json": str(response_json_path),
        "stderr": res.get("stderr", ""),
    }
    _write_text(session_dir / "meta.json", json.dumps(meta, ensure_ascii=False, indent=2))

    print(f"[✓] Analysis complete. Reports saved to: {session_dir}")
    return response_struct


# =========================================================
# 🧪 CLI (doğrudan çalıştırmak için)
# =========================================================
if __name__ == "__main__":
    HOST = "83.104.230.246"
    PORT = 31103
    USER = "root"
    KEY_PATH = "./APP_Api/llama_ssh.txt"
    PASSFILE_PATH = "./App_api/passphrase.txt"

    LOG_PATH = "./TESTS_Main/myapp/src/log.txt"
    CODES_FILE = r"ctx_out/ctx_handleLogging_files.txt"

    system_prompt = Path("APP_Api/system_prompt.txt").read_text(encoding="utf-8")

    ssh = connect_ssh(HOST, PORT, USER, KEY_PATH, PASSFILE_PATH)
    try:
        analyze_errors_with_llama(
            ssh,
            log_path=LOG_PATH,
            codes_file_path=CODES_FILE,
            prompt_format_path="APP_Api/prompt_format.txt",
            model="llama3.1:8b",
            temperature=0.1,
            num_predict=2048,
            timeout=600,
            system_prompt=system_prompt,
        )
    finally:
        ssh.close()
