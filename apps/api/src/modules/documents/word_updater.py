"""Microsoft Word COM Automation Engine for Field Updating and PDF Export.

Runs in-process or as an isolated subprocess on Windows:
1. Initializes pythoncom in STA mode.
2. Opens the document in headless Microsoft Word.
3. Updates all dynamic fields (doc.Fields, doc.TablesOfContents, doc.TablesOfFigures).
4. Saves the updated DOCX back to disk so static viewers retain refreshed page numbers.
5. Exports directly to PDF with true heading bookmarks and vector formatting.
"""

import sys
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


def update_fields_and_export_pdf_word(docx_path: Path, output_pdf_path: Path) -> bool:
    """Refreshes Word fields (TOC, LOF, LOT, page numbers), saves the DOCX with updated

    field cache, and exports to PDF with exact matching page numbers.
    """
    if os.name != "nt":
        return False

    try:
        import pythoncom
        import win32com.client
    except ImportError:
        return False

    pythoncom.CoInitialize()
    word = None
    doc = None
    try:
        word = win32com.client.DispatchEx("Word.Application")
        word.Visible = False
        word.DisplayAlerts = 0  # wdAlertsNone
        doc = word.Documents.Open(
            FileName=str(docx_path.resolve()),
            ConfirmConversions=False,
            ReadOnly=False,
            AddToRecentFiles=False,
            NoEncodingDialog=True,
        )

        # 1. Update all general fields
        try:
            for f in doc.Fields:
                try:
                    f.Update()
                except Exception:
                    pass
        except Exception:
            pass

        # 2. Update Table of Contents
        try:
            for toc in doc.TablesOfContents:
                try:
                    toc.Update()
                except Exception:
                    pass
        except Exception:
            pass

        # 3. Update Table of Figures
        try:
            for tof in doc.TablesOfFigures:
                try:
                    tof.Update()
                except Exception:
                    pass
        except Exception:
            pass

        # 4. Save DOCX with refreshed field values
        try:
            doc.Save()
        except Exception:
            pass

        # 5. Export directly to fixed-format PDF (wdExportFormatPDF = 17)
        output_pdf_path.parent.mkdir(parents=True, exist_ok=True)
        doc.ExportAsFixedFormat(
            OutputFileName=str(output_pdf_path.resolve()),
            ExportFormat=17,
            OpenAfterExport=False,
            OptimizeFor=0,  # wdExportOptimizeForPrint
            CreateBookmarks=1,  # wdExportCreateHeadingBookmarks
            DocStructureTags=True,
            BitmapMissingFonts=True,
            UseISO19005_1=False,
        )
        return output_pdf_path.exists() and output_pdf_path.stat().st_size > 500
    except Exception as e:
        logger.warning(f"Word COM field update & export error: {e}")
        return False
    finally:
        if doc:
            try:
                doc.Close(SaveChanges=False)
            except Exception:
                pass
        if word:
            try:
                word.Quit()
            except Exception:
                pass
        pythoncom.CoUninitialize()


def is_word_com_available() -> bool:
    """Checks whether Word COM automation is functional on the current system without triggering COM crashes."""
    if os.name != "nt":
        return False
    try:
        import winreg
        key = winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, r"Word.Application\CurVer")
        val = winreg.QueryValue(key, "")
        winreg.CloseKey(key)
        return bool(val)
    except Exception:
        return False


if __name__ == "__main__":
    if len(sys.argv) >= 3:
        src = Path(sys.argv[1])
        dst = Path(sys.argv[2])
        success = update_fields_and_export_pdf_word(src, dst)
        sys.exit(0 if success else 1)
