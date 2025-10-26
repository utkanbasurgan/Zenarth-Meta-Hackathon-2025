# filename: APP_Api/main.py
from __future__ import annotations
import json
import sys
import re
from pathlib import Path
from typing import Optional
from datetime import datetime

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


def find_latest_analysis_dir(root_dir: str | Path) -> Path | None:
    """En son oluşturulan analysis_* klasörünü bul.

    Args:
        root_dir: Analiz klasörlerinin bulunduğu ana dizin

    Returns:
        En son oluşturulan analysis_* klasörünün yolu, ya da None
    """
    root_dir = Path(root_dir)
    if not root_dir.exists():
        return None

    # analysis_YYYYMMDD_HHMMSS formatındaki klasörleri bul
    pattern = re.compile(r"analysis_\d{8}_\d{6}")
    analysis_dirs = [
        d for d in root_dir.iterdir() if d.is_dir() and pattern.match(d.name)
    ]

    if not analysis_dirs:
        return None

    # Klasör adına göre sırala (en son tarih/saat sona gelir)
    latest = sorted(analysis_dirs)[-1]
    return latest


def run_pipeline(
    do_collect: bool = True,
    do_analyze: bool = True,
    do_apply: bool = False,
    dry_run: bool = False,
    window: int = 0,
    use_overwrite: bool = True,
    target_func="",
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
        print(f"[1/3] Collect → {project_root}  target={target_func}")
        exts = (".js", ".jsx", ".ts", ".tsx")  # Temel dosya türleri
        count = collect_context(project_root, target_func, codes_out, exts=exts)
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
            raise FileNotFoundError(
                f"❌ {out_dir} klasöründe analysis_* formatında klasör bulunamadı.\n"
                "   Önce bir analiz çalıştırmanız gerekiyor."
            )
        response_json = latest / "response.json"
        if not response_json.exists():
            raise FileNotFoundError(
                f"❌ Response dosyası bulunamadı: {response_json}\n"
                "   Bu klasörde bir analiz tamamlanmamış olabilir."
            )
        print(f"✓ Son analiz kullanılıyor: {latest.name}")
        print(f"  Response dosyası: {response_json.name}")

        if use_overwrite:
            # ✅ Tam dosya overwrite modu (JSON'daki code_change.{path}.code)
            updated = apply_code_overwrite(
                response_path=response_json,  # response.json konumu
                repo_root=project_root,  # kod değişikliği için proje kökü
            )
            summary = {"mode": "overwrite", "updated_files": updated}

            # Son analiz klasöründe old_code ve new_code kayıtları var
            if updated:
                print("\nDosya kopyaları şuraya kaydedildi:")
                print(f"  Eski kodlar → {latest}/code/old_code/")
                print(f"  Yeni kodlar → {latest}/code/new_code/")
        else:
            raise SystemExit(
                "Diff modu devre dışı. Tam dosya güncelleme için --overwrite kullanın."
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
        do_apply=True,  # Kod değişikliği uygulama fazı
        dry_run=False,  # Değişiklikleri önizleme (apply fazında)
        window=0,  # Kaç satır context kullanılacak (apply fazında)
        use_overwrite=True,  # Tam dosya güncelleme modu kullan (apply fazında)
        target_func="handleLogging",
    )
