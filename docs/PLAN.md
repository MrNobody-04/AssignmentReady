# AssignmentReady — Comprehensive Implementation Plan

**Date:** October 23, 2026  
**Author:** Senior Full-Stack Engineer  
**Status:** STEP 2 COMPLETE — Architectural Blueprint & File-by-File Task List  

---

## 1. Architectural Blueprint & The "Opaque Asset" Pattern

```
                       ┌─────────────────────────┐
                       │  Official Cover Page    │ (DOCX or PDF)
                       │  [OPAQUE ASSET]         │ NEVER parsed or re-styled
                       └────────────┬────────────┘
                                    │
┌──────────────────────────┐        │
│  AI Report / Assignment  │        │
│  (.docx, .pdf, .txt, .md)│        │
└────────────┬─────────────┘        │
             ▼                      │
┌──────────────────────────┐        │
│  Normalize AI Output     │        │
│  - Strip markdown (**, #)│        │
│  - Tables & SEQ captions │        │
└────────────┬─────────────┘        │
             ▼                      │
┌──────────────────────────┐        │
│  Format Report Body      │        │
│  - Word Styles (Normal,  │        │
│    Heading 1-3, Caption) │        │
│  - Dynamic TOC, LOF, LOT │        │
│  - Margins & Spacing     │        │
└────────────┬─────────────┘        │
             ▼                      │
┌──────────────────────────┐        │
│  Document Package Merger │◄───────┘
│  (docxcompose / pypdf)   │
│  - Cover in Section 1    │◄───────┐
│  - Report in Section 2+  │        │
│  - Marking Scheme (End)  │        │
└────────────┬─────────────┘        │
             ▼                      │
┌──────────────────────────┐        │
│  Cover Integrity Check   │        │
│  - Hash / XML Match      │        │
│  - Fail build if broken  │        │
└────────────┬─────────────┘        │
             ▼                      │
┌──────────────────────────┐        │ ┌─────────────────────────┐
│ Final Output Documents   │        └─┤ Optional Marking Scheme │
│ - DOCX (docxcompose)     │          │ [OPAQUE ASSET]          │
│ - PDF (Native / Merged)  │          │ (DOCX or PDF)           │
│ - PPTX (Slide Generator) │          └─────────────────────────┘
└──────────────────────────┘
```

---

## 2. File-by-File Task List

### Backend Tasks (`apps/api/`)

#### 1. Document Package Composition & Cover Preservation
- **`apps/api/src/modules/documents/composer.py` (NEW):**
  - Implement `compose_submission_document`:
    - Handles DOCX cover merge via `docxcompose.composer.Composer`.
    - Handles PDF cover merge via `pypdf` for PDF export, and 300 DPI `pymupdf` image section for DOCX fallback.
    - Appends optional marking scheme at the end in its own section.
    - Computes cover hash pre-merge and post-merge to enforce 100% integrity.
  - Implement `verify_cover_integrity`:
    - Compares original cover section XML elements and body against output document section 1.
    - Throws `CoverIntegrityError` if any deviation or font bleed is detected.

#### 2. Criteria Extraction & Structured Configuration
- **`apps/api/src/modules/documents/guideline_analyzer.py` (UPDATE):**
  - Enhance regex and NLP rules to extract:
    - Font family, body font size, heading 1/2/3 font sizes & bold/italic.
    - Line spacing (1.0, 1.15, 1.5, 2.0).
    - Paragraph spacing (before, after).
    - Text alignment (justified, left).
    - Margins (top, bottom, left, right).
    - Referencing style (APA, Harvard, IEEE, MLA, Chicago).
    - Caption formatting style.
  - Return JSON config with confidence scores and sensible defaults.

#### 3. Report Body Formatting Engine & AI Normalization
- **`apps/api/src/modules/documents/formatter.py` (REFACTOR):**
  - Apply formatting **strictly to the report body**, before package composition.
  - Define formatting on real Word styles (`Normal`, `Heading 1`, `Heading 2`, `Heading 3`, `Caption`) in `doc.styles`.
  - Normalize AI output: strip markdown asterisks (`**bold**`), hashtags (`## Heading`), horizontal rules (`---`), and convert markdown tables (`| a | b |`) to real Word tables.
  - Enable `<w:updateFields w:val="true"/>` in `doc.settings.element` so Word automatically refreshes TOC and caption figures on opening.
- **`apps/api/src/modules/documents/front_matter.py` (UPDATE):**
  - Use native Word field codes (`TOC \o "1-3"`, `TOC \c "Figure"`, `TOC \c "Table"`).
  - Omit List of Figures / Tables completely if no figures or tables exist.
  - Set Roman page numbering on prelims and restart Arabic at 1 on report body.

#### 4. API Endpoints & Job Orchestration
- **`apps/api/src/main.py` & `apps/api/src/modules/jobs/job_manager.py` (UPDATE):**
  - Allow PDF and DOCX uploads for both Cover Page and Marking Scheme.
  - Add endpoint `GET /api/jobs/{job_id}/cover-preview` returning high-res thumbnail of page 1.
  - Wire `composer.py` into `execute_formatting`.
  - Generate both DOCX and PDF (via headless LibreOffice / Word COM + `pypdf` cover merger).

#### 5. PowerPoint Generation Optimization
- **`apps/api/src/modules/presentation/ppt_generator.py` (ENHANCE):**
  - Support input from either finished formatted report OR separately uploaded report.
  - Extract metadata (title, student name, course) from cover page text if available (read-only).
  - Auto-split long sections to prevent text overflow; ensure body font size >= 24pt.
  - Include agenda, section slides, key visual cards/tables, conclusion, and references.

---

### Frontend Tasks (`apps/web/`)

#### 1. Guided 4-Step Wizard Overhaul
- **`apps/web/src/features/workspace/Workspace.tsx` (REFACTOR):**
  - Replace 7 steps with a streamlined 4-step wizard:
    - **Step 1: Upload** (`UploadStep.tsx`):
      - 3 primary drag-and-drop zones: Report, Criteria, Cover Page.
      - 1 optional dropzone: Marking Scheme.
      - Cover page thumbnail preview.
      - "Generate PPT only" quick link.
    - **Step 2: Review** (`ReviewStep.tsx` - NEW):
      - Displays extracted criteria config in an editable form.
      - Prominent toggle: *"Use my cover page exactly as uploaded"* (ON & locked by default).
      - Visual assembly pipeline roadmap.
    - **Step 3: Generate** (`GenerateStep.tsx` - NEW):
      - Single prominent "Generate Submission-Ready Document" button.
      - Real-time animated progress stages.
    - **Step 4: Download & Inspect** (`DownloadStep.tsx` - REFACTOR):
      - Download DOCX, PDF, and PPT buttons.
      - Page-by-page interactive preview showing intact cover on Page 1.
      - Integrity verification badge.

---

### Testing Suite Tasks (`tests/`)

- **`tests/fixtures/` (NEW):**
  - `cover_with_logo_and_table.docx`
  - `cover_with_custom_font_header.docx`
  - `official_cover.pdf`
  - `sample_ai_report_with_tables.docx`
  - `sample_ai_report_plain.md`
  - `assignment_criteria_apa.pdf`
  - `assignment_criteria_harvard.docx`
  - `marking_scheme.pdf`
- **Automated Tests:**
  - `tests/test_cover_integrity.py`: Verifies byte/hash/XML invariance of cover section.
  - `tests/test_criteria_extractor.py`: Tests extraction of fonts, spacing, margins.
  - `tests/test_body_formatting.py`: Verifies real styles and AI markdown normalization.
  - `tests/test_toc_and_lists.py`: Verifies TOC/LOF/LOT field codes, omissions, pagination.
  - `tests/test_ppt_generator.py`: Verifies slide bounds, overflow prevention, font sizes.
  - `tests/test_end_to_end_wizard.py`: E2E test executing upload → review → generate → download.

---

## 3. Risks & Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **DOCX Relationship Collisions** | Merging cover with body might collide on `rId` relationship identifiers. | `docxcompose` automatically re-maps relationship IDs across OOXML packages without collision. |
| **PDF Cover Conversion Artifacts** | Converting PDF cover to DOCX distorts vector layout and fonts. | **NEVER convert PDF cover to DOCX.** Keep native PDF and merge at PDF level using `pypdf`. In DOCX, insert high-res 300 DPI rasterized rendering as Section 1 and display user notice. |
| **LibreOffice Headless Missing** | PDF export might fail if LibreOffice is not installed. | Support dual engine: (1) LibreOffice headless CLI, (2) Microsoft Word COM automation (`docx2pdf`), with graceful error messages if neither is available. |
| **Markdown / AI Inconsistencies** | Raw text from LLMs contains unbalanced asterisks or broken markdown tables. | Implement a robust text normalizer that converts markdown tables to Word tables and cleans inline artifacts before formatting. |
