# filename: collect_ctx.py
import os
from pathlib import Path
from typing import Iterable, List, Set

# ---------- Ayarlar ----------
DEFAULT_EXTS = (".js", ".jsx", ".ts", ".tsx")
SKIP_DIRS: Set[str] = {
    "node_modules",
    ".git",
    ".hg",
    ".svn",
    ".idea",
    ".vscode",
    "dist",
    "build",
    "out",
    "coverage",
    ".next",
    ".turbo",
    ".cache",
}
HEADER_PREFIX = ">>> "  # Dosya bölüm başlığı


# ---------- Yardımcılar ----------
def iter_files(project_root: Path, exts: Iterable[str]) -> Iterable[Path]:
    for root, dirs, files in os.walk(project_root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fn in files:
            if any(fn.endswith(ext) for ext in exts):
                yield Path(root) / fn


def read_text_safely(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""


def contains_target_symbol(text: str, target: str) -> bool:
    import re

    rx = re.compile(rf"\b{re.escape(target)}\b")
    return rx.search(text) is not None


def normalize_rel_path(p: Path, root: Path) -> str:
    return p.relative_to(root).as_posix()


# ---------- JS/TS temizleyici ----------
def strip_js_like_comments_and_tighten(text: str) -> str:
    """
    - // ve /* */ yorumlarını kaldırır
    - string (' " `) içerikleri korur (kaçışlarla birlikte)
    - satır sonu boşluklarını siler, 2+ boş satırı teke indirir
    """
    n = len(text)
    i = 0
    out: List[str] = []
    in_sl_comment = in_ml_comment = in_s = in_d = in_bt = False
    escape = False

    while i < n:
        ch = text[i]
        nxt = text[i + 1] if i + 1 < n else ""

        if in_sl_comment:
            if ch == "\n":
                in_sl_comment = False
                out.append(ch)
            i += 1
            continue

        if in_ml_comment:
            if ch == "*" and nxt == "/":
                in_ml_comment = False
                i += 2
            else:
                i += 1
            continue

        if in_s:
            out.append(ch)
            if not escape and ch == "'":
                in_s = False
            escape = ch == "\\" and not escape
            i += 1
            continue

        if in_d:
            out.append(ch)
            if not escape and ch == '"':
                in_d = False
            escape = ch == "\\" and not escape
            i += 1
            continue

        if in_bt:
            out.append(ch)
            if not escape and ch == "`":
                in_bt = False
            escape = ch == "\\" and not escape
            i += 1
            continue

        if ch == "/" and nxt:
            if nxt == "/":
                in_sl_comment = True
                i += 2
                continue
            if nxt == "*":
                in_ml_comment = True
                i += 2
                continue

        if ch == "'":
            in_s = True
            out.append(ch)
            escape = False
            i += 1
            continue

        if ch == '"':
            in_d = True
            out.append(ch)
            escape = False
            i += 1
            continue

        if ch == "`":
            in_bt = True
            out.append(ch)
            escape = False
            i += 1
            continue

        out.append(ch)
        i += 1

    raw = "".join(out)
    lines = [ln.rstrip() for ln in raw.splitlines()]
    tightened = []
    blank = False
    for ln in lines:
        if ln == "":
            if not blank:
                tightened.append("")
                blank = True
        else:
            tightened.append(ln)
            blank = False
    return "\n".join(tightened).strip() + "\n"


# ---------- Ana İş ----------
def collect_context(
    project_root: Path, target: str, out_path: Path, exts=DEFAULT_EXTS
) -> int:
    files = []
    for p in iter_files(project_root, exts):
        text = read_text_safely(p)
        if text and contains_target_symbol(text, target):
            files.append(p)
    files.sort(key=lambda x: x.as_posix())

    out_path.parent.mkdir(parents=True, exist_ok=True)

    if not files:
        out_path.write_text("", encoding="utf-8")
        return 0

    chunks: List[str] = []
    for i, p in enumerate(files, start=1):
        rel = normalize_rel_path(p, project_root)
        base = p.name
        ext = p.suffix or ".txt"
        code = read_text_safely(p)
        cleaned = strip_js_like_comments_and_tighten(code)
        total_lines = cleaned.count("\n") if cleaned else 0
        header_name = f"{i:03d}__{base}__ALL__L1-{total_lines}.ctx{ext}"
        # Önceki kalıp + relative path’i parantez içinde göster
        header_line = f"{HEADER_PREFIX}{header_name}  ({rel})"
        chunks.append(f"{header_line}\n{cleaned}")

    merged = "\n".join(chunks).strip() + "\n"
    out_path.write_text(merged, encoding="utf-8")
    return len(files)


# ---------- Etkileşimli CLI ----------
if __name__ == "__main__":
    print("=== React/TS Fonksiyon Tarayıcı (tek TXT, eski isimlendirme) ===")
    project_root = Path(input("📂 Proje klasör yolu: ").strip() or ".").resolve()
    if not project_root.exists():
        print("❌ Proje klasörü bulunamadı.")
        raise SystemExit(1)

    target = input("🎯 Aranacak fonksiyon/sembol adı: ").strip()
    if not target:
        print("❌ Geçerli bir isim girilmedi.")
        raise SystemExit(1)

    default_out = Path("ctx_out") / f"ctx_{target}_files.txt"
    out_path_input = input(f"💾 Çıktı dosyası (varsayılan: {default_out}): ").strip()
    out_path = Path(out_path_input) if out_path_input else default_out

    print("\n[1/2] Dosyalar taranıyor...")
    count = collect_context(project_root, target, out_path)
    print(f"[2/2] {count} dosya bulundu ve kaydedildi → {out_path}")
