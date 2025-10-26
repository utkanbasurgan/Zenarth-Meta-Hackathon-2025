# filename: APP_Api/main.py
from __future__ import annotations
import json
import sys
from pathlib import Path
from typing import Optional

# !!! Bu değişkeni değiştirerek aranacak fonksiyonu belirleyin
from datetime import datetime
from typing import Optional
from pathlib import Path
import json

from python_api import connect_ssh, Config
from llama_error_analysis import analyze_errors_with_llama
from find_func import collect_context
from apply_code_changes import apply_code_overwrite


TARGET = "style"
if not "TARGET" in globals():
    raise ValueError(
        "TARGET değişkeni tanımlanmamış. Bu değişken ana fonksiyon adını içermeli."
    )

# --- Proje kökü ve APP_Api yolunu tespit et ---
APP_API_DIR = Path(__file__).resolve().parent
REPO_ROOT = APP_API_DIR.parent

# collect_ctx.py repo kökünde ise import için sys.path'e kökü ekle
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
# APP_Api içindeki modüller için de güvence
if str(APP_API_DIR) not in sys.path:
    sys.path.insert(0, str(APP_API_DIR))

# --- Modüller ---
from find_func import collect_context  # repo kökünde (ctx_out üreten)
from llama_error_analysis import analyze_errors_with_llama  # APP_Api içinde
from apply_code_changes import apply_code_overwrite
from python_api import connect_ssh, Config  # Config modülünü import et


def find_latest_analysis_dir(reports_root: Path) -> Optional[Path]:
    if not reports_root.exists():
        return None
    dirs = [
        d
        for d in reports_root.iterdir()
        if d.is_dir() and d.name.startswith("analysis_")
    ]
    return max(dirs, key=lambda p: p.stat().st_mtime) if dirs else None


def run_pipeline(
    do_collect: bool = True,
    do_analyze: bool = True,
    do_apply: bool = False,
    dry_run: bool = False,
    window: int = 0,
    use_overwrite: bool = True,
) -> None:
    """Model error analizi pipeline'ını çalıştır.

    Tüm konfigürasyon model_config.txt'den okunur.
    Fonksiyon adı üstteki TARGET değişkeninden alınır.
    """
    print("=== Llama Error Analysis • Orchestrator ===")

    # Config'den tüm ayarları al
    cfg = Config.get()
    project = cfg["PROJECT"]
    paths = cfg["PATHS"]

    # Path nesneleri oluştur ve kontrol et
    project_root = Path(project["PROJECT_ROOT"]).resolve()
    if not project_root.exists():
        raise FileNotFoundError(f"❌ Proje klasörü bulunamadı: {project_root}")

    log_path = Path(paths["LOG_PATH"]).resolve()
    codes_out = Path(paths["CODES_FILE"]).resolve()
    prompt_format = Path(paths["PROMPT_FORMAT"]).resolve()
    system_prompt = Path(paths["SYSTEM_PROMPT"]).resolve()
    out_dir = Path(paths["ERROR_REPORTS"]).resolve()

    # 1) Topla
    if do_collect:
        print(f"[1/3] Collect → {project_root}  target={TARGET}")
        exts = (".js", ".jsx", ".ts", ".tsx")  # Temel dosya türleri
        count = collect_context(project_root, TARGET, codes_out, exts=exts)
        print(f"    ✓ {count} dosya → {codes_out}")

    # 2) Analiz
    if do_analyze:
        print(f"[2/3] Analyze → prompt oluşturuluyor")
        ssh = connect_ssh()  # Config'den okur
        try:
            system = (
                system_prompt.read_text(encoding="utf-8")
                if system_prompt.exists()
                else None
            )
            analyze_errors_with_llama(
                ssh=ssh,
                log_path=str(log_path),
                codes_file_path=str(codes_out),
                prompt_format_path=str(prompt_format),
                system_prompt=system,
            )
        finally:
            ssh.close()

    # 3) Uygula
    if do_apply:
        print(f"[3/3] Apply → son analiz klasörü aranıyor: {out_dir}")
        latest = find_latest_analysis_dir(out_dir)
        if not latest:
            raise FileNotFoundError(f"Under {out_dir} no analysis_* folder found.")
        response_json = latest / "response.json"
        if not response_json.exists():
            raise FileNotFoundError(f"{response_json} not found.")
        print(f"    using: {response_json}")

        if use_overwrite:
            # ✅ Tam dosya overwrite modu (JSON'daki code_change.{path}.code)
            updated = apply_code_overwrite(
                response_path=response_json,
                repo_root=project_root,
            )
            summary = {"mode": "overwrite", "updated_files": updated}
        else:
            raise SystemExit(
                "Diff mode disabled. Run with --overwrite to use full-file overwrite."
            )

        summary_path = latest / (
            "apply_summary_overwrite.json"
            if use_overwrite
            else ("apply_summary_dryrun.json" if dry_run else "apply_summary.json")
        )
        summary_path.write_text(
            json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"    ✓ summary → {summary_path}")

    print("\n[✓] Done.")


if __name__ == "__main__":
    # TARGET değişkeni oluşturulmuş olmalı
    if "TARGET" not in globals():
        raise ValueError(
            "Lütfen TARGET değişkenini tanımlayın. Örnek: TARGET = 'LogService.secondary'"
        )

    # Konfigürasyon kontrol
    if not hasattr(Config, "_instance"):
        raise ValueError(
            "Config sınıfı başlatılmamış. model_config.txt dosyasını kontrol edin."
        )

    # Pipeline çalıştır
    run_pipeline(
        do_collect=True,  # Kod toplama fazı
        do_analyze=True,  # LLM analiz fazı
        do_apply=False,  # Kod değişikliği uygulama fazı
        dry_run=False,  # Değişiklikleri önizleme (apply fazında)
        window=0,  # Kaç satır context kullanılacak (apply fazında)
        use_overwrite=True,  # Tam dosya güncelleme modu kullan (apply fazında)
    )
