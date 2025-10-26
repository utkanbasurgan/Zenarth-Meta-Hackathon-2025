# filename: APP_Api/main.py
from __future__ import annotations
import argparse
import json
import sys
import re
from pathlib import Path
from typing import Optional

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
from find_func import collect_context, DEFAULT_EXTS  # repo kökünde (ctx_out üreten)
from llama_error_analysis import analyze_errors_with_llama  # APP_Api içinde

# Eski diff-tabanlı uygulama istersen kalsın (gerekmezse kaldırabilirsin)
# from apply_code_changes import apply_code_changes
from apply_code_changes import apply_code_overwrite  # 👈 yeni: tam overwrite
from python_api import connect_ssh


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
    project_root: Path,
    target_symbol: str,
    log_path: Path,
    codes_out_path: Path,
    prompt_format_path: Path,
    system_prompt_path: Optional[Path],
    ssh_host: str,
    ssh_port: int,
    ssh_user: str,
    ssh_key_path: Path,
    ssh_passfile_path: Optional[Path],
    model: str,
    out_dir: Path,
    temperature: float,
    num_predict: int,
    timeout: int,
    do_collect: bool,
    do_analyze: bool,
    do_apply: bool,
    dry_run: bool,
    window: int,
    use_overwrite: bool,  # 👈 eklendi
) -> None:
    print("=== Llama Error Analysis • Orchestrator ===")

    # 1) Topla
    if do_collect:
        print(f"[1/3] Collect → {project_root}  target={target_symbol}")
        count = collect_context(
            project_root, target_symbol, codes_out_path, exts=DEFAULT_EXTS
        )
        print(f"    ✓ {count} dosya → {codes_out_path}")

    # 2) Analiz
    if do_analyze:
        print(f"[2/3] Analyze → prompt oluşturuluyor")
        ssh = connect_ssh(
            ssh_host,
            ssh_port,
            ssh_user,
            str(ssh_key_path),
            str(ssh_passfile_path) if ssh_passfile_path else None,
        )
        try:
            system_prompt = (
                system_prompt_path.read_text(encoding="utf-8")
                if (system_prompt_path and system_prompt_path.exists())
                else None
            )
            analyze_errors_with_llama(
                ssh=ssh,
                log_path=str(log_path),
                codes_file_path=str(codes_out_path),
                prompt_format_path=str(prompt_format_path),
                model=model,
                out_dir=str(out_dir),
                temperature=temperature,
                num_predict=num_predict,
                timeout=timeout,
                system_prompt=system_prompt,
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
            # 🧩 İstersen diff tabanlı modla uygulamak için aşağıyı aktifleştir
            # report = apply_code_changes(
            #     response_json_path=response_json,
            #     repo_root=project_root,
            #     dry_run=dry_run,
            #     window=window,
            # )
            # summary = {"mode": "diff", **report}
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


def parse_args(argv=None):
    ap = argparse.ArgumentParser(
        description="Collect → Analyze → Apply runner (paths adapted to your tree)"
    )
    # Yol varsayılanları ağaç yapına göre
    ap.add_argument("--project", default=str(REPO_ROOT / "TESTS_Main" / "myapp"))
    ap.add_argument("--target", default="handleLogging")
    ap.add_argument(
        "--log-path",
        default=str(REPO_ROOT / "TESTS_Main" / "myapp" / "src" / "log.txt"),
    )

    ap.add_argument(
        "--codes-out",
        default=str(REPO_ROOT / "ctx_out" / "ctx_handleLogging_files.txt"),
    )
    ap.add_argument("--prompt-format", default=str(APP_API_DIR / "prompt_format.txt"))
    ap.add_argument("--system-prompt", default=str(APP_API_DIR / "system_prompt.txt"))

    ap.add_argument("--host", default="83.104.230.246")
    ap.add_argument("--port", type=int, default=31103)
    ap.add_argument("--user", default="root")
    ap.add_argument("--key", default=str(APP_API_DIR / "llama_ssh.txt"))
    ap.add_argument("--passfile", default=str(APP_API_DIR / "passphrase.txt"))

    ap.add_argument("--model", default="llama3.1:8b")
    ap.add_argument("--out-dir", default=str(REPO_ROOT / "error_analysis_reports"))
    ap.add_argument("--temperature", type=float, default=0.1)
    ap.add_argument("--num-predict", type=int, default=2048)
    ap.add_argument("--timeout", type=int, default=600)

    ap.add_argument("--no-collect", action="store_true")
    ap.add_argument("--no-analyze", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--window", type=int, default=0)

    # 👇 yeni: overwrite seçeneği
    ap.add_argument(
        "--overwrite",
        action="store_true",
        help="Apply full-file overwrite using code_change.{path}.code",
    )

    return ap.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)

    project_root = Path(args.project).resolve()
    if not project_root.exists():
        raise SystemExit(f"❌ Proje klasörü bulunamadı: {project_root}")

    log_path = Path(args.log_path).resolve()
    if not log_path.exists():
        raise SystemExit(f"❌ Log dosyası bulunamadı: {log_path}")

    codes_out_path = Path(args.codes_out).resolve()
    prompt_format_path = Path(args.prompt_format).resolve()
    if not prompt_format_path.exists():
        raise SystemExit(f"❌ Prompt format dosyası bulunamadı: {prompt_format_path}")

    system_prompt_path = Path(args.system_prompt).resolve()
    if not system_prompt_path.exists():
        system_prompt_path = None  # opsiyonel

    ssh_key_path = Path(args.key).resolve()
    if not ssh_key_path.exists():
        raise SystemExit(f"❌ SSH key bulunamadı: {ssh_key_path}")

    ssh_passfile_path = Path(args.passfile).resolve() if args.passfile else None
    if ssh_passfile_path and not ssh_passfile_path.exists():
        raise SystemExit(f"❌ SSH passphrase dosyası bulunamadı: {ssh_passfile_path}")

    out_dir = Path(args.out_dir).resolve()

    run_pipeline(
        project_root=project_root,
        target_symbol=args.target.strip(),
        log_path=log_path,
        codes_out_path=codes_out_path,
        prompt_format_path=prompt_format_path,
        system_prompt_path=system_prompt_path,
        ssh_host=args.host,
        ssh_port=args.port,
        ssh_user=args.user,
        ssh_key_path=ssh_key_path,
        ssh_passfile_path=ssh_passfile_path,
        model=args.model,
        out_dir=out_dir,
        temperature=args.temperature,
        num_predict=args.num_predict,
        timeout=args.timeout,
        do_collect=not args.no_collect,
        do_analyze=not args.no_analyze,
        do_apply=args.apply,
        dry_run=args.dry_run,
        window=args.window,
        use_overwrite=args.overwrite,  # 👈 eklendi
    )


if __name__ == "__main__":
    main()

# python -m APP_Api.main --apply --overwrite
# (opsiyonel) sadece analiz:
# python -m APP_Api.main --no-collect --apply --overwrite
# (opsiyonel) collect+analyze:
# python -m APP_Api.main
