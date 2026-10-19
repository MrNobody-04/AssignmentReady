import subprocess
from pathlib import Path
from src.config import config
from src.common.security import validate_pdf_bytes

def is_libreoffice_available() -> bool:
    return bool(config.libreoffice_path and Path(config.libreoffice_path).is_file())

def convert_docx_to_pdf(docx_path: Path, output_dir: Path) -> Path | None:
    if not is_libreoffice_available():
        return None

    cmd = [
        config.libreoffice_path,
        "--headless",
        "--convert-to",
        "pdf",
        str(docx_path),
        "--outdir",
        str(output_dir),
    ]

    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=45)
        if result.returncode != 0:
            return None

        expected_pdf = output_dir / (docx_path.stem + ".pdf")
        if expected_pdf.exists() and expected_pdf.stat().st_size > 0:
            with open(expected_pdf, "rb") as f:
                validate_pdf_bytes(f.read(10), expected_pdf.name)
            return expected_pdf
        return None
    except Exception:
        return None
