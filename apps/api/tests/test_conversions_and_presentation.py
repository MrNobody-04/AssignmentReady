import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from src.main import app
from src.common.format_detector import detect_file_format
from src.modules.presentation.ppt_generator import (
    PresentationOutline,
    SlideItem,
    generate_powerpoint_presentation,
    THEMES,
)
from src.modules.converters.universal_converter import (
    sanitize_output_filename,
    convert_image_to_pdf,
    convert_csv_to_xlsx,
    convert_txt_to_docx,
)

client = TestClient(app)

def test_format_detector():
    # PDF magic bytes
    pdf_sample = b"%PDF-1.4 header text"
    assert detect_file_format(pdf_sample, "file.bin") == "pdf"

    # PNG magic bytes
    png_sample = b"\x89PNG\r\n\x1a\n\x00\x00"
    assert detect_file_format(png_sample, "file.bin") == "png"

    # JPEG magic bytes
    jpg_sample = b"\xff\xd8\xff\xe0"
    assert detect_file_format(jpg_sample, "file.bin") == "jpeg"

    # Text detection
    txt_sample = b"Simple academic text notes."
    assert detect_file_format(txt_sample, "notes.txt") == "txt"

def test_sanitize_output_filename():
    assert sanitize_output_filename("Assignment 1.docx", "default", ".pdf") == "Assignment 1.pdf"
    assert sanitize_output_filename("Final Draft", "default", "pptx") == "Final Draft.pptx"
    assert sanitize_output_filename("", "Original_Doc", ".docx") == "Original_Doc.docx"
    assert sanitize_output_filename("Bad:Name/With*Chars", "default", ".xlsx") == "Bad_Name_With_Chars.xlsx"

def test_image_to_pdf_conversion():
    img = Image.new("RGB", (120, 120), color=(30, 58, 138))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pdf_bytes = convert_image_to_pdf(buf.getvalue())
    assert pdf_bytes.startswith(b"%PDF-")

def test_csv_to_xlsx_conversion():
    csv_bytes = b"Student,Assignment,Score\nAlice,A1,92\nBob,A1,88\n"
    xlsx_bytes = convert_csv_to_xlsx(csv_bytes)
    assert xlsx_bytes.startswith(b"PK\x03\x04")

def test_presentation_generator():
    outline = PresentationOutline(
        title="Impact of Large Language Models on Higher Education",
        subtitle="Literature Review & Evaluation",
        author="Sujan G.C.",
        institution="University Department of Computer Science",
        slides=[
            SlideItem(
                title="Introduction & Context",
                category="Background",
                bullets=[
                    "Rapid adoption of generative AI by university students.",
                    "Discrepancies in academic formatting and referencing standards.",
                ],
            ),
            SlideItem(
                title="Key Findings",
                category="Analysis",
                bullets=[
                    "Over 75% of submissions require re-formatting for compliance.",
                    "Automated rule engines streamline institutional formatting.",
                ],
                slide_type="conclusion",
            ),
        ],
    )

    for theme_key in THEMES.keys():
        pptx_bytes = generate_powerpoint_presentation(outline, theme_key=theme_key)
        assert len(pptx_bytes) > 10000
        assert pptx_bytes.startswith(b"PK\x03\x04")

def test_api_conversions_registry():
    res = client.get("/api/conversions/registry")
    assert res.status_code == 200
    data = res.json()
    assert "registry" in data
    assert "docx" in data["registry"]
    assert "image" in data["registry"]
    assert "csv" in data["registry"]

def test_api_convert_image_to_pdf():
    img = Image.new("RGB", (50, 50), color="red")
    buf = io.BytesIO()
    img.save(buf, format="PNG")

    res = client.post(
        "/api/conversions/convert",
        files={"file": ("diagram.png", buf.getvalue(), "image/png")},
        data={"target_format": "pdf", "custom_filename": "My_Diagram_PDF"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["target_format"] == "pdf"
    assert data["output_filename"] == "My_Diagram_PDF.pdf"
    assert "conversion_id" in data

    # Test download endpoint
    dl = client.get(data["download_url"])
    assert dl.status_code == 200
    assert dl.content.startswith(b"%PDF-")

def test_api_presentation_generate():
    req_payload = {
        "outline": {
            "title": "Machine Learning in Healthcare",
            "subtitle": "Diagnostics and Trends",
            "author": "Test Author",
            "institution": "University Hospital",
            "slides": [
                {
                    "title": "Overview of Medical Imaging",
                    "category=" : "Overview",
                    "bullets": ["CNN architectures in radiology", "Detection speedup"],
                    "slide_type": "content",
                }
            ],
        },
        "theme": "modern_minimal",
        "custom_filename": "ML_Presentation",
    }

    res = client.post("/api/presentation/generate", json=req_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["filename"] == "ML_Presentation.pptx"
    assert "presentation_id" in data

    # Download presentation
    dl = client.get(data["download_url"])
    assert dl.status_code == 200
    assert dl.content.startswith(b"PK\x03\x04")
