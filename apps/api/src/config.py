import os
import shutil
from pathlib import Path
from pydantic import BaseModel

class AppConfig(BaseModel):
    app_name: str = "AssignmentReady API"
    environment: str = os.getenv("ENVIRONMENT", "development")
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
    base_dir: Path = Path(__file__).resolve().parent.parent
    storage_dir: Path = base_dir / "storage"
    max_upload_size_bytes: int = 25 * 1024 * 1024  # 25 MB
    job_ttl_seconds: int = 3600  # 1 hour auto cleanup
    allowed_assignment_extensions: list[str] = [".docx"]
    allowed_guideline_extensions: list[str] = [".docx", ".pdf", ".txt"]
    libreoffice_path: str | None = None

    def setup_directories(self) -> None:
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def detect_libreoffice(self) -> str | None:
        # Check standard paths
        candidates = [
            shutil.which("soffice"),
            shutil.which("libreoffice"),
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
            "/usr/bin/soffice",
            "/usr/bin/libreoffice",
            "/Applications/LibreOffice.app/Contents/MacOS/soffice",
        ]
        for candidate in candidates:
            if candidate and Path(candidate).is_file():
                self.libreoffice_path = candidate
                return candidate
        self.libreoffice_path = None
        return None

config = AppConfig()
config.setup_directories()
config.detect_libreoffice()
