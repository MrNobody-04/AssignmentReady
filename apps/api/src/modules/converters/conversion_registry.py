from typing import Literal
from pydantic import BaseModel
from src.modules.documents.converter import is_libreoffice_available

class ConversionOption(BaseModel):
    target_format: str
    target_label: str
    extension: str
    mime_type: str
    available: bool
    description: str

class InputFormatInfo(BaseModel):
    format_key: str
    label: str
    extensions: list[str]
    mime_types: list[str]
    allowed_outputs: list[ConversionOption]

def get_conversion_registry() -> dict[str, InputFormatInfo]:
    """
    Returns the comprehensive registry of supported input-to-output conversions
    and their live availability based on server environment capabilities.
    """
    has_lo = is_libreoffice_available()

    registry = {
        "docx": InputFormatInfo(
            format_key="docx",
            label="Microsoft Word Document (.docx)",
            extensions=[".docx"],
            mime_types=["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
            allowed_outputs=[
                ConversionOption(
                    target_format="pptx",
                    target_label="PowerPoint Presentation (.pptx)",
                    extension=".pptx",
                    mime_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    available=True,
                    description="Convert document sections and key findings into structured presentation slides.",
                ),
                ConversionOption(
                    target_format="txt",
                    target_label="Plain Text (.txt)",
                    extension=".txt",
                    mime_type="text/plain",
                    available=True,
                    description="Extract all paragraph text without formatting.",
                ),
                ConversionOption(
                    target_format="pdf",
                    target_label="Portable Document Format (.pdf)",
                    extension=".pdf",
                    mime_type="application/pdf",
                    available=has_lo,
                    description="Convert Word document to PDF (Requires headless LibreOffice).",
                ),
            ],
        ),
        "pdf": InputFormatInfo(
            format_key="pdf",
            label="Portable Document Format (.pdf)",
            extensions=[".pdf"],
            mime_types=["application/pdf"],
            allowed_outputs=[
                ConversionOption(
                    target_format="docx",
                    target_label="Microsoft Word (.docx)",
                    extension=".docx",
                    mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    available=True,
                    description="Extract text and structural sections into an editable Microsoft Word document.",
                ),
                ConversionOption(
                    target_format="pptx",
                    target_label="PowerPoint Presentation (.pptx)",
                    extension=".pptx",
                    mime_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    available=True,
                    description="Synthesize key sections from the PDF into presentation slides.",
                ),
                ConversionOption(
                    target_format="txt",
                    target_label="Plain Text (.txt)",
                    extension=".txt",
                    mime_type="text/plain",
                    available=True,
                    description="Extract clean text from all pages in the PDF document.",
                ),
            ],
        ),
        "image": InputFormatInfo(
            format_key="image",
            label="Images (.png, .jpg, .jpeg, .webp, .bmp, .tiff)",
            extensions=[".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"],
            mime_types=["image/png", "image/jpeg", "image/webp", "image/bmp", "image/tiff"],
            allowed_outputs=[
                ConversionOption(
                    target_format="pdf",
                    target_label="High-Quality PDF Document (.pdf)",
                    extension=".pdf",
                    mime_type="application/pdf",
                    available=True,
                    description="Convert image into a crisp, printable PDF document with preserved DPI.",
                ),
                ConversionOption(
                    target_format="png",
                    target_label="PNG Image (.png)",
                    extension=".png",
                    mime_type="image/png",
                    available=True,
                    description="Convert image to lossless PNG format.",
                ),
                ConversionOption(
                    target_format="jpeg",
                    target_label="JPEG Image (.jpg)",
                    extension=".jpg",
                    mime_type="image/jpeg",
                    available=True,
                    description="Convert image to compressed JPEG format.",
                ),
            ],
        ),
        "csv": InputFormatInfo(
            format_key="csv",
            label="CSV Data File (.csv)",
            extensions=[".csv"],
            mime_types=["text/csv", "application/vnd.ms-excel"],
            allowed_outputs=[
                ConversionOption(
                    target_format="xlsx",
                    target_label="Microsoft Excel Workbook (.xlsx)",
                    extension=".xlsx",
                    mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    available=True,
                    description="Convert raw CSV into a formatted Excel spreadsheet with styled headers and auto-column widths.",
                ),
                ConversionOption(
                    target_format="docx",
                    target_label="Word Table (.docx)",
                    extension=".docx",
                    mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    available=True,
                    description="Render CSV rows and columns into an academic Word table.",
                ),
            ],
        ),
        "txt": InputFormatInfo(
            format_key="txt",
            label="Plain Text File (.txt)",
            extensions=[".txt", ".md"],
            mime_types=["text/plain", "text/markdown"],
            allowed_outputs=[
                ConversionOption(
                    target_format="docx",
                    target_label="Microsoft Word Document (.docx)",
                    extension=".docx",
                    mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    available=True,
                    description="Convert plain text notes into a standard academic Word document.",
                ),
                ConversionOption(
                    target_format="pptx",
                    target_label="PowerPoint Presentation (.pptx)",
                    extension=".pptx",
                    mime_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    available=True,
                    description="Convert bulleted or outlined text into presentation slides.",
                ),
            ],
        ),
    }

    return registry
