from pathlib import Path
from src.common.errors import DocumentProcessingError

def extract_text_from_pdf(pdf_path: Path, max_pages: int = 50) -> str:
    """
    Extracts plain text from a PDF file using pypdf.
    """
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(pdf_path))
        extracted_text = []
        for i, page in enumerate(reader.pages[:max_pages]):
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        return "\n\n".join(extracted_text)
    except Exception as e:
        # Fallback to PyMuPDF if available
        try:
            import fitz
            doc = fitz.open(str(pdf_path))
            pages = [doc[p].get_text() for p in range(min(len(doc), max_pages))]
            return "\n\n".join(pages)
        except Exception:
            raise DocumentProcessingError(f"Could not extract text from guideline PDF: {str(e)}")
