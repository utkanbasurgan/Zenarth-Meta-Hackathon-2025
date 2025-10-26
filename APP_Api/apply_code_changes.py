# filename: apply_full_overwrite_func.py
from __future__ import annotations
import json
from pathlib import Path
from datetime import datetime


def apply_code_overwrite(response_path: str | Path, repo_root: str | Path):
    """
    Reads a response.json file containing:
    {
      "code_change": {
        "<relative_path>": {
          "code": "<full file string>"
        }
      }
    }

    and overwrites each target file with the new code,
    while creating a timestamped .bak backup if the file already exists.
    """
    response_path = Path(response_path)
    repo_root = Path(repo_root)

    if not response_path.exists():
        raise FileNotFoundError(f"Response file not found: {response_path}")

    data = json.loads(response_path.read_text(encoding="utf-8"))
    code_change = data.get("code_change") or {}

    if not isinstance(code_change, dict) or not code_change:
        raise ValueError("No valid 'code_change' found in JSON.")

    updated_files = []
    for rel_path, payload in code_change.items():
        if not isinstance(payload, dict):
            print(f"⚠️  Skipping invalid entry for {rel_path}")
            continue

        code = payload.get("code")
        if not isinstance(code, str):
            print(f"⚠️  Missing or invalid 'code' for {rel_path}")
            continue

        dest_path = (repo_root / rel_path).resolve()
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        # Backup existing file
        if dest_path.exists():
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = dest_path.with_suffix(dest_path.suffix + f".bak.{ts}")
            backup_path.write_text(
                dest_path.read_text(encoding="utf-8", errors="ignore"), encoding="utf-8"
            )
            print(f"🗂️  Backup created: {backup_path}")

        # Write new code
        if not code.endswith("\n"):
            code += "\n"
        dest_path.write_text(code, encoding="utf-8")
        updated_files.append(str(dest_path))
        print(f"✅ Updated file: {dest_path}")

    print(f"\n✨ Done. Total updated files: {len(updated_files)}")
    return updated_files
