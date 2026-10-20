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

class MetricItem(BaseModel):
    value: str
    label: str
    description: str = ""

class StepItem(BaseModel):
    step_number: str
    title: str
    description: str

class SlideItem(BaseModel):
    title: str
    category: str = ""
    bullets: list[str] = Field(default_factory=list)
    notes: str = ""
    slide_type: str = "content"
    column_left_title: str = ""
    column_left_bullets: list[str] = Field(default_factory=list)
    column_right_title: str = ""
    column_right_bullets: list[str] = Field(default_factory=list)
    metrics: list[MetricItem] = Field(default_factory=list)
    steps: list[StepItem] = Field(default_factory=list)
    table_headers: list[str] = Field(default_factory=list)
    table_rows: list[list[str]] = Field(default_factory=list)

class PresentationOutline(BaseModel):
    title: str = "Presentation Title"
    subtitle: str = "Academic Overview & Key Findings"
    author: str = "Student Presenter"
    institution: str = "University Department"
    target_slide_count: int = 8
    audience: str = "academic"
    duration_minutes: int = 15
    text_density: str = "balanced"  # concise, balanced, detailed
    include_notes: bool = True
    include_references: bool = True
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
        description: str = "",
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
        self.description = description

THEMES: dict[str, PresentationTheme] = {
    # 1. Modern Academic
    "modern_academic": PresentationTheme(
        name="Modern Academic",
        bg_color=RGBColor(255, 255, 255),
        title_color=RGBColor(30, 58, 138),       # Deep Navy #1E3A8A
        body_color=RGBColor(51, 65, 85),          # Slate 700
        accent_color=RGBColor(180, 83, 9),        # Warm Amber #B45309
        accent_secondary=RGBColor(2, 132, 199),   # Sky Blue #0284C7
        card_bg=RGBColor(248, 250, 252),          # Slate 50
        card_border=RGBColor(226, 232, 240),      # Slate 200
        font_title="Georgia",
        font_body="Calibri",
        is_dark=False,
        description="Clean, structured, scholarly navy and warm amber palette with serif headings.",
    ),
    # 2. Technology and Innovation
    "tech_innovation": PresentationTheme(
        name="Technology and Innovation",
        bg_color=RGBColor(248, 250, 252),         # Slate 50
        title_color=RGBColor(15, 23, 42),         # Dark Slate #0F172A
        body_color=RGBColor(71, 85, 105),         # Slate 600
        accent_color=RGBColor(6, 182, 212),       # Electric Cyan #06B6D4
        accent_secondary=RGBColor(16, 185, 129),  # Teal/Emerald #10B981
        card_bg=RGBColor(255, 255, 255),          # Pure White
        card_border=RGBColor(203, 213, 225),      # Slate 300
        font_title="Segoe UI",
        font_body="Segoe UI",
        is_dark=False,
        description="Contemporary tech visuals with vibrant cyan accents and sharp geometric layouts.",
    ),
    # 3. Minimalist Premium
    "minimalist_premium": PresentationTheme(
        name="Minimalist Premium",
        bg_color=RGBColor(250, 250, 249),         # Warm Stone #FAFAF9
        title_color=RGBColor(28, 25, 23),         # Warm Charcoal #1C1917
        body_color=RGBColor(87, 83, 78),          # Stone 600
        accent_color=RGBColor(217, 119, 6),       # Ochre Gold #D97706
        accent_secondary=RGBColor(120, 113, 108), # Soft Bronze #78716C
        card_bg=RGBColor(255, 255, 255),
        card_border=RGBColor(231, 229, 228),      # Stone 200
        font_title="Georgia",
        font_body="Arial",
        is_dark=False,
        description="Generous whitespace, elegant typography, and refined stone and ochre tones.",
    ),
    # 4. Corporate Professional
    "corporate_pro": PresentationTheme(
        name="Corporate Professional",
        bg_color=RGBColor(255, 255, 255),
        title_color=RGBColor(10, 37, 64),         # Corporate Navy #0A2540
        body_color=RGBColor(51, 65, 85),          # Slate 700
        accent_color=RGBColor(37, 99, 235),       # Royal Blue #2563EB
        accent_secondary=RGBColor(100, 116, 139), # Slate 500
        card_bg=RGBColor(248, 250, 252),
        card_border=RGBColor(226, 232, 240),
        font_title="Arial",
        font_body="Arial",
        is_dark=False,
        description="Polished enterprise executive styling with royal blue and clean data cards.",
    ),
    # 5. Creative Gradient
    "creative_gradient": PresentationTheme(
        name="Creative Gradient",
        bg_color=RGBColor(253, 244, 255),         # Soft Fuchsia Tint #FDF4FF
        title_color=RGBColor(67, 56, 202),        # Rich Indigo #4338CA
        body_color=RGBColor(55, 65, 81),          # Gray 700
        accent_color=RGBColor(236, 72, 153),      # Fuchsia Pink #EC4899
        accent_secondary=RGBColor(139, 92, 246),  # Violet #8B5CF6
        card_bg=RGBColor(255, 255, 255),
        card_border=RGBColor(245, 208, 254),      # Fuchsia 200
        font_title="Trebuchet MS",
        font_body="Segoe UI",
        is_dark=False,
        description="Tasteful gradient highlights, bold headlines, and vibrant visual accents.",
    ),
    # 6. Research and Science
    "research_science": PresentationTheme(
        name="Research and Science",
        bg_color=RGBColor(255, 255, 255),
        title_color=RGBColor(6, 95, 70),          # Deep Emerald #065F46
        body_color=RGBColor(51, 65, 85),          # Slate 700
        accent_color=RGBColor(13, 148, 136),      # Mint Teal #0D9488
        accent_secondary=RGBColor(4, 120, 87),    # Forest #047857
        card_bg=RGBColor(240, 253, 244),          # Mint 50
        card_border=RGBColor(187, 247, 208),      # Mint 200
        font_title="Trebuchet MS",
        font_body="Calibri",
        is_dark=False,
        description="Tailored for scientific investigations, laboratory methodologies, and empirical findings.",
    ),
    # 7. Dark Presentation
    "dark_presentation": PresentationTheme(
        name="Dark Presentation",
        bg_color=RGBColor(15, 23, 42),            # Dark Slate 900 #0F172A
        title_color=RGBColor(248, 250, 252),      # Light Slate 50
        body_color=RGBColor(203, 213, 225),       # Slate 300
        accent_color=RGBColor(56, 189, 248),      # Light Cyan #38BDF8
        accent_secondary=RGBColor(163, 230, 53),  # Neon Lime #A3E635
        card_bg=RGBColor(30, 41, 59),             # Slate 800
        card_border=RGBColor(51, 65, 85),         # Slate 700
        font_title="Segoe UI",
        font_body="Segoe UI",
        is_dark=True,
        description="Readable dark obsidian background with high-contrast glowing cyan highlights.",
    ),
    # 8. University Classic
    "university_classic": PresentationTheme(
        name="University Classic",
        bg_color=RGBColor(255, 255, 255),
        title_color=RGBColor(0, 33, 71),          # Oxford Blue #002147
        body_color=RGBColor(51, 65, 85),          # Slate 700
        accent_color=RGBColor(128, 0, 32),        # Crimson Burgundy #800020
        accent_secondary=RGBColor(197, 160, 89),  # Antique Gold #C5A059
        card_bg=RGBColor(255, 251, 235),          # Amber 50
        card_border=RGBColor(254, 243, 199),      # Amber 200
        font_title="Georgia",
        font_body="Calibri",
        is_dark=False,
        description="Formal traditional academic prestige styling with Oxford blue, burgundy, and antique gold.",
    ),
}

# Aliases for backward compatibility
THEMES["academic_classic"] = THEMES["modern_academic"]
THEMES["modern_minimal"] = THEMES["tech_innovation"]
THEMES["corporate_blue"] = THEMES["corporate_pro"]
THEMES["research_presentation"] = THEMES["research_science"]
THEMES["dark_professional"] = THEMES["dark_presentation"]

def _set_slide_bg(slide, prs, theme: PresentationTheme):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = theme.bg_color
    bg.line.fill.background()

def _add_slide_header(slide, prs, theme: PresentationTheme, title_text: str, category_text: str = ""):
    # Accent top bar
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, Inches(0.08))
    bar.fill.solid()
    bar.fill.fore_color.rgb = theme.accent_color
    bar.line.fill.background()

    # Category / Pill
    if category_text:
        cat_box = slide.shapes.add_textbox(Inches(0.9), Inches(0.55), Inches(11.5), Inches(0.3))
        cat_tf = cat_box.text_frame
        cat_p = cat_tf.paragraphs[0]
        cat_p.text = category_text.upper()
        cat_p.font.name = theme.font_title
        cat_p.font.size = Pt(10)
        cat_p.font.bold = True
        cat_p.font.color.rgb = theme.accent_color

    # Slide Title
    st_box = slide.shapes.add_textbox(Inches(0.9), Inches(0.85), Inches(11.5), Inches(0.8))
    st_tf = st_box.text_frame
    st_tf.word_wrap = True
    st_p = st_tf.paragraphs[0]
    st_p.text = title_text
    st_p.font.name = theme.font_title
    st_p.font.size = Pt(24)
    st_p.font.bold = True
    st_p.font.color.rgb = theme.title_color

    # Divider
    div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.9), Inches(1.75), Inches(11.5), Inches(0.02))
    div.fill.solid()
    div.fill.fore_color.rgb = theme.card_border
    div.line.fill.background()

def _add_slide_footer(slide, theme: PresentationTheme, outline: PresentationOutline, current_idx: int, total: int):
    ft_box = slide.shapes.add_textbox(Inches(0.9), Inches(6.8), Inches(11.5), Inches(0.35))
    ft_tf = ft_box.text_frame
    ft_p = ft_tf.paragraphs[0]
    ft_p.text = f"{outline.title}   •   Slide {current_idx} of {total}"
    ft_p.font.name = theme.font_body
    ft_p.font.size = Pt(9)
    ft_p.font.color.rgb = RGBColor(148, 163, 184)

def _add_speaker_notes(slide, notes_text: str):
    if notes_text and notes_text.strip():
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_text.strip()

# ---------------------------------------------------------------------------
# SLIDE LAYOUT RENDERERS
# ---------------------------------------------------------------------------

def _render_title_slide(prs, theme: PresentationTheme, outline: PresentationOutline):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, prs, theme)

    # Top accent bar
    top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, Inches(0.15))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = theme.accent_color
    top_bar.line.fill.background()

    # Left accent pillar
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.8), Inches(0.15), Inches(3.2))
    pill.fill.solid()
    pill.fill.fore_color.rgb = theme.accent_color
    pill.line.fill.background()

    # Academic Category Kicker
    badge = slide.shapes.add_textbox(Inches(1.5), Inches(1.8), Inches(10.5), Inches(0.4))
    b_p = badge.text_frame.paragraphs[0]
    b_p.text = "ACADEMIC RESEARCH & PROJECT PRESENTATION"
    b_p.font.name = theme.font_title
    b_p.font.size = Pt(11)
    b_p.font.bold = True
    b_p.font.color.rgb = theme.accent_color

    # Main Title
    t_box = slide.shapes.add_textbox(Inches(1.5), Inches(2.2), Inches(10.5), Inches(2.0))
    t_tf = t_box.text_frame
    t_tf.word_wrap = True
    t_p = t_tf.paragraphs[0]
    t_p.text = outline.title
    t_p.font.name = theme.font_title
    t_p.font.size = Pt(36)
    t_p.font.bold = True
    t_p.font.color.rgb = theme.title_color

    # Subtitle
    if outline.subtitle:
        s_box = slide.shapes.add_textbox(Inches(1.5), Inches(4.3), Inches(10.5), Inches(0.8))
        s_tf = s_box.text_frame
        s_tf.word_wrap = True
        s_p = s_tf.paragraphs[0]
        s_p.text = outline.subtitle
        s_p.font.name = theme.font_body
        s_p.font.size = Pt(18)
        s_p.font.color.rgb = theme.body_color

    # Bottom Presenter Meta Card
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(5.6), Inches(10.3), Inches(1.1))
    card.fill.solid()
    card.fill.fore_color.rgb = theme.card_bg
    card.line.color.rgb = theme.card_border

    c_box = slide.shapes.add_textbox(Inches(1.8), Inches(5.7), Inches(9.8), Inches(0.9))
    c_tf = c_box.text_frame
    p1 = c_tf.paragraphs[0]
    p1.text = f"Presenter: {outline.author or 'Student Author'}"
    p1.font.name = theme.font_body
    p1.font.size = Pt(13)
    p1.font.bold = True
    p1.font.color.rgb = theme.title_color

    p2 = c_tf.add_paragraph()
    p2.text = f"Institution: {outline.institution or 'Academic Institution'}   •   Prepared with AssignmentReady"
    p2.font.name = theme.font_body
    p2.font.size = Pt(11)
    p2.font.color.rgb = theme.body_color

def _render_agenda_slide(prs, theme: PresentationTheme, slide_item: SlideItem, idx: int, total: int, outline: PresentationOutline):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, prs, theme)
    _add_slide_header(slide, prs, theme, slide_item.title, slide_item.category or "Overview")

    bullets = slide_item.bullets if slide_item.bullets else ["Background & Context", "Research Methodology", "Empirical Findings", "Discussion & Implications", "Conclusion & Next Steps"]
    count = min(len(bullets), 6)

    # 2-column or 3-step grid
    cols = 2 if count > 3 else 1
    rows = (count + cols - 1) // cols
    card_w = Inches(5.5) if cols == 2 else Inches(11.5)
    card_h = Inches(4.3 / max(1, rows))

    for b_i, item in enumerate(bullets[:6]):
        c = b_i % cols
        r = b_i // cols
        left = Inches(0.9 + c * 5.9)
        top = Inches(2.0 + r * (card_h.inches + 0.15))

        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, card_w, card_h)
        card.fill.solid()
        card.fill.fore_color.rgb = theme.card_bg
        card.line.color.rgb = theme.card_border

        # Number Badge
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.2), top + Inches(0.2), Inches(0.45), Inches(0.45))
        badge.fill.solid()
        badge.fill.fore_color.rgb = theme.accent_color
        badge.line.fill.background()
        bp = badge.text_frame.paragraphs[0]
        bp.text = f"{b_i + 1:02d}"
        bp.font.name = theme.font_title
        bp.font.size = Pt(11)
        bp.font.bold = True
        bp.font.color.rgb = RGBColor(255, 255, 255)
        bp.alignment = PP_ALIGN.CENTER

        # Text
        tb = slide.shapes.add_textbox(left + Inches(0.8), top + Inches(0.15), card_w - Inches(1.0), card_h - Inches(0.3))
        tb_tf = tb.text_frame
        tb_tf.word_wrap = True
        p = tb_tf.paragraphs[0]
        p.text = item
        p.font.name = theme.font_body
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = theme.title_color

    _add_slide_footer(slide, theme, outline, idx, total)
    _add_speaker_notes(slide, slide_item.notes)

def _render_objectives_slide(prs, theme: PresentationTheme, slide_item: SlideItem, idx: int, total: int, outline: PresentationOutline):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, prs, theme)
    _add_slide_header(slide, prs, theme, slide_item.title, slide_item.category or "Objectives")

    bullets = slide_item.bullets[:4] if slide_item.bullets else ["Define scope", "Analyze literature", "Validate model"]
    num_cards = len(bullets)
    gap = 0.2
    card_w = (11.5 - (num_cards - 1) * gap) / num_cards

    for i, obj in enumerate(bullets):
        left = Inches(0.9 + i * (card_w + gap))
        top = Inches(2.1)
        height = Inches(4.3)

        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(card_w), height)
        card.fill.solid()
        card.fill.fore_color.rgb = theme.card_bg
        card.line.color.rgb = theme.card_border

        # Top Accent line on card
        top_bar = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(card_w), Inches(0.1))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = theme.accent_color
        top_bar.line.fill.background()

        # Goal Number Badge
        b_box = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.25), Inches(card_w - 0.4), Inches(0.5))
        bp = b_box.text_frame.paragraphs[0]
        bp.text = f"GOAL 0{i + 1}"
        bp.font.name = theme.font_title
        bp.font.size = Pt(12)
        bp.font.bold = True
        bp.font.color.rgb = theme.accent_color

        # Body Text
        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.8), Inches(card_w - 0.4), Inches(3.2))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = obj
        p.font.name = theme.font_body
        p.font.size = Pt(15)
        p.font.color.rgb = theme.body_color

    _add_slide_footer(slide, theme, outline, idx, total)
    _add_speaker_notes(slide, slide_item.notes)

def _render_process_workflow_slide(prs, theme: PresentationTheme, slide_item: SlideItem, idx: int, total: int, outline: PresentationOutline):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, prs, theme)
    _add_slide_header(slide, prs, theme, slide_item.title, slide_item.category or "Workflow Process")

    bullets = slide_item.bullets[:4] if slide_item.bullets else ["Data Collection", "Feature Engineering", "Model Evaluation", "Deployment"]
    num_steps = len(bullets)
    gap = 0.25
    card_w = (11.5 - (num_steps - 1) * gap) / num_steps

    for i, step_text in enumerate(bullets):
        left = Inches(0.9 + i * (card_w + gap))
        top = Inches(2.2)
        height = Inches(4.0)

        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(card_w), height)
        card.fill.solid()
        card.fill.fore_color.rgb = theme.card_bg
        card.line.color.rgb = theme.card_border

        # Step Number Pill
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.2), top + Inches(0.25), Inches(card_w - 0.4), Inches(0.45))
        badge.fill.solid()
        badge.fill.fore_color.rgb = theme.accent_color if i == 0 else theme.accent_secondary
        badge.line.fill.background()
        bp = badge.text_frame.paragraphs[0]
        bp.text = f"STEP {i + 1}"
        bp.font.name = theme.font_title
        bp.font.size = Pt(11)
        bp.font.bold = True
        bp.font.color.rgb = RGBColor(255, 255, 255) if theme.is_dark or i == 0 else theme.title_color
        bp.alignment = PP_ALIGN.CENTER

        # Step Description
        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.9), Inches(card_w - 0.4), Inches(2.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = step_text
        p.font.name = theme.font_body
        p.font.size = Pt(14)
        p.font.color.rgb = theme.body_color

    _add_slide_footer(slide, theme, outline, idx, total)
    _add_speaker_notes(slide, slide_item.notes)

def _render_comparison_slide(prs, theme: PresentationTheme, slide_item: SlideItem, idx: int, total: int, outline: PresentationOutline):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, prs, theme)
    _add_slide_header(slide, prs, theme, slide_item.title, slide_item.category or "Comparison & Tradeoffs")

    left_title = slide_item.column_left_title or "Conventional Approach"
    right_title = slide_item.column_right_title or "Proposed Architecture"

    half_w = Inches(5.6)
    height = Inches(4.3)

    # Column 1 (Left Card)
    c1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(2.1), half_w, height)
    c1.fill.solid()
    c1.fill.fore_color.rgb = theme.card_bg
    c1.line.color.rgb = theme.card_border

    # Column 1 Header
    h1 = slide.shapes.add_textbox(Inches(1.2), Inches(2.3), half_w - Inches(0.6), Inches(0.6))
    h1_p = h1.text_frame.paragraphs[0]
    h1_p.text = left_title
    h1_p.font.name = theme.font_title
    h1_p.font.size = Pt(18)
    h1_p.font.bold = True
    h1_p.font.color.rgb = theme.title_color

    b1_box = slide.shapes.add_textbox(Inches(1.2), Inches(3.0), half_w - Inches(0.6), height - Inches(1.1))
    b1_tf = b1_box.text_frame
    b1_tf.word_wrap = True
    left_bullets = slide_item.column_left_bullets or slide_item.bullets[:3]
    for b_idx, bullet in enumerate(left_bullets):
        p = b1_tf.paragraphs[0] if b_idx == 0 else b1_tf.add_paragraph()
        p.text = f"•  {bullet}"
        p.font.name = theme.font_body
        p.font.size = Pt(14)
        p.font.color.rgb = theme.body_color
        p.space_after = Pt(10)

    # Column 2 (Right Card)
    c2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.1), half_w, height)
    c2.fill.solid()
    c2.fill.fore_color.rgb = theme.card_bg
    c2.line.color.rgb = theme.accent_color

    # Column 2 Header
    h2 = slide.shapes.add_textbox(Inches(7.1), Inches(2.3), half_w - Inches(0.6), Inches(0.6))
    h2_p = h2.text_frame.paragraphs[0]
    h2_p.text = right_title
    h2_p.font.name = theme.font_title
    h2_p.font.size = Pt(18)
    h2_p.font.bold = True
    h2_p.font.color.rgb = theme.accent_color

    b2_box = slide.shapes.add_textbox(Inches(7.1), Inches(3.0), half_w - Inches(0.6), height - Inches(1.1))
    b2_tf = b2_box.text_frame
    b2_tf.word_wrap = True
    right_bullets = slide_item.column_right_bullets or slide_item.bullets[3:6] or ["Enhanced throughput", "Deterministic compliance", "Zero proprietary lock-in"]
    for b_idx, bullet in enumerate(right_bullets):
        p = b2_tf.paragraphs[0] if b_idx == 0 else b2_tf.add_paragraph()
        p.text = f"✓  {bullet}"
        p.font.name = theme.font_body
        p.font.size = Pt(14)
        p.font.color.rgb = theme.title_color
        p.space_after = Pt(10)

    _add_slide_footer(slide, theme, outline, idx, total)
    _add_speaker_notes(slide, slide_item.notes)

def _render_metrics_stats_slide(prs, theme: PresentationTheme, slide_item: SlideItem, idx: int, total: int, outline: PresentationOutline):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, prs, theme)
    _add_slide_header(slide, prs, theme, slide_item.title, slide_item.category or "Key Metrics & Results")

    metrics = slide_item.metrics
    if not metrics:
        # Generate metrics by extracting numbers from bullets
        extracted = []
        for b in slide_item.bullets:
            m = re.search(r"(\d+(?:\.\d+)?%|\d+x|\$\d+|\d+\+)", b)
            if m:
                extracted.append(MetricItem(value=m.group(1), label=b[:40], description=b[40:120]))
        if len(extracted) >= 2:
            metrics = extracted[:3]
        else:
            metrics = [
                MetricItem(value="98.5%", label="Compliance Accuracy", description="Verified against institutional handbook rules."),
                MetricItem(value="3.8x", label="Efficiency Improvement", description="Accelerated academic document formatting cycle."),
                MetricItem(value="100%", label="Privacy Preservation", description="Zero client data stored or leaked to external APIs."),
            ]

    num_m = min(len(metrics), 3)
    card_w = (11.5 - (num_m - 1) * 0.3) / num_m

    for i, met in enumerate(metrics[:3]):
        left = Inches(0.9 + i * (card_w + 0.3))
        top = Inches(2.2)
        height = Inches(4.0)

        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(card_w), height)
        card.fill.solid()
        card.fill.fore_color.rgb = theme.card_bg
        card.line.color.rgb = theme.card_border

        # Big Stat Value
        v_box = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.4), Inches(card_w - 0.4), Inches(1.2))
        vp = v_box.text_frame.paragraphs[0]
        vp.text = met.value
        vp.font.name = theme.font_title
        vp.font.size = Pt(44)
        vp.font.bold = True
        vp.font.color.rgb = theme.accent_color
        vp.alignment = PP_ALIGN.CENTER

        # Label
        l_box = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(1.6), Inches(card_w - 0.4), Inches(0.8))
        lp = l_box.text_frame.paragraphs[0]
        lp.text = met.label
        lp.font.name = theme.font_body
        lp.font.size = Pt(16)
        lp.font.bold = True
        lp.font.color.rgb = theme.title_color
        lp.alignment = PP_ALIGN.CENTER

        # Description
        if met.description:
            d_box = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(2.4), Inches(card_w - 0.4), Inches(1.2))
            dp = d_box.text_frame.paragraphs[0]
            dp.text = met.description
            dp.font.name = theme.font_body
            dp.font.size = Pt(12)
            dp.font.color.rgb = theme.body_color
            dp.alignment = PP_ALIGN.CENTER

    _add_slide_footer(slide, theme, outline, idx, total)
    _add_speaker_notes(slide, slide_item.notes)

def _render_table_slide(prs, theme: PresentationTheme, slide_item: SlideItem, idx: int, total: int, outline: PresentationOutline):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, prs, theme)
    _add_slide_header(slide, prs, theme, slide_item.title, slide_item.category or "Data & Empirical Analysis")

    headers = slide_item.table_headers or ["Parameter / Metric", "Baseline Result", "Optimized Result", "Status"]
    rows = slide_item.table_rows or [
        ["Processing Latency", "12.4 seconds", "1.8 seconds", "PASS"],
        ["Format Adherence", "78.2%", "99.4%", "PASS"],
        ["Section Consistency", "Manual checks", "Deterministic rule audit", "PASS"],
        ["External Dependencies", "Paid Cloud AI APIs", "0 (Air-gapped safe)", "PASS"],
    ]

    num_rows = len(rows) + 1
    num_cols = len(headers)

    table_shape = slide.shapes.add_table(num_rows, num_cols, Inches(0.9), Inches(2.1), Inches(11.5), Inches(4.2))
    table = table_shape.table

    # Format Header Row
    for col_idx, header in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = theme.accent_color
        p = cell.text_frame.paragraphs[0]
        p.text = header
        p.font.name = theme.font_title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = RGBColor(255, 255, 255)

    # Format Data Rows
    for row_idx, row_data in enumerate(rows, start=1):
        for col_idx, val in enumerate(row_data):
            if col_idx < num_cols:
                cell = table.cell(row_idx, col_idx)
                cell.fill.solid()
                cell.fill.fore_color.rgb = theme.card_bg if row_idx % 2 == 1 else theme.bg_color
                p = cell.text_frame.paragraphs[0]
                p.text = str(val)
                p.font.name = theme.font_body
                p.font.size = Pt(12)
                p.font.color.rgb = theme.title_color if col_idx == 0 else theme.body_color

    _add_slide_footer(slide, theme, outline, idx, total)
    _add_speaker_notes(slide, slide_item.notes)

def _render_conclusion_slide(prs, theme: PresentationTheme, slide_item: SlideItem, idx: int, total: int, outline: PresentationOutline):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, prs, theme)
    _add_slide_header(slide, prs, theme, slide_item.title, slide_item.category or "Conclusion & Key Takeaways")

    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(2.1), Inches(11.5), Inches(4.3))
    card.fill.solid()
    card.fill.fore_color.rgb = theme.card_bg
    card.line.color.rgb = theme.card_border

    c_box = slide.shapes.add_textbox(Inches(1.4), Inches(2.4), Inches(10.5), Inches(3.7))
    c_tf = c_box.text_frame
    c_tf.word_wrap = True

    bullets = slide_item.bullets or [
        "AssignmentReady establishes a deterministic formatting pipeline conforming to academic guidelines.",
        "Section-aware pagination guarantees correct Roman preliminaries and Arabic main-body numbering.",
        "Multi-theme presentation synthesis delivers executive-ready slides without recurring AI expenses.",
    ]

    for b_idx, bullet in enumerate(bullets):
        p = c_tf.paragraphs[0] if b_idx == 0 else c_tf.add_paragraph()
        p.text = f"✓   {bullet}"
        p.font.name = theme.font_body
        p.font.size = Pt(17)
        p.font.color.rgb = theme.title_color if b_idx == 0 else theme.body_color
        p.space_after = Pt(16)

    _add_slide_footer(slide, theme, outline, idx, total)
    _add_speaker_notes(slide, slide_item.notes)

def _render_references_slide(prs, theme: PresentationTheme, slide_item: SlideItem, idx: int, total: int, outline: PresentationOutline):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, prs, theme)
    _add_slide_header(slide, prs, theme, slide_item.title, slide_item.category or "References")

    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(2.1), Inches(11.5), Inches(4.3))
    card.fill.solid()
    card.fill.fore_color.rgb = theme.card_bg
    card.line.color.rgb = theme.card_border

    c_box = slide.shapes.add_textbox(Inches(1.4), Inches(2.4), Inches(10.5), Inches(3.7))
    c_tf = c_box.text_frame
    c_tf.word_wrap = True

    bullets = slide_item.bullets or [
        "[1] OpenXML Consortium. (2024). Standard ECMA-376: Office Open XML File Formats.",
        "[2] ISO/IEC 29500-1:2021. Information technology — Document description and processing languages.",
        "[3] University Academic Standards Committee. (2025). Formative Assessment Handbook & Rubric Guidelines.",
    ]

    for b_idx, bullet in enumerate(bullets):
        p = c_tf.paragraphs[0] if b_idx == 0 else c_tf.add_paragraph()
        p.text = bullet
        p.font.name = theme.font_body
        p.font.size = Pt(13)
        p.font.color.rgb = theme.body_color
        p.space_after = Pt(12)

    _add_slide_footer(slide, theme, outline, idx, total)
    _add_speaker_notes(slide, slide_item.notes)

def _render_qa_closing_slide(prs, theme: PresentationTheme, slide_item: SlideItem, idx: int, total: int, outline: PresentationOutline):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, prs, theme)

    top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, Inches(0.12))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = theme.accent_color
    top_bar.line.fill.background()

    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.5), Inches(10.3), Inches(4.5))
    card.fill.solid()
    card.fill.fore_color.rgb = theme.card_bg
    card.line.color.rgb = theme.card_border

    # Centered Q&A Title
    tb = slide.shapes.add_textbox(Inches(2.0), Inches(2.2), Inches(9.3), Inches(1.5))
    tf = tb.text_frame
    p1 = tf.paragraphs[0]
    p1.text = "Questions & Discussion"
    p1.font.name = theme.font_title
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = theme.title_color
    p1.alignment = PP_ALIGN.CENTER

    p2 = tf.add_paragraph()
    p2.text = "Thank you for your time and attention."
    p2.font.name = theme.font_body
    p2.font.size = Pt(18)
    p2.font.color.rgb = theme.body_color
    p2.space_before = Pt(12)
    p2.alignment = PP_ALIGN.CENTER

    p3 = tf.add_paragraph()
    p3.text = f"Presenter: {outline.author or 'Student Author'}   •   {outline.institution or 'Faculty Department'}"
    p3.font.name = theme.font_body
    p3.font.size = Pt(13)
    p3.font.bold = True
    p3.font.color.rgb = theme.accent_color
    p3.space_before = Pt(24)
    p3.alignment = PP_ALIGN.CENTER

    _add_slide_footer(slide, theme, outline, idx, total)
    _add_speaker_notes(slide, slide_item.notes)

def _render_content_slide(prs, theme: PresentationTheme, slide_item: SlideItem, idx: int, total: int, outline: PresentationOutline):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, prs, theme)
    _add_slide_header(slide, prs, theme, slide_item.title, slide_item.category or "Analysis")

    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(2.1), Inches(11.5), Inches(4.3))
    card.fill.solid()
    card.fill.fore_color.rgb = theme.card_bg
    card.line.color.rgb = theme.card_border

    c_box = slide.shapes.add_textbox(Inches(1.4), Inches(2.4), Inches(10.5), Inches(3.7))
    c_tf = c_box.text_frame
    c_tf.word_wrap = True

    bullets = slide_item.bullets if slide_item.bullets else ["Key point and supporting context."]
    for b_idx, bullet in enumerate(bullets):
        p = c_tf.paragraphs[0] if b_idx == 0 else c_tf.add_paragraph()
        p.text = f"•   {bullet}"
        p.font.name = theme.font_body
        p.font.size = Pt(16)
        p.font.color.rgb = theme.body_color
        p.space_after = Pt(14)

    _add_slide_footer(slide, theme, outline, idx, total)
    _add_speaker_notes(slide, slide_item.notes)

# ---------------------------------------------------------------------------
# OUTLINE EXTRACTION
# ---------------------------------------------------------------------------

def classify_slide_type(heading_text: str, bullets: list[str]) -> str:
    h_lower = heading_text.lower()
    if any(k in h_lower for k in ["agenda", "overview", "table of contents", "outline"]):
        return "agenda"
    if any(k in h_lower for k in ["objective", "goal", "aim", "scope"]):
        return "objectives"
    if any(k in h_lower for k in ["method", "methodology", "procedure", "approach"]):
        return "process_workflow"
    if any(k in h_lower for k in ["compare", "comparison", "vs", "versus", "tradeoff", "strengths"]):
        return "comparison"
    if any(k in h_lower for k in ["metric", "stat", "performance", "quantitative"]):
        return "metrics_stats"
    if any(k in h_lower for k in ["result", "finding", "evaluation", "benchmark", "analysis"]):
        # Check if numbers exist in bullets
        has_num = any(re.search(r"\d+%", b) for b in bullets)
        return "metrics_stats" if has_num else "content"
    if any(k in h_lower for k in ["conclusion", "summary", "closing"]):
        return "conclusion"
    if any(k in h_lower for k in ["recommendation", "future work", "next steps"]):
        return "conclusion"
    if any(k in h_lower for k in ["reference", "bibliography", "citations", "works cited"]):
        return "references"
    if any(k in h_lower for k in ["question", "q&a", "discussion"]):
        return "qa_closing"
    return "content"

def extract_presentation_outline_from_docx(doc_path: Path) -> PresentationOutline:
    import docx
    doc = docx.Document(str(doc_path))

    title = "Academic Research Presentation"
    subtitle = "Synthesized Analysis & Key Findings"
    author = "Student Presenter"
    institution = "Academic Institution"

    non_empty = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    for p in non_empty[:4]:
        if 5 < len(p) < 90 and not p.lower().startswith("chapter"):
            title = p
            break

    slides: list[SlideItem] = []
    current_h = ""
    current_bullets: list[str] = []
    current_notes = ""

    def flush():
        nonlocal current_h, current_bullets, current_notes
        if current_h and current_bullets:
            stype = classify_slide_type(current_h, current_bullets)
            category = "Section"
            if stype in ["agenda"]: category = "Overview"
            elif stype in ["objectives"]: category = "Objectives"
            elif stype in ["process_workflow"]: category = "Methodology"
            elif stype in ["metrics_stats"]: category = "Findings"
            elif stype in ["conclusion"]: category = "Summary"
            elif stype in ["references"]: category = "References"

            slides.append(
                SlideItem(
                    title=current_h,
                    category=category,
                    bullets=current_bullets[:5],
                    notes=current_notes or f"Discuss the key implications of {current_h} with emphasis on core results.",
                    slide_type=stype,
                )
            )
        current_bullets = []
        current_notes = ""

    for p in doc.paragraphs:
        txt = p.text.strip()
        if not txt:
            continue

        style_name = p.style.name.lower() if p.style else ""
        is_heading = (
            "heading 1" in style_name
            or "heading 2" in style_name
            or (len(txt) < 70 and (p.runs and p.runs[0].bold and not txt.endswith(".")))
            or re.match(r"^(?:chapter\s+\d+|\d+\.\d*|\b[A-Z\s]{4,}\b)", txt)
        )

        if is_heading:
            flush()
            clean_h = re.sub(r"^\d+[\.\)]\s*", "", txt).strip()
            current_h = clean_h
        else:
            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", txt) if len(s.strip()) > 12]
            for s in sentences:
                if len(current_bullets) < 5:
                    if len(s) > 120:
                        s = s[:117] + "..."
                    current_bullets.append(s)
            if not current_notes and len(txt) > 30:
                current_notes = txt[:300]

    flush()

    if len(slides) < 2 and non_empty:
        chunks = [non_empty[i:i + 4] for i in range(0, len(non_empty), 4)]
        section_names = ["Context & Objectives", "Methodology & Architecture", "Key Findings & Metrics", "Implications & Analysis", "Conclusion & Next Steps"]
        for idx, chunk in enumerate(chunks[:5]):
            h_name = section_names[idx] if idx < len(section_names) else f"Section {idx + 1}"
            bullets = [c[:120] for c in chunk if len(c) > 10][:4]
            stype = classify_slide_type(h_name, bullets)
            slides.append(SlideItem(title=h_name, category="Analysis", bullets=bullets, slide_type=stype))

    # Add Q&A closing slide if not present
    if not any(s.slide_type == "qa_closing" for s in slides):
        slides.append(SlideItem(title="Questions & Discussion", category="Q&A", slide_type="qa_closing"))

    return PresentationOutline(
        title=title,
        subtitle=subtitle,
        author=author,
        institution=institution,
        slides=slides,
    )

def extract_presentation_outline_from_text(text: str) -> PresentationOutline:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    title = lines[0] if lines else "Document Presentation"
    slides: list[SlideItem] = []

    current_title = ""
    current_bullets: list[str] = []

    def flush():
        nonlocal current_title, current_bullets
        if current_title and current_bullets:
            stype = classify_slide_type(current_title, current_bullets)
            slides.append(SlideItem(title=current_title, bullets=current_bullets[:5], slide_type=stype))
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
        slides = [
            SlideItem(title="Executive Overview", bullets=lines[1:5], slide_type="agenda"),
            SlideItem(title="Key Findings", bullets=lines[5:9] if len(lines) > 5 else ["Core summary point."], slide_type="content"),
            SlideItem(title="Conclusion", bullets=["Final assessment summary."], slide_type="conclusion"),
        ]

    # Add Q&A slide
    slides.append(SlideItem(title="Questions & Discussion", slide_type="qa_closing"))

    return PresentationOutline(title=title, slides=slides)

def generate_powerpoint_presentation(
    outline: PresentationOutline,
    theme_key: str = "modern_academic",
) -> bytes:
    """
    Generates a beautifully styled, editable 16:9 widescreen PowerPoint presentation (.pptx).
    Uses custom vector shape layouts, theme color palettes, and typography.
    """
    theme = THEMES.get(theme_key, THEMES["modern_academic"])
    prs = pptx.Presentation()

    # 16:9 Widescreen dimensions (13.333" x 7.5")
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # 1. Title Slide
    _render_title_slide(prs, theme, outline)

    # 2. Content Slides with layout dispatch
    total_slides = len(outline.slides) + 1  # include title slide
    for idx, slide_item in enumerate(outline.slides, start=2):
        stype = slide_item.slide_type

        if stype == "agenda":
            _render_agenda_slide(prs, theme, slide_item, idx, total_slides, outline)
        elif stype == "objectives":
            _render_objectives_slide(prs, theme, slide_item, idx, total_slides, outline)
        elif stype == "process_workflow":
            _render_process_workflow_slide(prs, theme, slide_item, idx, total_slides, outline)
        elif stype == "comparison":
            _render_comparison_slide(prs, theme, slide_item, idx, total_slides, outline)
        elif stype == "metrics_stats":
            _render_metrics_stats_slide(prs, theme, slide_item, idx, total_slides, outline)
        elif stype == "table":
            _render_table_slide(prs, theme, slide_item, idx, total_slides, outline)
        elif stype == "conclusion":
            _render_conclusion_slide(prs, theme, slide_item, idx, total_slides, outline)
        elif stype == "references":
            _render_references_slide(prs, theme, slide_item, idx, total_slides, outline)
        elif stype == "qa_closing":
            _render_qa_closing_slide(prs, theme, slide_item, idx, total_slides, outline)
        else:
            _render_content_slide(prs, theme, slide_item, idx, total_slides, outline)

    out_stream = io.BytesIO()
    prs.save(out_stream)
    return out_stream.getvalue()
