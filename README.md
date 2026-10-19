# AssignmentReady — University Assignment Formatter

**AssignmentReady** is a client-first, privacy-driven academic document formatting web application designed to help university and college students automatically format existing assignments according to their institution's specific requirements.

While students frequently utilize AI tools such as ChatGPT or Gemini for drafting content, raw outputs regularly violate university formatting regulations (incorrect font sizes, absent cover sheets, non-compliant margins, missing table of contents, or unformatted rubrics). **AssignmentReady solves this problem deterministically using an OpenXML document processing engine without paid APIs, external AI dependencies, or mandatory user accounts.**

---

## 1. Key Features

- **Structure-Aware OpenXML Formatting**: Directly mutates Microsoft Word `.docx` documents via `python-docx` without stripping embedded tables, figures, hyperlinks, or mathematical formulas.
- **Dedicated Cover Page Engine**: Choose between a built-in clean academic cover sheet or merge candidate metadata into an official faculty `.docx` template with unlinked headers that suppress page numbers on the title sheet.
- **Marking Scheme / Rubric Generator**: Attach official assessment rubrics (.docx or text-extracted from .pdf) or enter criteria manually to generate an institutional marking table at your chosen document location.
- **Dynamic Table of Contents (TOC)**: Injects genuine OpenXML TOC field codes with configurable depth (Levels 1–3).
- **Academic Page Numbering**: Employs Word section breaks to deliver Roman numeral front matter, unlinked cover headers, and Arabic page numbering starting at the Introduction.
- **Heading Page Breaks**: Automatically starts major Level 1 headings on fresh pages while keeping subheadings glued to subsequent paragraphs (`keep_with_next`).
- **Rule-Based Compliance Auditor**: Instant deterministic audit rating typography, margin tolerances, required sections, bibliography existence, and heading hierarchies with actionable guidance.
- **Local College Profiles**: Create, duplicate, and reuse department profiles stored in browser `localStorage` (includes preloaded presets for **UK University Standard**, **APA 7th Edition**, **Harvard Academic**, and **STEM Technical Report**).
- **Privacy by Design**: Temporary server-side file processing, isolated UUID job directories, 1-hour automatic eviction, and manual file deletion. Zero document scraping or AI token usage.

---

## 2. Technology Stack

- **Frontend**:
  - React 18+ with TypeScript
  - Build Tool: Vite
  - Styling: Tailwind CSS
  - Icons: Lucide React
  - Storage: Browser `localStorage` for college profiles
- **Backend**:
  - Python 3.10+ / 3.14 with FastAPI
  - Document Engine: `python-docx` (OpenXML DOM manipulation)
  - PDF Text Extraction: `PyMuPDF` / `pypdf`
  - Headless Document Conversion: LibreOffice (where available on the host environment)
  - Testing: `pytest`
- **Architecture**: Strict three-layer separation (Presentation → Business Logic Service → Data/Storage Access).

---

## 3. Directory Structure

```
AssignmentReady/
├── apps/
│   ├── api/                              # FastAPI Backend Service
│   │   ├── src/
│   │   │   ├── common/                   # Errors, security, magic bytes & path guards
│   │   │   ├── modules/
│   │   │   │   ├── documents/            # OpenXML inspector, formatter, cover, rubric, TOC, compliance
│   │   │   │   └── jobs/                 # Job manager, lifecycle, schemas, controllers
│   │   │   ├── config.py                 # Configuration & LibreOffice detection
│   │   │   └── main.py                   # FastAPI app, security headers, CORS & routes
│   │   ├── tests/                        # Automated backend test suite (pytest)
│   │   ├── pytest.ini
│   │   ├── requirements.txt
│   │   └── .env.example
│   └── web/                              # React + TypeScript Frontend
│       ├── src/
│       │   ├── components/layout/        # Navbar, Footer, ProgressSteps
│       │   ├── features/
│       │   │   ├── landing/              # Interactive landing page & visual comparison
│       │   │   ├── workspace/            # 6-step formatting wizard
│       │   │   │   └── steps/            # Upload, Requirements, Cover, Rubric, Review, Download
│       │   │   └── profiles/             # College profiles management modal
│       │   ├── lib/                      # Typed API client & localStorage profile manager
│       │   ├── types/                    # Domain schemas & DTOs
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       ├── tailwind.config.js
│       └── vite.config.ts
├── sample-files/                         # Test assets
│   ├── sample_ai_draft.docx              # Realistic unformatted AI draft
│   ├── official_cover_template.docx      # Faculty template with {{placeholders}}
│   └── sample_rubric.docx                # Grading criteria rubric docx
├── scripts/
│   └── generate_samples.py               # Generates sample test files
├── docs/                                 # Architectural specifications & decisions
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Setup and Installation

### Prerequisites
- **Node.js** (v18.0.0 or later)
- **Python** (3.10 or later, including Python 3.14)
- **Git**

### A. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd apps/api
   ```

2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # Linux / macOS:
   source .venv/bin/activate
   ```

3. Install required dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```

4. Run the backend automated tests:
   ```bash
   python -m pytest
   ```

5. Launch the FastAPI server:
   ```bash
   python -m uvicorn src.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend API will be available at `http://127.0.0.1:8000`. Interactive OpenAPI documentation is accessible at `http://127.0.0.1:8000/docs`.

---

### B. Frontend Setup

1. In a separate terminal, navigate to the web application directory:
   ```bash
   cd apps/web
   ```

2. Install dependencies:
   ```bash
   npm install
   # (On Windows PowerShell if scripts are restricted: npm.cmd install)
   ```

3. Type-check and build the production bundle:
   ```bash
   npm run build
   ```

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 5. Testing with Provided Sample Files

Test assets are pre-generated in the `sample-files/` folder:
- `sample-files/sample_ai_draft.docx`: Upload this file in **Step 1 (Upload)** to see automated heading detection, word count, and table discovery.
- `sample-files/official_cover_template.docx`: Attach this as the cover template in **Step 1** to observe placeholder mapping (`{{student_name}}`, `{{assignment_title}}`, etc.).
- `sample-files/sample_rubric.docx`: Attach this as the marking rubric to automatically extract criteria and weights.

---

## 6. Preloaded College Profiles

AssignmentReady includes pre-configured style presets that you can load or duplicate from the **College Profiles** modal:
1. **UK University Standard**: A4 paper, Times New Roman 12 pt, 1.5 line spacing, 1-inch margins, major headings starting on new pages.
2. **APA 7th Edition Standard**: Letter paper, Calibri 11 pt, double line spacing, 1-inch margins, centered H1 headings.
3. **Harvard Academic Format**: A4 paper, Arial 11 pt, 1.5 line spacing, formal title page, dynamic TOC.
4. **STEM Technical Report**: A4 paper, Arial 11 pt, 1.15 line spacing, justified text, embedded marking rubric table.

You can customize any preset and click **"Save Current Workspace Settings as New Profile"** to save it locally to your browser.

---

## 7. Deployment Instructions (Free-Tier Hosting)

### Deploying the Backend (FastAPI) on Render / Railway / Fly.io
1. Connect your Git repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Choose **Web Service** with the root directory set to `apps/api`.
3. Set the build command:
   ```bash
   pip install -r requirements.txt
   ```
4. Set the start command:
   ```bash
   uvicorn src.main:app --host 0.0.0.0 --port $PORT
   ```
5. Configure environment variables in the host dashboard:
   - `ENVIRONMENT=production`
   - `MAX_UPLOAD_SIZE_BYTES=26214400`
   - `JOB_TTL_SECONDS=3600`

### Deploying the Frontend (Vite + React) on Vercel / Cloudflare Pages
1. Import your Git repository into [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com).
2. Set the root directory to `apps/web`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Configure environment variable:
   - `VITE_API_BASE=https://your-backend-api-url.onrender.com/api`

---

## 8. Academic Integrity & Privacy Notice

- **Formatting vs. Content**: AssignmentReady performs automated structural, typographical, and layout formatting. It does not alter your underlying academic research, write paragraphs, or fact-check arguments.
- **Honest Compliance**: The rule-based compliance report identifies layout discrepancies and missing mandatory sections (such as References or Introductions); it does not guarantee academic grades or claim to certify absence of AI usage.
- **Privacy Guarantee**: Student documents are processed in ephemeral server directories and automatically purged within 60 minutes. No assignment text is ever stored in database tables or shared with third-party language models.
