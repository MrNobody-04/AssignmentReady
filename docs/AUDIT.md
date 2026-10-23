# AssignmentReady — Comprehensive Deep-Dive Architecture Audit

**Date:** October 23, 2026  
**Auditor:** Senior Full-Stack Engineer  
**Status:** STEP 1 COMPLETE — Detailed Codebase Audit (Zero Code Changes)  

---

## 1. System Map & Architecture Overview

AssignmentReady is designed to take an unformatted AI report/assignment, an institutional formatting brief/criteria, an official university cover page (.docx or .pdf), and an optional marking scheme, producing a submission-ready academic document:
`[Cover page, UNCHANGED] → [TOC] → [List of Figures] → [List of Tables] → [Formatted report] → [Marking scheme, UNCHANGED]`

### Technology Stack
- **Backend (`apps/api`):** FastAPI on Python 3.14.
  - Document Processing: `python-docx` for OpenXML generation, `docxcompose` for document-package level merging, `pypdf` & `pymupdf` (fitz) for PDF merging and high-resolution rasterization, `python-pptx` for presentation synthesis.
  - PDF & Print Export: LibreOffice headless and/or Microsoft Word COM automation (`docx2pdf`).
- **Frontend (`apps/web`):** React 18, Vite, TypeScript, Tailwind CSS, Lucide icons.
  - Core views: Guided 4-step wizard (`Workspace.tsx`), Presentation Studio (`PresentationWorkspace.tsx`), Document Health Diagnostics (`DoctorWorkspace.tsx`).
- **Storage & Lifecycle:** Isolated ephemeral directories per job in `apps/api/storage/{job_id}` managed by `JobManager` with TTL cleanup.

### Entry Points & API Endpoints
1. `POST /api/jobs/upload` (`main.py:108`): Receives report (.docx, .pdf, .txt, .md), converts non-docx inputs to base docx, inspects structure.
2. `POST /api/jobs/{job_id}/upload-cover` (`main.py:155`): Receives official cover page.
3. `POST /api/jobs/{job_id}/upload-guidelines` (`main.py:179`): Receives criteria document, parses into structured formatting suggestions.
4. `POST /api/jobs/{job_id}/upload-rubric` (`main.py:216`): Receives optional marking scheme file.
5. `POST /api/jobs/{job_id}/format` (`main.py:292`): Executes document formatting and assembly.
6. `POST /api/presentation/plan-slides` (`presentation_controller.py:82`): Generates structured presentation outline.
7. `POST /api/presentation/generate` (`presentation_controller.py:192`): Builds PowerPoint PPTX.

---

## 2. Root Cause Analysis: Cover Page Modification & Damage

### Root Cause A.1: Shallow Element Copying Skips Media Relationships
- **File:** `apps/api/src/modules/documents/cover_page.py`
- **Lines:** 102–105
- **Mechanism:**
  ```python
  for element in tpl_doc.element.body.iterchildren():
      if element.tag.endswith("}sectPr"):
          continue
      target_p._p.addprevious(deepcopy(element))
  ```
  In OOXML (.docx), logos, crests, and images are stored in `word/media/imageN.png` and referenced in `word/document.xml` via relationship IDs (`r:embed="rIdX"` in `word/_rels/document.xml.rels`). 
  Using `deepcopy(element)` merely copies the XML tags without transferring the media files or relationship entries to the target document package. Consequently, university logos and crests disappear or become corrupted references.

### Root Cause A.2: Skipping `sectPr` and Using a Page Break Merges Cover into Body Section
- **File:** `apps/api/src/modules/documents/cover_page.py`
- **Lines:** 103–108
- **Mechanism:**
  The loop explicitly ignores `w:sectPr` (`if element.tag.endswith("}sectPr"): continue`) and appends a simple page break (`WD_BREAK.PAGE`).
  A page break (`<w:br w:type="page"/>`) does NOT create a new Word section. It forces the cover page and subsequent pages to reside in the same section, causing the cover page to inherit all section-level properties of the report body (margins, orientation, headers, footers).

### Root Cause A.3: Destructive Text Replacement Wipes Styling & Fonts
- **File:** `apps/api/src/modules/documents/cover_page.py`
- **Lines:** 72–90
- **Mechanism:**
  When a placeholder is split across multiple runs (standard Microsoft Word behavior), the fallback `paragraph.text = updated_text` wipes all `<w:r>` child runs in the paragraph. This destroys all font families, sizes, colors, letter spacing, and character styles defined in the university template.

### Root Cause A.4: Global Page Setup & Paragraph Styling Bleed Onto the Cover
- **File:** `apps/api/src/modules/documents/formatter.py`
- **Lines:** 24–37 (`apply_page_setup`) and Lines 75–125 (`apply_document_formatting`)
- **Mechanism:**
  `apply_page_setup` iterates through all document sections (`for section in doc.sections`) setting 1-inch margins. Because the cover is merged into the document before or without an unlinked section break, the cover page's official margins are overwritten. Furthermore, `for p in doc.paragraphs` iterates through all paragraphs applying body/heading formatting.

### Root Cause A.5: Page Numbering Code Erases Cover Footers
- **File:** `apps/api/src/modules/documents/page_numbering.py`
- **Lines:** 48–58
- **Mechanism:**
  ```python
  sec_cover = sections[0]
  if getattr(pn, "hide_on_cover", True):
      sec_cover.different_first_page_header_footer = True
      sec_cover.footer.is_linked_to_previous = False
      for p in sec_cover.footer.paragraphs:
          p.text = ""
  ```
  To hide page numbers on the cover, the code loops over `sec_cover.footer.paragraphs` and sets `p.text = ""`. This erases any existing official footer text, confidentiality notices, department contacts, or crests on the cover page.

### Root Cause A.6: PDF Cover Pages Are Completely Rejected
- **File:** `apps/api/src/main.py`
- **Lines:** 165–167
- **Mechanism:**
  ```python
  if not safe_filename.lower().endswith(".docx"):
      raise FileValidationError("Cover page template must be a Microsoft Word (.docx) document.")
  ```
  Any student attempting to upload an official PDF cover sheet receives an HTTP 422 validation error, even though PDF cover pages are a core academic requirement.

---

## 3. Analysis: Where Formatting Rules Leak

| Location in Code | Target Modified | Risk / Leakage to Cover or Marking Scheme |
| :--- | :--- | :--- |
| `formatter.py:24–36` (`apply_page_setup`) | `doc.sections` | Overwrites section margins (top, bottom, left, right) across all sections. Leaks if cover is in shared section. |
| `formatter.py:80–125` (`apply_document_formatting`) | `doc.paragraphs` | Traverses every paragraph in `doc.paragraphs`. If cover or rubric paragraphs are part of `doc.paragraphs` during formatting, their font, size, alignment, and line spacing are forcefully replaced. |
| `formatter.py:126–134` (`preserve_tables`) | `doc.tables` | Overwrites table cell font and size with body font. Destroys formatting of tables inside cover pages and rubrics. |
| `page_numbering.py:52–57` | `sec_cover.footer` | Explicitly clears all footer paragraphs on Section 0, erasing official cover footers. |
| `marking_scheme.py:79–110` | Document End | Instead of preserving the uploaded rubric file, it synthesizes an artificial 4-column table, throwing away the student's real rubric. |

---

## 4. UI/UX Analysis: Why the Flow is Hard to Use

1. **Too Many Fragmented Steps (7 Steps):**
   - The user has to click through `UploadStep` → `CollegeRulesStep` → `CoverPageStep` → `FrontMatterStep` → `RequirementsStep` → `ReviewComplianceStep` → `DownloadStep`.
2. **Confusing & Conflicting State Overwrites:**
   - In Step 2 (`CollegeRulesStep`), clicking a preset profile resets `settings.cover_page.mode = "builtin"`, silently discarding the template uploaded in Step 1.
3. **Redundant Forms for Opaque Assets:**
   - Step 3 (`CoverPageStep`) presents extensive text fields (Student Name, ID, Lecturer, Course Code) that make users think the app is going to re-type their cover page rather than preserving their official uploaded document.
4. **Lack of Instant Visual Feedback:**
   - No preview thumbnail of the uploaded cover page in Step 1.
   - No side-by-side or page-by-page inspection on the final step showing the exact cover on Page 1.
5. **No Direct PPT Shortcut:**
   - Users who only want to generate PowerPoint slides from an existing assignment are forced to navigate through document formatting.

---

## 5. Architectural Solution: The "Opaque Asset" Principle

To guarantee 100% fidelity:
1. **Opaque Asset Isolation:** The uploaded cover page (.docx or .pdf) and marking scheme (.docx or .pdf) must NEVER be parsed, converted to text/HTML/Markdown, re-styled, or regenerated.
2. **Document-Package Level Composition (DOCX):** Use `docxcompose` to merge the cover package and marking scheme package into the formatted report body. This preserves all XML parts: styles, fonts, images, media relationships, numbering, headers, footers, and section properties (`sectPr`).
3. **PDF-Level Composition (PDF):** Keep PDF cover pages as native vector PDF. When exporting PDF via headless LibreOffice or Word COM, use `pypdf` to insert the original PDF cover page as Page 1 (byte-identical). For DOCX export, embed a high-resolution rasterized rendering (300 DPI via `pymupdf`) as Section 1 and display an informative notice to the user.
4. **Independent Sections:** The cover page must be in its own distinct section with unlinked headers/footers and isolated margins, followed by a Next-Page Section Break.
5. **Integrity Verification:** Post-generation SHA-256 hash or XML equivalence check against the original cover page. If any deviation is detected, the build halts immediately with a clear error.
6. **4-Step Wizard:** Upload (3 zones + optional 4th + cover thumbnail + PPT shortcut) → Review (editable criteria config + locked cover toggle) → Generate (animated status) → Download (DOCX, PDF, PPT + page-by-page preview).
