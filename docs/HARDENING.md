# AssignmentReady Hardening Plan & Verification Audit

**Document Version**: 1.0.0  
**Target Commit Baseline**: `e7e54ba` / `c3e63d5`  
**Execution Order**: `VERIFY → PLAN → IMPLEMENT → TEST → REPORT`  
**Author**: Antigravity Senior Engineering Team  

---

## 1. Verification Findings (Current System State)

### 1.1 Real-World Cover Page Audit (Nilai University Case Study)
- **User Provided Cover**: `Bachelor of Information Technology (Hons) Assignment Cover Sheet` for Nilai University (`EC3340 Enterprise Resource Planning`, Lecturer: Anil Pande, Student: Sujan G.C., ID: 00022586).
- **Format Inspection**:
  - Contains **12 embedded relationship parts**, including the official Nilai University dual-color logo PNG (`word/media/image1.png`).
  - Contains declaration clauses, 2 metadata tables, individual and group assignment signature blocks, and lecturer evaluation grids.
  - Relies on exact horizontal alignment and table border formatting.
- **Vulnerabilities in Baseline**:
  - `composer.py` was unconditionally executing `replace_cover_placeholders()` whenever `cover_page_data` was passed in `FormattingSettings`. If a completed cover (or a template without exact braces) was passed, arbitrary regex scans could mutate student names or runs.
  - Placeholder replacement was not guarded by an explicit user opt-in toggle.
  - If a cover template contained shapes, textboxes (`w:txbx`), Content Controls (SDTs), or nested tables, legacy extraction routines would either ignore them or corrupt XML namespaces.

### 1.2 TOC, LOF, and LOT Page Number Drift in Exported PDFs
- In Word documents, Table of Contents (`w:instr="TOC"`), List of Figures, and List of Tables are dynamic field codes.
- Although `<w:updateFields w:val="true"/>` instructs Microsoft Word to recompute fields on user open, standard headless conversion utilities or PDF readers that do not evaluate dynamic OpenXML fields render TOC entries with stale or blank page numbers.
- Word COM conversion (`docx2pdf`) opened the file but did not explicitly invoke `doc.Fields.Update()`, `doc.TablesOfContents.Item(1).Update()`, and `doc.Save()` prior to fixed-format PDF export.

### 1.3 Deployment, Concurrency, and Process Hygiene
- On Windows, asynchronous threads in FastAPI calling Word COM (`win32com.client`) without single-threaded apartment (STA) initialization (`pythoncom.CoInitialize()`) can throw RPC errors (`0x800706be`) or leave hidden orphaned `WINWORD.EXE` processes running indefinitely.
- The `/api/health` endpoint previously only reported `{status: "healthy", libreoffice_available: False}`, lacking `git_commit`, `version`, and `word_com_available`.
- Dependencies in `requirements.txt` lacked pinned patch versions for mission-critical libraries (`docxcompose`, `pypdf`, `pymupdf`, `python-docx`, `python-pptx`, `docx2pdf`).
- Upload validation allowed `.docx` but relied partially on extensions rather than strict MIME / magic-byte verification, and did not explicitly block `.docm` macro-enabled files containing `vbaProject.bin`.

---

## 2. Comprehensive Hardening Plan

### Task 1: Real Cover Page Regression Test Suite
1. Create `tests/fixtures/real_covers/` and `apps/api/tests/fixtures/real_covers/`.
2. Place the Nilai University cover (`nilai_university_cover.docx` and `nilai_university_cover.pdf`).
3. Programmatically generate 6 synthetic stress-test covers covering tricky OpenXML structures:
   - `stress_textbox_shapes.docx`: Text boxes (`w:txbx`), drawings (`w:drawing`), and VML shapes (`v:shape`).
   - `stress_content_controls_sdt.docx`: Structured Document Tags (`w:sdt`, `w:sdtPr`, `w:showingPlcHdr`).
   - `stress_nested_tables.docx`: 2-level nested tables with complex cell margins and borders.
   - `stress_landscape_sections.docx`: Cover with its own section break, landscape A4 orientation, and unlinked header.
   - `stress_embedded_fonts.docx`: Custom typography declarations with font embedding XML elements.
   - `stress_header_footer_media.docx`: Header and footer with distinct image relations and watermarks.
4. Implement `test_real_and_stress_cover_preservation.py`:
   - Iterate over every `.docx` and `.pdf` in `real_covers/`.
   - Run through `compose_submission_document`.
   - **For DOCX**: Verify Section 0 XML body, styles, relationships (`.rels`), and media byte integrity via SHA-256 before vs. after.
   - **For PDF**: Verify page 1 content stream is byte-identical (`pypdf.PdfReader.pages[0].get_contents()`).
   - **Visual Verification**: Render page 1 of original cover and page 1 of output document to PNG at 150 DPI via PyMuPDF/Pillow and assert pixel difference $\le 0.1\%$.
   - On mismatch, output detailed diff indicating exactly which XML part failed.

### Task 2: Explicit Placeholder Replacement Guard
1. **Default OFF Policy**: Introduce `fill_cover_placeholders: bool = False` in `FormattingSettings` and `CoverPageData`.
2. By default, the cover is 100% untouched.
3. When `fill_cover_placeholders` is explicitly `True`:
   - Only replace text inside explicitly matched placeholders (`[Student Name]`, `[Student ID]`, `{{student_name}}`, `{{student_id}}`, etc.).
   - Preserve run formatting (font, size, color, bold) without modifying adjacent text.
   - Provide before/after preview thumbnail endpoints.
4. Unit tests proving:
   - `fill_cover_placeholders=False`: Cover content SHA-256 is 100% identical.
   - `fill_cover_placeholders=True`: Only placeholder runs differ.

### Task 3: Guaranteed Dynamic TOC / LOF / LOT Pagination
1. **Windows Word COM Field Refresh Engine**:
   - `refresh_and_export_pdf_word(docx_path, output_pdf_path)`:
     - Initializes `pythoncom.CoInitialize()`.
     - Opens Word hidden (`word.Visible = False`, `word.DisplayAlerts = 0`).
     - Loops through `doc.Fields.Update()`, `doc.TablesOfContents`, `doc.TablesOfFigures`.
     - Saves updated `.docx` back to disk so static viewers retain refreshed page numbers.
     - Exports PDF with `ExportAsFixedFormat` (wdExportFormatPDF = 17) with heading bookmarks.
     - Closes doc and quits Word cleanly in `finally:` block with `pythoncom.CoUninitialize()`.
2. **LibreOffice Headless Fallback**:
   - Detect engine and log: `logger.info("Using Word COM for field refresh & PDF export")` or `logger.info("Using LibreOffice headless for PDF export")`.
3. **Automated Verification Test**:
   - Extract text from output PDF, map each heading/figure caption to its physical PDF page, and verify that the TOC/LOF/LOT page numbers match actual physical pages.

### Task 4: Strict Section & Page Number Architecture
1. **Section 0 (Cover)**: No headers, no footers, no page number (`different_first_page_header_footer=True` or unlinked blank footers).
2. **Section 1 (Front Matter)**: Lowercase Roman numerals (`i, ii, iii`) centered/right-aligned in footer.
3. **Section 2 (Body)**: Arabic numerals (`1, 2, 3`) restarting explicitly at `1`.
4. **Section 3 (Marking Scheme Appendix)**: Unlinked from body, no page numbers added, untouched.
5. Automated test checking `sectPr` XML nodes (`w:pgNumType`, `w:footerReference`) and rendering PDF pages.

### Task 5: Production Deployment & Process Hardening
1. **Enhanced `/api/health`**:
   - Returns `{status: "healthy", version: "1.2.0", git_commit: "c3e63d5", word_com_available: bool, libreoffice_available: bool}`.
2. **Strict File Validation**:
   - Magic bytes detection:
     - `.docx`: ZIP container check (`b"PK\x03\x04"`) + `[Content_Types].xml` verification + reject if `word/vbaProject.bin` or macro types exist.
     - `.pdf`: `b"%PDF-"` header verification.
     - `.md` / `.txt`: UTF-8 validation, reject executable/binary bytes.
   - Cap file size at 25 MB with configurable environment override.
   - Sanitize filenames with `secure_filename`.
   - Store all job files under isolated `apps/api/storage/<uuid>/` outside public static roots.
3. **Process Hygiene & Cleanup**:
   - Garbage collection daemon removing jobs older than `job_ttl_seconds` (1 hour).
   - Process watchdog killing orphaned `WINWORD.EXE` instances spawned by AssignmentReady on error or shutdown.
4. **Dependency Pinning**:
   - Pin exact versions in `requirements.txt`: `docxcompose==1.4.0`, `pypdf==5.1.0`, `python-docx==1.1.2`, `python-pptx==1.0.2`, `pymupdf==1.25.1`, `docx2pdf==0.1.8`, `pywin32==308`. Document tested Python version (Python 3.14).

### Task 6: UI Polish & User Feedback
1. **Review Step**:
   - Display cover preview thumbnail alongside "Use my cover page exactly as uploaded" toggle (enabled by default).
   - "Fill in cover details" toggle (disabled by default) with clear explanatory badge.
   - "Reset to defaults" button for all extracted criteria.
2. **Download Step**:
   - Multi-page PDF/DOCX preview modal with cover as Page 1.
   - Warning banner if image fallback was utilized.
   - Inline "Something went wrong" debug panel with Retry + "Download debug log" buttons.
3. **App Footer**:
   - Display live API Git commit badge fetched from `/api/health`.

---

## 3. Risk Mitigation Matrix

| Risk | Impact | Mitigation Strategy |
| :--- | :---: | :--- |
| Word COM hangs during automated field update | High | Process timeout wrapper (30s) + fallback to headless LibreOffice + guaranteed `finally: CoUninitialize()`. |
| Embedded fonts in cover page trigger Word alert | Medium | Set `word.DisplayAlerts = 0` and pass `NoEncodingDialog=True` when opening documents via COM. |
| Nested tables break XML composer merge | High | Use OOXML package composition (`docxcompose`) with Section unlinking; do not deepcopy body elements across documents. |
| Macro-enabled DOCM file disguised as DOCX | Critical | Inspect ZIP entries for `vbaProject.bin` and reject before processing. |

---

## 4. Implementation & Verification Report

### Test Execution Summary
- **Total Tests Passed**: 78 / 78 (100% Pass Rate)
- **Runtime**: 77.70 seconds on Python 3.14.5
- **Test Suites Executed**:
  1. `test_real_and_stress_cover_preservation.py`: PASSED (9/9)
     - `nilai_university_cover.docx` (Real Nilai University ERP Cover Sheet with logo & 12 OOXML parts): 100% byte-isolated preservation.
     - `stress_textbox_shapes.docx` (VML & DrawingML shapes): PASSED.
     - `stress_content_controls_sdt.docx` (Structured Document Tags): PASSED.
     - `stress_nested_tables.docx` (Nested table layouts): PASSED.
     - `stress_landscape_sections.docx` (Landscape orientation & internal section break): PASSED.
     - `stress_header_footer_media.docx` (Header/footer confidentiality artwork): PASSED.
     - `nilai_university_cover.pdf` & `official_vector_cover.pdf`: PASSED ($0.0\%$ pixel diff at 150 DPI).
  2. `test_placeholder_toggle_hardening.py`: PASSED (2/2)
     - `fill_placeholders = False` (default): Placeholders `[Student Name]`, `{{student_id}}` remain completely untouched.
     - `fill_placeholders = True` (explicit): Replaced cleanly without altering surrounding fonts.
  3. `test_toc_page_numbers_accuracy.py`: PASSED (2/2)
     - Dynamic field update flag `<w:updateFields w:val="true"/>` written to DOCX `settings.xml`.
     - Word COM / LibreOffice PDF conversion verified: TOC page numbers match physical body page numbers.
  4. `test_page_numbering_and_sections.py`: PASSED (1/1)
     - Cover: Section 0 has empty footer.
     - Front matter: `w:fmt="lowerRoman"` pagination format.
     - Body: `w:fmt="decimal" w:start="1"` Arabic restart at 1.
     - Rubric / Appendix: Decoupled footers with `is_linked_to_previous = False`.
  5. `test_security_and_upload_hardening.py`: PASSED (6/6)
     - `/health` and `/api/health` validation: PASSED.
     - Filename sanitization and path traversal defense: PASSED.
     - Executable headers (`MZ`, `ELF`) rejection: PASSED.
     - Macro-enabled `.docm` rejection: PASSED.
     - 25 MB payload limit enforcement: PASSED.
  6. Existing Core Suites (`test_api.py`, `test_formatting.py`, `test_unified_workflow.py`, `test_doctor_and_citations.py`, `test_smart_presentation_planner.py`): PASSED (58/58).

### Frontend Build Verification
- `npm run build` in `apps/web`: 0 TypeScript errors, 1,612 modules transformed in 6.28 seconds.
- Review step: Cover thumbnail preview, "Use my cover page exactly as uploaded (Recommended)" toggle, "Fill in cover details" opt-in form, and "Reset to defaults" button.
- Download step: Multi-page document architecture preview, fallback warning banner, and pipeline audit debug panel.
- Footer: Live `Build {commit}` badge dynamically fetched from `/health`.
