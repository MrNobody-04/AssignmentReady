import io
import re
from pathlib import Path
from typing import Literal
from pydantic import BaseModel, Field
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

class SlideItem(BaseModel):
    title: str
    category: str = ""
    bullets: list[str] = Field(default_factory=list)
    notes: str = ""
    slide_type: Literal["title", "content", "two_column", "conclusion"] = "content"
    column_left_title: str = ""
    column_left_bullets: list[str] = Field(default_factory=list)
    column_right_title: str = ""
    column_right_bullets: list[str] = Field(default_factory=list)

class PresentationOutline(BaseModel):
    title: str = "Presentation Title"
    subtitle: str = "Academic Overview & Key Findings"
    author: str = "Student Presenter"
    institution: str = "University Department"
    slides: list[SlideItem] = Field(default_factory=list)

class PresentationTheme:
    def __init__(
        self,
        name: str,
        bg_color: RGBColor,
        title_color: RGBColor,
        body_color: RGBColor,
        accent_color: RGBColor,
        accent_secondary: RGBColor,
        card_bg: RGBColor,
        card_border: RGBColor,
        font_title: str,
        font_body: str,
        is_dark: bool = False,
    ):
        self.name = name
        self.bg_color = bg_color
        self.title_color = title_color
        self.body_color = body_color
        self.accent_color = accent_color
        self.accent_secondary = accent_secondary
        self.card_bg = card_bg
        self.card_border = card_border
        self.font_title = font_title
        self.font_body = font_body
        self.is_dark = is_dark

THEMES: dict[str, PresentationTheme] = {
    "academic_classic": PresentationTheme(
        name="Academic Classic",
        bg_color=RGBColor(255, 255, 255),
        title_color=RGBColor(30, 58, 138),       # Deep Navy
        body_color=RGBColor(51, 65, 85),          # Slate 700
        accent_color=RGBColor(180, 83, 9),        # Warm Amber / Gold
        accent_secondary=RGBColor(241, 245, 249), # Slate 100
        card_bg=RGBColor(248, 250, 252),
        card_border=RGBColor(226, 232, 240),
        font_title="Georgia",
        font_body="Calibri",
        is_dark=False,
    ),
    "modern_minimal": PresentationTheme(
        name="Modern Minimal",
        bg_color=RGBColor(255, 255, 255),
        title_color=RGBColor(15, 23, 42),         # Slate 900
        body_color=RGBColor(71, 85, 105),         # Slate 600
        accent_color=RGBColor(79, 70, 229),       # Indigo 600
        accent_secondary=RGBColor(238, 242, 255), # Indigo 50
        card_bg=RGBColor(248, 250, 252),
        card_border=RGBColor(226, 232, 240),
        font_title="Segoe UI",
        font_body="Segoe UI",
        is_dark=False,
    ),
    "corporate_blue": PresentationTheme(
        name="Corporate Blue",
        bg_color=RGBColor(255, 255, 255),
        title_color=RGBColor(10, 37, 64),         # Deep Navy
        body_color=RGBColor(51, 65, 85),
        accent_color=RGBColor(0, 102, 204),       # Vibrant Blue
        accent_secondary=RGBColor(235, 244, 255),
        card_bg=RGBColor(246, 249, 252),
        card_border=RGBColor(203, 213, 225),
        font_title="Arial",
        font_body="Arial",
        is_dark=False,
    ),
    "research_presentation": PresentationTheme(
        name="Research Presentation",
        bg_color=RGBColor(255, 255, 255),
        title_color=RGBColor(15, 118, 110),       # Deep Teal
        body_color=RGBColor(51, 65, 85),
        accent_color=RGBColor(13, 148, 136),      # Teal 600
        accent_secondary=RGBColor(240, 253, 250), # Teal 50
        card_bg=RGBColor(248, 250, 252),
        card_border=RGBColor(204, 251, 241),
        font_title="Trebuchet MS",
        font_body="Calibri",
        is_dark=False,
    ),
    "dark_professional": PresentationTheme(
        name="Dark Professional",
        bg_color=RGBColor(15, 23, 42),            # Dark Slate 900
        title_color=RGBColor(248, 250, 252),      # Light Slate 50
        body_color=RGBColor(203, 213, 225),       # Slate 300
        accent_color=RGBColor(6, 182, 212),       # Cyan 500
        accent_secondary=RGBColor(30, 41, 59),    # Slate 800
        card_bg=RGBColor(30, 41, 59),
        card_border=RGBColor(51, 65, 85),
        font_title="Segoe UI",
        font_body="Segoe UI",
        is_dark=True,
    ),
}

def extract_presentation_outline_from_docx(doc_path: Path) -> PresentationOutline:
    """
    Intelligently parses a .docx file to extract a structured presentation outline.
    Extracts title, section headings, and synthesizes key bullet points.
    """
    import docx
    doc = docx.Document(str(doc_path))

    title = "Academic Assignment Presentation"
    subtitle = "Summary & Key Findings"
    author = "Student Author"
    institution = "University Faculty"

    # Identify document title
    non_empty_paras = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    if non_empty_paras:
        # Check first 3 paragraphs for title
        for p in non_empty_paras[:3]:
            if len(p) > 5 and len(p) < 100:
                title = p
                break

    slides: list[SlideItem] = []
    current_heading = ""
    current_bullets: list[str] = []

    def flush_slide():
        nonlocal current_heading, current_bullets
        if current_heading and current_bullets:
            # Determine slide type
            lower_h = current_heading.lower()
            if any(k in lower_h for k in ["conclusion", "summary", "recommendations", "future work"]):
                stype = "conclusion"
            else:
                stype = "content"

            slides.append(
                SlideItem(
                    title=current_heading,
                    category="Section",
                    bullets=current_bullets[:5],  # Keep max 5 punchy bullets
                    slide_type=stype,
                )
            )
        current_bullets = []

    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            continue

        style_name = p.style.name.lower() if p.style else ""
        is_heading = (
            "heading 1" in style_name
            or "heading 2" in style_name
            or "heading" in style_name
            or (len(text) < 70 and (p.runs and p.runs[0].bold and not text.endswith(".")))
            or re.match(r"^(?:chapter\s+\d+|\d+\.\d*|\b[A-Z\s]{4,}\b)", text)
        )

        if is_heading:
            flush_slide()
            # Clean heading text
            clean_h = re.sub(r"^\d+[\.\)]\s*", "", text).strip()
            current_heading = clean_h
        else:
            # Paragraph text: break into bullet points
            # If paragraph has multiple sentences, take key sentences
            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if len(s.strip()) > 15]
            for s in sentences:
                if len(current_bullets) < 5:
                    # Truncate overly long sentences to crisp bullet points
                    if len(s) > 120:
                        s = s[:117] + "..."
                    current_bullets.append(s)

    flush_slide()

    # If too few slides found (e.g. unformatted doc), split document content evenly
    if len(slides) < 2 and non_empty_paras:
        chunks = [non_empty_paras[i:i + 4] for i in range(0, len(non_empty_paras), 4)]
        section_names = ["Executive Overview", "Main Analysis", "Methodology & Findings", "Discussion & Implications", "Conclusion"]
        for idx, chunk in enumerate(chunks[:5]):
            h_name = section_names[idx] if idx < len(section_names) else f"Section {idx + 1}"
            bullets = [c[:120] for c in chunk if len(c) > 10][:4]
            slides.append(SlideItem(title=h_name, category="Analysis", bullets=bullets))

    return PresentationOutline(
        title=title,
        subtitle=subtitle,
        author=author,
        institution=institution,
        slides=slides,
    )

def extract_presentation_outline_from_text(text: str) -> PresentationOutline:
    """Extract outline from plain text or Markdown format."""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    title = lines[0] if lines else "Document Presentation"
    slides: list[SlideItem] = []

    current_title = ""
    current_bullets: list[str] = []

    def flush():
        nonlocal current_title, current_bullets
        if current_title and current_bullets:
            slides.append(SlideItem(title=current_title, bullets=current_bullets[:5]))
        current_bullets = []

    for line in lines[1:]:
        if line.startswith("# ") or line.startswith("## ") or (len(line) < 60 and line.isupper()):
            flush()
            current_title = line.lstrip("#").strip()
        elif line.startswith("- ") or line.startswith("* ") or line.startswith("• "):
            current_bullets.append(line[2:].strip())
        elif len(line) < 140:
            current_bullets.append(line)

    flush()

    if not slides:
        # Fallback
        slides = [
            SlideItem(title="Key Overview", bullets=lines[1:5]),
            SlideItem(title="Detailed Summary", bullets=lines[5:9] if len(lines) > 5 else ["Key findings summary."]),
        ]

    return PresentationOutline(title=title, slides=slides)

def generate_powerpoint_presentation(
    outline: PresentationOutline,
    theme_key: str = "academic_classic",
) -> bytes:
    """
    Generates a beautifully styled, editable 16:9 widescreen PowerPoint presentation (.pptx).
    Uses custom vector shape layouts, theme color palettes, and typography.
    """
    theme = THEMES.get(theme_key, THEMES["academic_classic"])
    prs = pptx.Presentation()

    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]  # Blank slide for 100% control

    def set_background(slide):
        bg = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
        )
        bg.fill.solid()
        bg.fill.fore_color.rgb = theme.bg_color
        bg.line.fill.background()

    # ----------------------------------------------------
    # SLIDE 1: TITLE SLIDE
    # ----------------------------------------------------
    title_slide = prs.slides.add_slide(blank_layout)
    set_background(title_slide)

    # Top accent bar
    top_bar = title_slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, Inches(0.15)
    )
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = theme.accent_color
    top_bar.line.fill.background()

    # Decorative left pill
    left_accent = title_slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.8), Inches(0.12), Inches(3.2)
    )
    left_accent.fill.solid()
    left_accent.fill.fore_color.rgb = theme.accent_color
    left_accent.line.fill.background()

    # Category / Badge
    badge_box = title_slide.shapes.add_textbox(Inches(1.5), Inches(1.8), Inches(10), Inches(0.4))
    tf_b = badge_box.text_frame
    tf_b.word_wrap = True
    p_b = tf_b.paragraphs[0]
    p_b.text = "ACADEMIC PRESENTATION & RESEARCH SUMMARY"
    p_b.font.name = theme.font_title
    p_b.font.size = Pt(11)
    p_b.font.bold = True
    p_b.font.color.rgb = theme.accent_color

    # Presentation Title
    title_box = title_slide.shapes.add_textbox(Inches(1.5), Inches(2.2), Inches(10.5), Inches(2.2))
    tf_t = title_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = outline.title
    p_t.font.name = theme.font_title
    p_t.font.size = Pt(36)
    p_t.font.bold = True
    p_t.font.color.rgb = theme.title_color

    # Subtitle
    if outline.subtitle:
        sub_box = title_slide.shapes.add_textbox(Inches(1.5), Inches(4.3), Inches(10), Inches(0.8))
        tf_s = sub_box.text_frame
        tf_s.word_wrap = True
        p_s = tf_s.paragraphs[0]
        p_s.text = outline.subtitle
        p_s.font.name = theme.font_body
        p_s.font.size = Pt(18)
        p_s.font.color.rgb = theme.body_color

    # Bottom Meta Card (Author & Institution)
    meta_card = title_slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(5.6), Inches(10.3), Inches(1.0)
    )
    meta_card.fill.solid()
    meta_card.fill.fore_color.rgb = theme.card_bg
    meta_card.line.color.rgb = theme.card_border

    meta_box = title_slide.shapes.add_textbox(Inches(1.8), Inches(5.7), Inches(9.8), Inches(0.8))
    tf_m = meta_box.text_frame
    p_m1 = tf_m.paragraphs[0]
    p_m1.text = f"Presenter: {outline.author or 'Author'}"
    p_m1.font.name = theme.font_body
    p_m1.font.size = Pt(13)
    p_m1.font.bold = True
    p_m1.font.color.rgb = theme.title_color

    p_m2 = tf_m.add_paragraph()
    p_m2.text = f"Institution: {outline.institution or 'Academic Institution'}  •  Prepared with AssignmentReady"
    p_m2.font.name = theme.font_body
    p_m2.font.size = Pt(11)
    p_m2.font.color.rgb = theme.body_color

    # ----------------------------------------------------
    # CONTENT SLIDES
    # ----------------------------------------------------
    total_slides = len(outline.slides)
    for idx, slide_item in enumerate(outline.slides, start=1):
        slide = prs.slides.add_slide(blank_layout)
        set_background(slide)

        # Top banner line
        tb = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, Inches(0.08)
        )
        tb.fill.solid()
        tb.fill.fore_color.rgb = theme.accent_color
        tb.line.fill.background()

        # Header Section
        # Category label
        cat_box = slide.shapes.add_textbox(Inches(1.0), Inches(0.6), Inches(10), Inches(0.3))
        cat_tf = cat_box.text_frame
        cat_p = cat_tf.paragraphs[0]
        cat_text = slide_item.category.upper() if slide_item.category else f"SECTION {idx:02d}"
        cat_p.text = cat_text
        cat_p.font.name = theme.font_title
        cat_p.font.size = Pt(10)
        cat_p.font.bold = True
        cat_p.font.color.rgb = theme.accent_color

        # Slide Title
        st_box = slide.shapes.add_textbox(Inches(1.0), Inches(0.9), Inches(11.3), Inches(0.8))
        st_tf = st_box.text_frame
        st_tf.word_wrap = True
        st_p = st_tf.paragraphs[0]
        st_p.text = slide_item.title
        st_p.font.name = theme.font_title
        st_p.font.size = Pt(26)
        st_p.font.bold = True
        st_p.font.color.rgb = theme.title_color

        # Subtle divider
        div = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(1.8), Inches(11.3), Inches(0.02)
        )
        div.fill.solid()
        div.fill.fore_color.rgb = theme.card_border
        div.line.fill.background()

        # Render Content by Slide Type
        if slide_item.slide_type == "conclusion":
            # Highlight / Takeaway Card layout
            card = slide.shapes.add_shape(
                MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(2.1), Inches(11.3), Inches(4.3)
            )
            card.fill.solid()
            card.fill.fore_color.rgb = theme.card_bg
            card.line.color.rgb = theme.card_border

            # Inner bullets
            c_box = slide.shapes.add_textbox(Inches(1.4), Inches(2.3), Inches(10.5), Inches(3.9))
            c_tf = c_box.text_frame
            c_tf.word_wrap = True

            for b_idx, bullet in enumerate(slide_item.bullets):
                p = c_tf.paragraphs[0] if b_idx == 0 else c_tf.add_paragraph()
                p.text = f"✓  {bullet}"
                p.font.name = theme.font_body
                p.font.size = Pt(18)
                p.font.color.rgb = theme.title_color if b_idx == 0 else theme.body_color
                p.space_after = Pt(14)

        else:
            # Standard bullet layout with card backing
            card = slide.shapes.add_shape(
                MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(2.1), Inches(11.3), Inches(4.3)
            )
            card.fill.solid()
            card.fill.fore_color.rgb = theme.card_bg
            card.line.color.rgb = theme.card_border

            c_box = slide.shapes.add_textbox(Inches(1.4), Inches(2.4), Inches(10.5), Inches(3.7))
            c_tf = c_box.text_frame
            c_tf.word_wrap = True

            for b_idx, bullet in enumerate(slide_item.bullets):
                p = c_tf.paragraphs[0] if b_idx == 0 else c_tf.add_paragraph()
                p.text = f"•   {bullet}"
                p.font.name = theme.font_body
                p.font.size = Pt(17)
                p.font.color.rgb = theme.body_color
                p.space_after = Pt(16)

        # Footer (Slide Number & branding)
        ft_box = slide.shapes.add_textbox(Inches(1.0), Inches(6.6), Inches(11.3), Inches(0.4))
        ft_tf = ft_box.text_frame
        ft_p = ft_tf.paragraphs[0]
        ft_p.text = f"{outline.title}   |   Slide {idx} of {total_slides}"
        ft_p.font.name = theme.font_body
        ft_p.font.size = Pt(9)
        ft_p.font.color.rgb = RGBColor(148, 163, 184)

        # Add notes if provided
        if slide_item.notes:
            notes_slide = slide.notes_slide
            text_frame = notes_slide.notes_text_frame
            text_frame.text = slide_item.notes

    out_stream = io.BytesIO()
    prs.save(out_stream)
    return out_stream.getvalue()
