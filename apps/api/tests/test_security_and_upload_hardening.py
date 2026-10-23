import io
import zipfile
import pytest
from fastapi.testclient import TestClient

from src.main import app
from src.common.security import (
    sanitize_filename,
    detect_and_validate_upload,
    validate_docx_bytes,
)
from src.common.errors import FileValidationError
from src.modules.jobs.job_manager import job_manager

client = TestClient(app)


def test_health_endpoints():
    for endpoint in ["/health", "/api/health"]:
        res = client.get(endpoint)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] in ["healthy", "ok"]
        assert "version" in data
        assert "git_commit" in data
        assert "word_com_available" in data
        assert "libreoffice_available" in data
        assert data["storage_ready"] is True


def test_filename_sanitization():
    assert sanitize_filename("../../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\windows\\system32\\cmd.exe") == "cmd.exe"
    assert sanitize_filename("my assignment (draft #1) [final].docx") == "my_assignment__draft__1___final_.docx"
    assert sanitize_filename("") == "document.docx"


def test_executable_disguised_as_docx_rejected():
    fake_exe = b"MZ\x90\x00\x03\x00\x00\x00" + b"\x00" * 100
    with pytest.raises(FileValidationError):
        detect_and_validate_upload(fake_exe, "malicious.docx", [".docx"])

    fake_elf = b"\x7fELF\x01\x01\x01\x00" + b"\x00" * 100
    with pytest.raises(FileValidationError):
        detect_and_validate_upload(fake_elf, "malicious.docx", [".docx"])


def test_macro_enabled_docm_rejected():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("[Content_Types].xml", '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/vbaProject.bin" ContentType="application/vnd.ms-office.vbaProject"/></Types>')
        z.writestr("word/vbaProject.bin", b"fake macro binary code")
        z.writestr("word/document.xml", "<w:document><w:body/></w:document>")

    docm_bytes = buf.getvalue()
    with pytest.raises(FileValidationError, match="contains macros or VBA code|macro-enabled"):
        validate_docx_bytes(docm_bytes, "exploit.docm")

    with pytest.raises(FileValidationError, match="contains macros or VBA code|macro-enabled"):
        detect_and_validate_upload(docm_bytes, "exploit.docm", [".docx"])


def test_oversized_file_rejected():
    # File larger than 25 MB
    fake_large_bytes = b"PK\x03\x04" + b"\x00" * (25 * 1024 * 1024 + 100)
    with pytest.raises(FileValidationError, match="exceeds maximum allowed size of 25 MB"):
        detect_and_validate_upload(fake_large_bytes, "huge.docx", [".docx"])


def test_upload_api_rejects_disguised_file():
    fake_exe = b"MZ\x90\x00" + b"\x00" * 200
    res = client.post(
        "/api/jobs/upload",
        files={"file": ("exploit.docx", fake_exe, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert res.status_code == 400
    res_json = res.json()
    err_msg = res_json.get("error", {}).get("message", "") or res_json.get("detail", "")
    assert len(err_msg) > 0
