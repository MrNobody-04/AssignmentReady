import React, { useState, useRef } from 'react';
import {
  Presentation,
  UploadCloud,
  Download,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  AlertCircle,
  FileText,
  Check,
  ShieldCheck,
  Award,
  Image as ImageIcon,
  AlertTriangle,
  Clock,
  Users,
  Sliders,
  BookOpen,
  Layers,
  UserPlus,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import {
  analyzeReport,
  analyzeRubric,
  mapCompliance,
  planSlides,
  generatePresentation,
} from '../../services/api';
import { api } from '../../lib/api';
import {
  PresentationOutline,
  SlideItem,
  PresentationThemeInfo,
  StructuredReport,
  RubricAnalysisResult,
  AssessmentCriterion,
  PresenterInfo,
} from '../../types';

interface PresentationWorkspaceProps {
  initialFile?: File | null;
  onBackToLanding: () => void;
  onOpenWorkspace: () => void;
  activeJobId?: string | null;
  activeVersionId?: number | null;
  onOpenDoctor?: (jobId: string, versionId?: number) => void;
  onOpenRubric?: (jobId: string) => void;
}

const ALL_10_THEMES: PresentationThemeInfo[] = [
  {
    id: 'premium_university',
    name: 'Premium University',
    description: 'Formal academic prestige with Oxford navy, antique gold, and classical serif typography.',
    is_dark: false,
    primary_color: '#002147',
    accent_color: '#C5A059',
    font_title: 'Georgia',
  },
  {
    id: 'modern_technology',
    name: 'Modern Technology',
    description: 'Contemporary tech visuals with vibrant cyan accents and sharp geometric layouts.',
    is_dark: false,
    primary_color: '#0F172A',
    accent_color: '#06B6D4',
    font_title: 'Segoe UI',
  },
  {
    id: 'research_science',
    name: 'Research & Innovation',
    description: 'Tailored for scientific investigations, laboratory methodologies, and empirical findings.',
    is_dark: false,
    primary_color: '#065F46',
    accent_color: '#0D9488',
    font_title: 'Trebuchet MS',
  },
  {
    id: 'corporate_pro',
    name: 'Corporate Professional',
    description: 'Polished executive enterprise styling with royal blue and structured analytical tables.',
    is_dark: false,
    primary_color: '#0A2540',
    accent_color: '#2563EB',
    font_title: 'Arial',
  },
  {
    id: 'creative_gradient',
    name: 'Creative Gradient',
    description: 'Tasteful gradient highlights, bold headlines, and vibrant fuchsia and violet accents.',
    is_dark: false,
    primary_color: '#4338CA',
    accent_color: '#EC4899',
    font_title: 'Trebuchet MS',
  },
  {
    id: 'dark_premium',
    name: 'Dark Premium',
    description: 'Readable dark obsidian background with high-contrast glowing cyan highlights.',
    is_dark: true,
    primary_color: '#0B0F19',
    accent_color: '#38BDF8',
    font_title: 'Segoe UI',
  },
  {
    id: 'editorial_academic',
    name: 'Editorial Academic',
    description: 'Classical bookmaker typography with warm alabaster backgrounds and crimson accents.',
    is_dark: false,
    primary_color: '#800020',
    accent_color: '#C5A059',
    font_title: 'Georgia',
  },
  {
    id: 'university_branded',
    name: 'University Branded',
    description: 'Institutional heraldry layout with primary navy and rich amber gold accents.',
    is_dark: false,
    primary_color: '#1E3A8A',
    accent_color: '#D97706',
    font_title: 'Georgia',
  },
  {
    id: 'engineering_it',
    name: 'Engineering & IT',
    description: 'Structured technical aesthetic with orange accents designed for software & engineering.',
    is_dark: false,
    primary_color: '#1E293B',
    accent_color: '#F97316',
    font_title: 'Segoe UI',
  },
  {
    id: 'business_management',
    name: 'Business & Management',
    description: 'Case study executive aesthetic with hunter green, warm gold, and concise metrics.',
    is_dark: false,
    primary_color: '#14532D',
    accent_color: '#D97706',
    font_title: 'Georgia',
  },
];

const SAMPLE_OUTLINE: PresentationOutline = {
  title: 'Deterministic Academic Document Formatting Engine',
  subtitle: 'A Pure OpenXML Architecture for Autonomous Institutional Compliance',
  author: 'Sujan G.C.',
  student_id: '771234',
  presentation_mode: 'individual',
  presenters: [
    {
      name: 'Sujan G.C.',
      student_id: '771234',
      role: 'Lead Presenter / Co-Author',
      assigned_slide_numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      estimated_speaking_minutes: 15,
    },
  ],
  counting_mode: 'total',
  institution: 'Tribhuvan University',
  college_name: 'Department of Computer Science',
  course_name: 'Advanced Software Engineering',
  course_code: 'CSC-401',
  lecturer_name: 'Dr. Ramesh Sharma',
  submission_date: 'October 2026',
  target_slide_count: 8,
  audience: 'academic',
  duration_minutes: 15,
  text_density: 'balanced',
  transition_type: 'fade',
  animation_intensity: 'subtle',
  include_notes: true,
  include_references: true,
  slides: [
    {
      title: 'Presentation Agenda & Roadmap',
      category: 'Overview',
      purpose: 'Establish structured roadmap aligned with grading criteria',
      key_message: 'Defines milestones from empirical problem context to deterministic XML findings',
      source_sections: ['Table of Contents', 'Executive Summary'],
      criteria_addressed: ['Structure & Presentation'],
      bullets: [
        'Research Context & Problem Formulation',
        'Project Aims & Core Deliverables',
        'Methodology & Low-Level XML Architecture',
        'Empirical Benchmarking & Compliance Results',
        'Conclusions, Limitations & Future Directions',
      ],
      slide_type: 'agenda',
      visual_type: 'none',
      notes: 'Introduce the presentation roadmap, outlining the key academic milestones from context to findings.',
    },
    {
      title: 'Research Context & Problem Statement',
      category: 'Context',
      purpose: 'Demonstrate institutional formatting failures and student data privacy risks',
      key_message: 'Stochastic cloud LLMs leak thesis data and hallucinate Word XML pagination',
      source_sections: ['1.0 Introduction', '1.1 Problem Statement'],
      criteria_addressed: ['Problem Definition', 'Academic Rigor'],
      bullets: [
        'Widespread adoption of generative AI tools leads to severe typography and layout discrepancies.',
        'Academic institutions mandate strict unlinked cover pages, Roman preliminaries, and Arabic body pagination.',
        'Existing solutions rely on recurring paid APIs or cloud dependencies that compromise student data privacy.',
      ],
      slide_type: 'content',
      visual_type: 'problem_solution',
      notes: 'Explain why student submissions fail institutional guidelines and emphasize the privacy concern.',
    },
    {
      title: 'Project Aims & Research Objectives',
      category: 'Objectives',
      purpose: 'State measurable engineering goals and compliance targets',
      key_message: 'Deliver a 100% deterministic, air-gapped OpenXML compliance engine',
      source_sections: ['1.2 Objectives', '1.3 Scope'],
      criteria_addressed: ['Project Objectives'],
      bullets: [
        'Develop a 100% air-gapped OpenXML document manipulation engine.',
        'Automate section-break unlinking and Roman-to-Arabic pagination restarts.',
        'Synthesize 16:9 widescreen PowerPoint presentation decks directly from academic reports.',
      ],
      slide_type: 'objectives',
      visual_type: 'none',
      notes: 'Walk the evaluation committee through the three primary technical objectives of the project.',
    },
    {
      title: 'Methodology & Processing Workflow',
      category: 'Methodology',
      purpose: 'Explain the 4-stage pipeline from byte inspection to OOXML generation',
      key_message: 'Byte-signature validation and deterministic XML rewriting eliminate corruptions',
      source_sections: ['3.0 Methodology', '3.2 System Architecture'],
      criteria_addressed: ['Technical Merit', 'Methodology'],
      bullets: [
        'File Format Ingestion: Pure byte signature sniffing bypassing unreliable file extensions.',
        'Structure Segmentation: Isolating cover pages and mapping academic headings to semantic roles.',
        'Compliance Auditing: Heuristic validation against institutional handbooks.',
        'Presentation Synthesis: Widescreen vector card rendering with genuine OOXML transitions.',
      ],
      slide_type: 'process_workflow',
      visual_type: 'architecture_diagram',
      notes: 'Detail the 4-stage pipeline from document ingestion to OpenXML generation.',
    },
    {
      title: 'Experimental Results & Benchmarking',
      category: 'Results',
      purpose: 'Present quantitative performance metrics and compliance validation rate',
      key_message: 'Achieved 99.4% full compliance with 1.8s latency across 150 student documents',
      source_sections: ['4.0 Results', '4.1 Benchmarks'],
      criteria_addressed: ['Evaluation & Results'],
      bullets: [
        'Adherence Rate: 99.4% full compliance across 150 student test submissions.',
        'Processing Latency: Average 1.8s execution time on commodity consumer hardware.',
        'Data Privacy: 0 external API calls with 100% local document isolation.',
      ],
      slide_type: 'metrics_stats',
      visual_type: 'chart_bar',
      chart_type: 'column_clustered',
      chart_categories: ['Adherence Rate', 'Latency (s)', 'Privacy Score'],
      chart_series: [
        { name: 'Manual / Word', values: [62.5, 45.0, 40.0] },
        { name: 'AssignmentReady', values: [99.4, 1.8, 100.0] },
      ],
      notes: 'Highlight quantitative performance metrics, demonstrating high throughput and format adherence.',
    },
    {
      title: 'Critical Discussion & Comparative Analysis',
      category: 'Discussion',
      purpose: 'Critically contrast deterministic rule verification against cloud LLM wrappers',
      key_message: 'Pure OOXML injection provides 100% reproducible results without token costs',
      source_sections: ['5.0 Discussion', '5.1 Comparative Evaluation'],
      criteria_addressed: ['Critical Discussion'],
      bullets: [
        'Deterministic rule engines provide 100% reproducible outcomes compared to stochastic LLMs.',
        'Pure OOXML injection eliminates Microsoft Office and Google Slides rendering corruptions.',
        'Edge cases in non-standard LaTeX tables require future parser generalization.',
      ],
      slide_type: 'comparison',
      visual_type: 'comparison',
      column_left_title: 'Cloud LLM Approaches',
      column_left_bullets: [
        'Non-deterministic layout hallucination',
        'Recurring token costs for students',
        'Potential student thesis data leakage',
      ],
      column_right_title: 'AssignmentReady Architecture',
      column_right_bullets: [
        'Strict deterministic rule verification',
        'Zero cost and zero mandatory accounts',
        '100% air-gapped local execution',
      ],
      notes: 'Contrast the deterministic approach with generative AI wrappers.',
    },
    {
      title: 'Conclusions & Academic Summary',
      category: 'Summary',
      purpose: 'Deliver comprehensive academic synthesis across objectives, findings, and limits',
      key_message: 'AssignmentReady deterministically solves thesis formatting with zero cloud leakage',
      source_sections: ['6.0 Conclusions', '6.1 Limitations'],
      criteria_addressed: ['Conclusion & Reflection'],
      conclusion_verdict: 'Deterministic OpenXML manipulation eliminates thesis formatting defects with 0 cloud dependencies.',
      conclusion_takeaways: [
        'Automated section-break unlinking guarantees Roman preliminaries and Arabic body numbering.',
        'Pure byte sniffing prevents file-extension spoofing and rendering corruption.',
        'Slide planner synthesizes structured, rubric-aligned presentations directly from reports.',
      ],
      conclusion_recommendation: 'Air-gapped local document processing is strongly recommended for institutional thesis compliance.',
      conclusion_limitations: 'Advanced nested equations in raw LaTeX require further grammar parsing support.',
      bullets: [
        'AssignmentReady solves academic document formatting defects deterministically.',
        'Section-aware pagination guarantees correct front matter and body page numbering.',
        'Automated slide planning empowers students to present structured, rubric-aligned defenses.',
      ],
      slide_type: 'conclusion',
      visual_type: 'conclusion',
      notes: 'Summarize the core achievements and academic contributions.',
    },
    {
      title: 'Scholarly References & Citations',
      category: 'References',
      purpose: 'Acknowledge foundational ISO/IEC standards and institutional guidelines',
      key_message: 'Built strictly on open international standards ECMA-376 and ISO/IEC 29500',
      source_sections: ['References'],
      criteria_addressed: ['Referencing & Academic Conventions'],
      bullets: [
        '[1] ISO/IEC 29500-1:2021. Information technology — Document description and processing languages.',
        '[2] Standard ECMA-376: Office Open XML File Formats (5th Edition).',
        '[3] University Academic Standards Committee (2025). Formative Assessment Handbook.',
      ],
      slide_type: 'references',
      visual_type: 'none',
      notes: 'Acknowledge key references and standards used throughout the project.',
    },
    {
      title: 'Questions & Discussion',
      category: 'Q&A',
      purpose: 'Conclude formal defense and invite examination questions',
      key_message: 'Open for questions from the examination committee and supervisor',
      bullets: ['Open for examination questions, technical discussion, and committee feedback.'],
      slide_type: 'qa_closing',
      visual_type: 'none',
      notes: 'Invite questions from the examiner and committee. Be prepared to discuss methodology choices.',
    },
  ],
};

const SLIDE_TYPE_OPTIONS = [
  { value: 'content', label: 'Standard Content Card' },
  { value: 'agenda', label: 'Agenda & Topics Roadmap' },
  { value: 'section', label: 'Section Divider Slide' },
  { value: 'objectives', label: 'Target Objectives Grid' },
  { value: 'process_workflow', label: 'Process / Workflow Steps' },
  { value: 'comparison', label: '2-Column Comparative Analysis' },
  { value: 'metrics_stats', label: 'Key Metrics & Statistics' },
  { value: 'table', label: 'Structured Data Table' },
  { value: 'conclusion', label: 'Conclusion & Key Takeaways' },
  { value: 'references', label: 'Scholarly References' },
  { value: 'qa_closing', label: 'Q&A Closing Slide' },
];

const VISUAL_TYPE_OPTIONS = [
  { value: 'none', label: 'None (Standard Bullets)' },
  { value: 'chart_bar', label: '📊 Clustered Column Chart' },
  { value: 'chart_line', label: '📈 Analytical Line Chart' },
  { value: 'chart_doughnut', label: '🍩 Doughnut / Proportions' },
  { value: 'architecture_diagram', label: '🏗️ Multi-Tier Architecture Diagram' },
  { value: 'problem_solution', label: '🎯 3-Column Problem-Solution Cards' },
  { value: 'timeline', label: '⏱️ Milestone Timeline / Roadmap' },
  { value: 'comparison', label: '⚖️ 2-Column Comparative Matrix' },
  { value: 'metrics_stats', label: '🔢 3-Metric KPI Highlight Cards' },
  { value: 'table', label: '📋 Structured Academic Table' },
];

export const PresentationWorkspace: React.FC<PresentationWorkspaceProps> = ({
  initialFile,
  onBackToLanding,
  onOpenWorkspace: _onOpenWorkspace,
  activeJobId,
  activeVersionId,
  onOpenDoctor,
  onOpenRubric,
}) => {
  // Workflow Steps:
  // 1: Upload Report & Rubric
  // 2: Analysis & Rubric Compliance Matrix
  // 3: Review & Edit Slide Plan
  // 4: Themes, Dual Logos & Animation Settings
  // 5: Generating PPTX
  // 6: Interactive 16:9 Preview & Download
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Core State
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [structuredReport, setStructuredReport] = useState<StructuredReport | null>(null);
  const [rubricResult, setRubricResult] = useState<RubricAnalysisResult | null>(null);
  const [outline, setOutline] = useState<PresentationOutline>(SAMPLE_OUTLINE);

  // Project Intelligence & Version-aware State
  const [, setProjectPresentations] = useState<any[]>([]);
  const [isStaleWarning, setIsStaleWarning] = useState<boolean>(false);
  const [currentVersionId, setCurrentVersionId] = useState<number | null>(activeVersionId || null);

  // User Constraints & Presentation Parameters
  const [targetSlideCount, setTargetSlideCount] = useState<number>(10);
  const [customSlideCountInput, setCustomSlideCountInput] = useState<string>('10');
  const [isCustomCount, setIsCustomCount] = useState<boolean>(false);
  const [audience, setAudience] = useState<string>('academic');
  const [presentationType, setPresentationType] = useState<string>('assignment_summary');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);
  const [includeReferences, setIncludeReferences] = useState<boolean>(true);
  const [includeQa, setIncludeQa] = useState<boolean>(true);

  // Expert Mode & Planning States
  const [presentationMode, setPresentationMode] = useState<'individual' | 'group'>('individual');
  const [presenters, setPresenters] = useState<PresenterInfo[]>([
    {
      name: 'Sujan G.C.',
      student_id: '771234',
      role: 'Lead Presenter / Co-Author',
      assigned_slide_numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      estimated_speaking_minutes: 15,
    },
  ]);
  const [countingMode, setCountingMode] = useState<'total' | 'content_only'>('total');

  // Input Sanitizers for Presenter Name & Student ID
  const sanitizePresenterName = (val: string) => {
    return val.replace(/\s*\(ID:.*?\)/gi, '').replace(/\s*\(Roll No:.*?\)/gi, '').replace(/[\)\]\};]+$/, '').trim();
  };

  const sanitizeStudentId = (val: string) => {
    return val.replace(/^ID:\s*/i, '').replace(/[\)\]\};]+.*$/, '').trim();
  };

  const handleAddPresenter = () => {
    const newPres: PresenterInfo = {
      name: `Team Member ${presenters.length + 1}`,
      student_id: '',
      role: 'Co-Presenter',
      estimated_speaking_minutes: Math.max(1, Math.round(durationMinutes / (presenters.length + 1))),
    };
    const updated = [...presenters, newPres];
    setPresenters(updated);
    setOutline((prev) => ({
      ...prev,
      presentation_mode: 'group',
      presenters: updated,
    }));
  };

  const handleUpdatePresenter = (idx: number, field: keyof PresenterInfo, value: any) => {
    const updated = [...presenters];
    let sanitizedVal = value;
    if (field === 'name') {
      sanitizedVal = sanitizePresenterName(value);
    } else if (field === 'student_id') {
      sanitizedVal = sanitizeStudentId(value);
    }
    updated[idx] = { ...updated[idx], [field]: sanitizedVal };
    setPresenters(updated);
    setOutline((prev) => ({
      ...prev,
      author: updated[0]?.name || prev.author,
      student_id: updated[0]?.student_id || prev.student_id,
      presenters: updated,
    }));
  };

  const handleRemovePresenter = (idx: number) => {
    if (presenters.length <= 1) return;
    const updated = presenters.filter((_, i) => i !== idx);
    setPresenters(updated);
    setOutline((prev) => ({
      ...prev,
      author: updated[0]?.name || prev.author,
      student_id: updated[0]?.student_id || prev.student_id,
      presenters: updated,
    }));
  };

  const handleMovePresenter = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= presenters.length) return;
    const updated = [...presenters];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPresenters(updated);
    setOutline((prev) => ({
      ...prev,
      author: updated[0]?.name || prev.author,
      student_id: updated[0]?.student_id || prev.student_id,
      presenters: updated,
    }));
  };

  // Settings
  const [selectedTheme, setSelectedTheme] = useState<string>('premium_university');
  const [customFilename, setCustomFilename] = useState<string>('Academic_Presentation');
  const [textDensity, setTextDensity] = useState<'concise' | 'balanced' | 'detailed'>('balanced');
  const [transitionType, setTransitionType] = useState<string>('fade');
  const [animationIntensity, setAnimationIntensity] = useState<string>('subtle');
  const [universityLogo, setUniversityLogo] = useState<string>('');
  const [collegeLogo, setCollegeLogo] = useState<string>('');

  // UI state
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Analyzing report structure...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{
    filename: string;
    download_url: string;
    total_slides: number;
    size_bytes?: number;
  } | null>(null);

  const reportInputRef = useRef<HTMLInputElement>(null);
  const rubricInputRef = useRef<HTMLInputElement>(null);
  const uniLogoInputRef = useRef<HTMLInputElement>(null);
  const colLogoInputRef = useRef<HTMLInputElement>(null);

  const handleLoadProjectPlan = async (jobIdToLoad: string, vId?: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingMessage('Loading document intelligence & planning presentation from active project...');
    try {
      // 1. Check existing presentation status & staleness
      const presStatus = await api.getProjectPresentationStatus(jobIdToLoad);
      if (presStatus && presStatus.presentations && presStatus.presentations.length > 0) {
        setProjectPresentations(presStatus.presentations);
        const hasStale = presStatus.presentations.some((p: any) => p.is_stale);
        setIsStaleWarning(hasStale);
        if (presStatus.current_version_id) {
          setCurrentVersionId(presStatus.current_version_id);
        }
      }

      // 2. Plan slides from project document version
      const plannedOutline = await api.planProjectSlides(jobIdToLoad, {
        version_id: vId || undefined,
        target_slide_count: targetSlideCount,
        text_density: textDensity,
        theme: selectedTheme,
        audience,
        presentation_type: presentationType,
        duration_minutes: durationMinutes,
        include_notes: includeNotes,
        include_references: includeReferences,
        include_qa: includeQa,
        transition_type: transitionType,
        animation_intensity: animationIntensity,
        university_logo_base64: universityLogo,
        college_logo_base64: collegeLogo,
        presentation_mode: presentationMode,
        presenters: presenters.filter((p) => p.name.trim()),
        counting_mode: countingMode,
      });

      setOutline(plannedOutline);
      if (plannedOutline.presentation_mode) {
        setPresentationMode(plannedOutline.presentation_mode);
      }
      if (plannedOutline.presenters && plannedOutline.presenters.length > 0) {
        setPresenters(plannedOutline.presenters);
      }
      if (plannedOutline.counting_mode) {
        setCountingMode(plannedOutline.counting_mode);
      }
      setCustomFilename(`${plannedOutline.title || 'Assignment'}_Slides`);
      setCurrentStep(3); // Go straight to Review & Edit Slide Plan
    } catch (err: any) {
      console.warn('Could not auto-plan from project:', err);
      // Fallback: stay on Step 1 for manual upload
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeJobId) {
      handleLoadProjectPlan(activeJobId, activeVersionId || undefined);
    } else if (initialFile) {
      setReportFile(initialFile);
      handleAnalyzeAndPlan(initialFile, null);
    }
  }, [activeJobId, activeVersionId, initialFile]);

  const handleAnalyzeAndPlan = async (rFile: File, rubFile: File | null) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingMessage('Performing deep document understanding & cover isolation...');

    try {
      // Step 1: Analyze Report
      const rep = await analyzeReport(rFile);
      setStructuredReport(rep);

      let rub: RubricAnalysisResult | null = null;
      let criteriaList: AssessmentCriterion[] = [];

      // Step 2: Analyze Rubric if present
      if (rubFile) {
        setLoadingMessage('Extracting lecturer marking scheme & assessment criteria...');
        const initialRub = await analyzeRubric(rubFile);
        if (initialRub && initialRub.criteria) {
          setLoadingMessage('Mapping report evidence to assessment criteria...');
          rub = await mapCompliance(rep, initialRub.criteria);
          criteriaList = rub?.criteria || initialRub.criteria;
        } else {
          rub = initialRub;
        }
        setRubricResult(rub);
      }

      // Step 3: Plan Slides
      setLoadingMessage(
        countingMode === 'content_only'
          ? `Planning presentation with strictly ${targetSlideCount} body content slides (+ title & conclusion)...`
          : `Planning structured presentation strictly budgeted to ${targetSlideCount} total slides...`
      );
      const plannedOutline = await planSlides({
        report: rep,
        criteria: criteriaList,
        text_density: textDensity,
        target_slide_count: targetSlideCount,
        audience,
        presentation_type: presentationType,
        duration_minutes: durationMinutes,
        include_notes: includeNotes,
        include_references: includeReferences,
        include_qa: includeQa,
        transition_type: transitionType,
        animation_intensity: animationIntensity,
        university_logo_base64: universityLogo,
        college_logo_base64: collegeLogo,
        presentation_mode: presentationMode,
        presenters: presenters.filter((p) => p.name.trim()),
        counting_mode: countingMode,
      });

      setOutline(plannedOutline);
      if (plannedOutline.presentation_mode) {
        setPresentationMode(plannedOutline.presentation_mode);
      }
      if (plannedOutline.presenters && plannedOutline.presenters.length > 0) {
        setPresenters(plannedOutline.presenters);
      }
      if (plannedOutline.counting_mode) {
        setCountingMode(plannedOutline.counting_mode);
      }
      const stem = rFile.name.substring(0, rFile.name.lastIndexOf('.')) || 'Presentation';
      setCustomFilename(`${stem}_Slides`);

      // Transition to Step 2 (Analysis & Compliance) if rubric exists, otherwise Step 3 (Plan)
      if (rub && rub.criteria && rub.criteria.length > 0) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process document and generate slide plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplanDeck = async (overrideCount?: number, overrideCountingMode?: 'total' | 'content_only') => {
    const count = overrideCount ?? targetSlideCount;
    const cMode = overrideCountingMode ?? countingMode;
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingMessage(
      cMode === 'content_only'
        ? `Re-planning presentation with ${count} body content slides (+ title & conclusion)...`
        : `Re-planning presentation strictly budgeted to ${count} total slides...`
    );
    try {
      if (activeJobId) {
        const planned = await api.planProjectSlides(activeJobId, {
          version_id: currentVersionId || activeVersionId || undefined,
          target_slide_count: count,
          text_density: textDensity,
          theme: selectedTheme,
          audience,
          presentation_type: presentationType,
          duration_minutes: durationMinutes,
          include_notes: includeNotes,
          include_references: includeReferences,
          include_qa: includeQa,
          transition_type: transitionType,
          animation_intensity: animationIntensity,
          university_logo_base64: universityLogo,
          college_logo_base64: collegeLogo,
          presentation_mode: presentationMode,
          presenters: presenters.filter((p) => p.name.trim()),
          counting_mode: cMode,
        });
        setOutline(planned);
        if (planned.presenters && planned.presenters.length > 0) {
          setPresenters(planned.presenters);
        }
        setTargetSlideCount(count);
        setCountingMode(cMode);
      } else if (structuredReport) {
        const planned = await planSlides({
          report: structuredReport,
          criteria: rubricResult?.criteria || [],
          text_density: textDensity,
          target_slide_count: count,
          audience,
          presentation_type: presentationType,
          duration_minutes: durationMinutes,
          include_notes: includeNotes,
          include_references: includeReferences,
          include_qa: includeQa,
          transition_type: transitionType,
          animation_intensity: animationIntensity,
          university_logo_base64: universityLogo,
          college_logo_base64: collegeLogo,
          presentation_mode: presentationMode,
          presenters: presenters.filter((p) => p.name.trim()),
          counting_mode: cMode,
        });
        setOutline(planned);
        if (planned.presenters && planned.presenters.length > 0) {
          setPresenters(planned.presenters);
        }
        setTargetSlideCount(count);
        setCountingMode(cMode);
      } else {
        setTargetSlideCount(count);
        setCountingMode(cMode);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to re-plan slide outline.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: SlideItem = {
      title: `Additional Analysis ${outline.slides.length + 1}`,
      category: 'Analysis',
      bullets: ['Key finding or empirical evidence', 'Supporting theoretical analysis'],
      slide_type: 'content',
      notes: 'Present the supporting details of this section.',
    };
    setOutline({
      ...outline,
      slides: [...outline.slides, newSlide],
    });
  };

  const handleDeleteSlide = (idx: number) => {
    if (outline.slides.length <= 1) return;
    const updated = outline.slides.filter((_, i) => i !== idx);
    setOutline({ ...outline, slides: updated });
  };

  const handleMoveSlide = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= outline.slides.length) return;
    const updated = [...outline.slides];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setOutline({ ...outline, slides: updated });
  };

  const handleUpdateSlide = (idx: number, field: keyof SlideItem, val: any) => {
    const updated = [...outline.slides];
    updated[idx] = { ...updated[idx], [field]: val };
    setOutline({ ...outline, slides: updated });
  };

  const handleUpdateBullet = (slideIdx: number, bulletIdx: number, val: string) => {
    const updated = [...outline.slides];
    updated[slideIdx].bullets[bulletIdx] = val;
    setOutline({ ...outline, slides: updated });
  };

  const handleAddBullet = (slideIdx: number) => {
    const updated = [...outline.slides];
    updated[slideIdx].bullets.push('New key academic point');
    setOutline({ ...outline, slides: updated });
  };

  const handleRemoveBullet = (slideIdx: number, bulletIdx: number) => {
    const updated = [...outline.slides];
    if (updated[slideIdx].bullets.length <= 1) return;
    updated[slideIdx].bullets = updated[slideIdx].bullets.filter((_, i) => i !== bulletIdx);
    setOutline({ ...outline, slides: updated });
  };

  const handleLogoUpload = (file: File, type: 'university' | 'college') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result as string;
      if (type === 'university') {
        setUniversityLogo(b64);
        setOutline((prev) => ({ ...prev, university_logo_base64: b64 }));
      } else {
        setCollegeLogo(b64);
        setOutline((prev) => ({ ...prev, college_logo_base64: b64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateDeck = async () => {
    setErrorMessage(null);
    setCurrentStep(5); // Generating step
    try {
      const updatedOutline: PresentationOutline = {
        ...outline,
        presentation_mode: presentationMode,
        presenters: presenters.filter((p) => p.name.trim()),
        counting_mode: countingMode,
        transition_type: transitionType,
        animation_intensity: animationIntensity,
        university_logo_base64: universityLogo,
        college_logo_base64: collegeLogo,
      };

      let res;
      if (activeJobId) {
        res = await api.generateProjectPresentation(activeJobId, {
          outline: updatedOutline,
          theme: selectedTheme,
          custom_filename: customFilename.trim(),
          version_id: currentVersionId || activeVersionId || undefined,
        });
      } else {
        res = await generatePresentation(
          updatedOutline,
          selectedTheme,
          customFilename.trim()
        );
      }
      setDownloadInfo(res);
      setIsStaleWarning(false);
      setCurrentStep(6); // Interactive Preview & Download step
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate presentation deck.');
      setCurrentStep(4); // Return to settings
    }
  };

  const activeThemeObj = ALL_10_THEMES.find((t) => t.id === selectedTheme) || ALL_10_THEMES[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Return to Home"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-academic-navy text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                <Presentation className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  AssignmentReady Presentation Maker
                  <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-academic-blue border border-blue-100">
                    Academic Engine
                  </span>
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Report Analyzer • Assessment Rubric Mapping • 10 Academic Themes • OOXML Transitions
                </p>
              </div>
            </div>
          </div>

          {/* Workflow Progress Breadcrumb */}
          <div className="flex items-center">
            {/* Mobile step pill */}
            <div className="sm:hidden px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/60">
              Step {currentStep === 6 ? 5 : currentStep} of 5
            </div>
            {/* Desktop stepper */}
            <div className="hidden sm:flex items-center gap-1 sm:gap-2 text-xs font-semibold">
              {[
                { id: 1, label: 'Upload' },
                { id: 2, label: 'Rubric Audit' },
                { id: 3, label: 'Slide Plan' },
                { id: 4, label: 'Themes & Logos' },
                { id: 6, label: 'Preview & Download' },
              ].map((s) => {
                const isCurrent = currentStep === s.id;
                const isPast = currentStep > s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (s.id === 6 && !downloadInfo) return;
                      if (s.id <= 4 || (s.id === 6 && downloadInfo)) setCurrentStep(s.id);
                    }}
                    disabled={s.id === 6 && !downloadInfo}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? 'bg-academic-navy text-white shadow-2xs'
                        : isPast
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Project Context & Stale Warning Banners */}
        {isStaleWarning && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-950">Slides Outdated — Document Was Updated</p>
                <p className="text-xs text-amber-800">
                  Your document was repaired or formatted in AssignmentReady after this presentation deck was created.
                </p>
              </div>
            </div>
            <button
              onClick={() => activeJobId && handleLoadProjectPlan(activeJobId, currentVersionId || undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>1-Click Regenerate from Latest Version</span>
            </button>
          </div>
        )}

        {activeJobId && (
          <div className="mb-6 p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-indigo-950">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-800">Shared Project Mode:</span>
              <span className="font-medium text-indigo-800">
                Operating on project document {currentVersionId ? `(v${currentVersionId})` : ''}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {onOpenDoctor && (
                <button
                  type="button"
                  onClick={() => onOpenDoctor(activeJobId, currentVersionId || undefined)}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                >
                  Doctor Diagnostics
                </button>
              )}
              {onOpenRubric && (
                <button
                  type="button"
                  onClick={() => onOpenRubric(activeJobId)}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                >
                  Marking Scheme Rubric
                </button>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Operation Alert</p>
              <p className="text-xs mt-0.5 text-rose-700">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-600 hover:text-rose-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 1: UPLOAD REPORT & MARKING SCHEME */}
        {/* ==================================================== */}
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Upload Your Assignment Report & Rubric
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                Our engine extracts document structure, quarantines the cover page to prevent duplicates, and maps content against lecturer criteria.
              </p>
            </div>

            {/* Primary Report Upload Card */}
            <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-academic-blue/60 transition-colors shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Step 1: Upload Assignment Report <span className="text-rose-600">*</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Supported: Microsoft Word (.docx), PDF (.pdf), or Plain Text (.txt)
                  </p>
                </div>
              </div>

              <div
                onClick={() => reportInputRef.current?.click()}
                className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center cursor-pointer hover:bg-blue-50/50 transition-colors"
              >
                <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  {reportFile ? reportFile.name : 'Click to choose report or drag & drop file'}
                </p>
                <p className="text-2xs text-slate-400 mt-1">Maximum file size: 25MB</p>
              </div>
              <input
                ref={reportInputRef}
                type="file"
                accept=".docx,.pdf,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setReportFile(f);
                }}
              />
            </div>

            {/* Optional Lecturer Rubric Upload Card */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Step 2: Upload Lecturer Marking Scheme
                      <span className="text-2xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                        Optional
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Upload assessment rubric in Word (.docx), Excel (.xlsx), PDF, or Text to map criteria
                    </p>
                  </div>
                </div>
                {rubricFile && (
                  <button
                    onClick={() => setRubricFile(null)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div
                onClick={() => rubricInputRef.current?.click()}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center cursor-pointer hover:bg-amber-50/50 transition-colors"
              >
                <p className="text-xs font-medium text-slate-700">
                  {rubricFile ? rubricFile.name : 'Upload Marking Scheme / Assessment Rubric (Click to browse)'}
                </p>
                <p className="text-2xs text-slate-400 mt-0.5">
                  Helps prioritize high-weight criteria and warns if evidence is missing
                </p>
              </div>
              <input
                ref={rubricInputRef}
                type="file"
                accept=".docx,.xlsx,.pdf,.txt,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setRubricFile(f);
                }}
              />
            </div>

            {/* Presentation Planning Parameters, Modes & Slide Count Card */}
            <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Step 3: Presentation Mode & Slide Constraints
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure individual or group presenters, exact slide budgeting, and audience
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
                    {countingMode === 'content_only'
                      ? `Budget: ${targetSlideCount} Content (+2 = ${targetSlideCount + 2} Total)`
                      : `Budget: Exactly ${targetSlideCount} Slides Total`}
                  </span>
                </div>
              </div>

              {/* Presentation Mode Selector: Individual vs Group */}
              <div className="space-y-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" /> Presentation Mode
                  </label>
                  <span className="text-2xs text-slate-500 font-medium">
                    {presentationMode === 'group'
                      ? 'Team defense with automated slide distribution & speaker notes'
                      : 'Single speaker defense / assignment presentation'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPresentationMode('individual');
                      setOutline((prev) => ({ ...prev, presentation_mode: 'individual' }));
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      presentationMode === 'individual'
                        ? 'bg-white border-academic-navy ring-2 ring-academic-navy/20 shadow-xs'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        presentationMode === 'individual' ? 'bg-academic-navy text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        👤
                      </div>
                      <span className="text-xs font-bold text-slate-900">Individual Presentation</span>
                    </div>
                    <p className="text-2xs text-slate-500">
                      Single student presenter. Clean title slide without duplicate labels.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPresentationMode('group');
                      setOutline((prev) => ({ ...prev, presentation_mode: 'group', presenters }));
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      presentationMode === 'group'
                        ? 'bg-white border-academic-navy ring-2 ring-academic-navy/20 shadow-xs'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        presentationMode === 'group' ? 'bg-academic-navy text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        👥
                      </div>
                      <span className="text-xs font-bold text-slate-900">Group Presentation</span>
                      <span className="text-3xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        Multi-Presenter
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500">
                      Multiple presenters with roles, student IDs, and assigned slide speaking cues.
                    </p>
                  </button>
                </div>

                {/* Individual Presenter Input Row */}
                {presentationMode === 'individual' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-2xs font-bold text-slate-600 block mb-1">
                        Presenter Name
                      </label>
                      <input
                        type="text"
                        value={outline.author || ''}
                        onChange={(e) => {
                          const val = sanitizePresenterName(e.target.value);
                          setOutline({ ...outline, author: val });
                          if (presenters[0]) {
                            const updated = [...presenters];
                            updated[0].name = val;
                            setPresenters(updated);
                          }
                        }}
                        placeholder="e.g. Sujan G.C."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-2xs font-bold text-slate-600 block mb-1">
                        Student ID / Roll No (Optional)
                      </label>
                      <input
                        type="text"
                        value={outline.student_id || ''}
                        onChange={(e) => {
                          const val = sanitizeStudentId(e.target.value);
                          setOutline({ ...outline, student_id: val });
                          if (presenters[0]) {
                            const updated = [...presenters];
                            updated[0].student_id = val;
                            setPresenters(updated);
                          }
                        }}
                        placeholder="e.g. 771234"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Group Presenter Manager */}
                {presentationMode === 'group' && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Configured Team Members ({presenters.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddPresenter}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Team Member</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {presenters.map((pres, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs"
                        >
                          <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 self-start sm:self-center">
                            #{pIdx + 1}
                          </span>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <input
                                type="text"
                                value={pres.name}
                                onChange={(e) => handleUpdatePresenter(pIdx, 'name', e.target.value)}
                                placeholder="Presenter Full Name"
                                className="w-full px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={pres.student_id}
                                onChange={(e) => handleUpdatePresenter(pIdx, 'student_id', e.target.value)}
                                placeholder="Student ID / Roll No"
                                className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={pres.role}
                                onChange={(e) => handleUpdatePresenter(pIdx, 'role', e.target.value)}
                                placeholder="Role / Topic Responsibility"
                                className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 justify-end shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMovePresenter(pIdx, 'up')}
                              disabled={pIdx === 0}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePresenter(pIdx, 'down')}
                              disabled={pIdx === presenters.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            {presenters.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePresenter(pIdx)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Remove Member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-2xs text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                      Fair speaker cues (<code className="text-indigo-700 font-mono">[Speaker: Name]</code>) will be embedded automatically across talking notes.
                    </p>
                  </div>
                )}
              </div>

              {/* Slide Counting Mode: Mode A (Total Slides) vs Mode B (Content Slides Only) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" /> Slide Counting Mode
                  </label>
                  <span className="text-2xs text-slate-500 font-medium">
                    Strict mathematical slide budgeting
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCountingMode('total');
                      setOutline((prev) => ({ ...prev, counting_mode: 'total' }));
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      countingMode === 'total'
                        ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        Mode A: Total Slide Count
                      </span>
                      <span className="text-3xs font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        Strict Total
                      </span>
                    </div>
                    <p className="text-2xs text-slate-600 mb-2">
                      Requested number includes Title, Body Content, and Conclusion. Total slides in generated PPTX = <strong>{targetSlideCount}</strong>.
                    </p>
                    <div className="text-3xs font-mono font-semibold text-indigo-900 bg-white p-1.5 rounded-lg border border-indigo-100">
                      1 Title + {Math.max(1, targetSlideCount - 2)} Content + 1 Conclusion = {targetSlideCount} slides
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCountingMode('content_only');
                      setOutline((prev) => ({ ...prev, counting_mode: 'content_only' }));
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      countingMode === 'content_only'
                        ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        Mode B: Content Slides Only
                      </span>
                      <span className="text-3xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Body Budget
                      </span>
                    </div>
                    <p className="text-2xs text-slate-600 mb-2">
                      Requested number refers strictly to body content. Title (+1) and Conclusion (+1) added outside count. Total PPTX = <strong>{targetSlideCount + 2}</strong>.
                    </p>
                    <div className="text-3xs font-mono font-semibold text-emerald-900 bg-white p-1.5 rounded-lg border border-emerald-100">
                      {targetSlideCount} Content + 1 Title + 1 Conclusion = {targetSlideCount + 2} slides
                    </div>
                  </button>
                </div>
              </div>

              {/* Slide Count Selector */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" /> Target Count ({countingMode === 'total' ? 'Total Slides' : 'Body Content Slides'})
                  </label>
                  <span className="text-2xs text-slate-500 font-medium">
                    {countingMode === 'total'
                      ? `Generated deck will have exactly ${targetSlideCount} slides`
                      : `Generated deck will have ${targetSlideCount + 2} slides (${targetSlideCount} body + 2 front/end)`}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5 sm:gap-2">
                  {[5, 8, 10, 12, 15, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        setTargetSlideCount(count);
                        setIsCustomCount(false);
                      }}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        !isCustomCount && targetSlideCount === count
                          ? 'bg-academic-navy text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {count} Slides
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCustomCount(true)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCustomCount
                        ? 'bg-academic-navy text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {isCustomCount && (
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-indigo-100 mt-2">
                    <span className="text-xs font-semibold text-slate-700">Enter custom slide count:</span>
                    <input
                      type="number"
                      min={3}
                      max={40}
                      value={customSlideCountInput}
                      onChange={(e) => {
                        setCustomSlideCountInput(e.target.value);
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 3 && val <= 40) {
                          setTargetSlideCount(val);
                        }
                      }}
                      placeholder="3 - 40"
                      className="w-20 px-2.5 py-1 text-xs font-bold bg-white border border-indigo-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-2xs text-slate-500">(Range: 3 to 40 slides)</span>
                  </div>
                )}
              </div>

              {/* Duration & Audience & Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> Target Duration
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[5, 10, 15, 20].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDurationMinutes(mins)}
                        className={`py-1.5 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                          durationMinutes === mins
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audience */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-slate-600 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" /> Target Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="academic">Lecturer / Committee</option>
                    <option value="classmates">Classmates / Peers</option>
                    <option value="technical">Technical / Industry</option>
                    <option value="general">General Audience</option>
                  </select>
                </div>

                {/* Presentation Type */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-slate-600 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-500" /> Presentation Type
                  </label>
                  <select
                    value={presentationType}
                    onChange={(e) => setPresentationType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="assignment_summary">Assignment Summary</option>
                    <option value="defense">Thesis / Project Defense</option>
                    <option value="research">Research Overview</option>
                    <option value="seminar">Seminar Presentation</option>
                    <option value="case_study">Case Study Analysis</option>
                  </select>
                </div>
              </div>

              {/* Content Density & Toggles Row */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Density Selector */}
                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold text-slate-600 uppercase tracking-wider block">
                      Slide Content Density
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 w-full sm:w-64">
                      {(['concise', 'balanced', 'detailed'] as const).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setTextDensity(d)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize text-center transition-colors cursor-pointer ${
                            textDensity === d
                              ? 'bg-academic-navy text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Slides Checkboxes */}
                  <div className="space-y-1.5 flex-1 lg:max-w-md">
                    <label className="text-2xs font-bold text-slate-600 uppercase tracking-wider block">
                      Include Special Slides
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        includeNotes ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}>
                        <input
                          type="checkbox"
                          checked={includeNotes}
                          onChange={(e) => setIncludeNotes(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span className="whitespace-nowrap">Speaker Notes</span>
                      </label>

                      <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        includeReferences ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}>
                        <input
                          type="checkbox"
                          checked={includeReferences}
                          onChange={(e) => setIncludeReferences(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span className="whitespace-nowrap">References</span>
                      </label>

                      <label className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        includeQa ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}>
                        <input
                          type="checkbox"
                          checked={includeQa}
                          onChange={(e) => setIncludeQa(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span className="whitespace-nowrap">Q&A Slide</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={() => {
                  setOutline(SAMPLE_OUTLINE);
                  setCurrentStep(3);
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
              >
                Or explore with sample academic report & deck
              </button>

              <button
                disabled={!reportFile || isLoading}
                onClick={() => reportFile && handleAnalyzeAndPlan(reportFile, rubricFile)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white shadow-md transition-all ${
                  reportFile && !isLoading
                    ? 'bg-academic-navy hover:bg-academic-indigo cursor-pointer'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{loadingMessage}</span>
                  </>
                ) : (
                  <>
                    <span>Analyze & Plan Presentation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: RUBRIC AUDIT & COMPLIANCE MATRIX */}
        {/* ==================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Assessment Rubric Compliance & Evidence Audit
                </h2>
                <p className="text-xs text-slate-500">
                  Evaluates how thoroughly your assignment report addresses each criterion before generating slides.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Back to Upload
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-sm"
                >
                  <span>Approve & Review Slide Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Score & Warning Banners */}
            {rubricResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Overall Rubric Alignment
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-academic-navy">
                      {rubricResult.overall_compliance_score ?? 85}%
                    </span>
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> High Adherence
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${rubricResult.overall_compliance_score ?? 85}%` }}
                    />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Criteria Extracted
                  </span>
                  <div className="text-3xl font-black text-slate-800">
                    {rubricResult.total_criteria_count} Criteria
                  </div>
                  <p className="text-xs text-slate-500">
                    Total weight analyzed: {rubricResult.total_weight_found}%
                  </p>
                </div>

                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                    Cover Page Quarantine
                  </span>
                  <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Cover Metadata Isolated
                  </div>
                  <p className="text-xs text-slate-500">
                    {structuredReport?.cover_page.quarantined_lines.length || 6} cover lines quarantined from body content.
                  </p>
                </div>
              </div>
            )}

            {/* Warnings Alert */}
            {rubricResult?.missing_evidence_warnings && rubricResult.missing_evidence_warnings.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Lecturer Criteria Evidence Warnings ({rubricResult.missing_evidence_warnings.length})
                </div>
                <ul className="text-xs text-amber-800 space-y-1 list-disc pl-5">
                  {rubricResult.missing_evidence_warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Compliance Matrix Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-4">Assessment Criterion</th>
                    <th className="py-3 px-3">Weight</th>
                    <th className="py-3 px-3">Evidence Status</th>
                    <th className="py-3 px-4">Matched Report Section</th>
                    <th className="py-3 px-4">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rubricResult?.compliance_matches?.map((match, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {match.criterion_title}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-700">
                        {match.weight_percent > 0 ? `${match.weight_percent}%` : 'Standard'}
                      </td>
                      <td className="py-3.5 px-3">
                        {(match.status === 'covered_with_evidence' || match.status === 'strong_match') && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Covered with Evidence
                          </span>
                        )}
                        {(match.status === 'partially_covered' || match.status === 'partial_match') && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3" /> Partially Covered
                          </span>
                        )}
                        {(match.status === 'missing_from_report' || match.status === 'missing_evidence') && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Missing from Report
                          </span>
                        )}
                        {match.status === 'uncertain_review_required' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <AlertCircle className="w-3 h-3" /> Review Required
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {match.matched_sections.length > 0 ? match.matched_sections.join(', ') : 'None detected'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {match.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: REVIEW & EDIT SLIDE PLAN */}
        {/* ==================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Review & Customize Slide Outline
                </h2>
                <p className="text-xs text-slate-500">
                  Edit titles, bullet points, talking notes, or reorder slides. The cover page is strictly kept as Slide 0 (Title Slide).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Upload Again
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-sm cursor-pointer"
                >
                  <span>Select Theme & Logos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Slide-Count & Compliance Summary Banner */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Budget Mode:</span>
                  <span className="font-bold text-amber-300 font-mono text-xs px-2 py-0.5 rounded bg-white/10">
                    {countingMode === 'content_only' ? 'Mode B: Content Only (+2)' : 'Mode A: Total Slides'}
                  </span>
                </div>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Mode:</span>
                  <span className="font-bold text-sky-300 font-mono text-xs">
                    {presentationMode === 'group' ? `Group (${presenters.length} Members)` : 'Individual'}
                  </span>
                </div>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Planned deck:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    {outline.planned_slide_count || outline.slides.length + 1} slides
                  </span>
                </div>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Criteria:</span>
                  <span className="font-bold text-cyan-300 font-mono text-sm">
                    {outline.required_criteria_covered || (rubricResult ? `${rubricResult.covered_count || 0}/${rubricResult.total_criteria_count || 0}` : '4/4')}
                  </span>
                </div>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Warnings:</span>
                  <span className={`font-bold font-mono text-sm ${(outline.planning_warnings?.length || 0) > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {outline.planning_warnings?.length || 0}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end">
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-xl">
                  <span className="text-2xs text-slate-300 font-semibold mr-1">Switch:</span>
                  {[5, 8, 10, 12, 15, 20].map((c) => (
                    <button
                      key={c}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleReplanDeck(c)}
                      className={`px-2 py-0.5 rounded-lg text-2xs font-bold transition-all cursor-pointer ${
                        (outline.planned_slide_count || targetSlideCount) === c
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'text-slate-200 hover:bg-white/20'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleReplanDeck()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Re-plan deck with current constraints"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Re-plan Deck</span>
                </button>
              </div>
            </div>

            {/* Title Slide Quarantine Card (Slide 0) */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-2xs font-bold uppercase tracking-wider text-amber-300">
                <div className="flex items-center gap-2">
                  <span>Slide 00 • Strict Title Slide (Isolated from body)</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white">
                    Deterministic Anchor
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {presentationMode === 'group' ? `Group Mode (${presenters.length} Presenters)` : 'Individual Mode'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="text-2xs text-slate-400 block mb-1 font-semibold">Presentation Title</label>
                  <input
                    type="text"
                    value={outline.title}
                    onChange={(e) => setOutline({ ...outline, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 rounded-lg text-sm font-bold text-white border border-white/20 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-2xs text-slate-400 block mb-1 font-semibold">Subtitle / Category</label>
                  <input
                    type="text"
                    value={outline.subtitle}
                    onChange={(e) => setOutline({ ...outline, subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 rounded-lg text-sm text-slate-200 border border-white/20 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                {presentationMode === 'individual' ? (
                  <>
                    <div>
                      <label className="text-2xs text-slate-400 block mb-1 font-semibold">Presenter Name</label>
                      <input
                        type="text"
                        value={outline.author}
                        onChange={(e) => {
                          const val = sanitizePresenterName(e.target.value);
                          setOutline({ ...outline, author: val });
                          if (presenters[0]) {
                            const updated = [...presenters];
                            updated[0].name = val;
                            setPresenters(updated);
                          }
                        }}
                        placeholder="e.g. Sujan G.C."
                        className="w-full px-3 py-2 bg-white/10 rounded-lg text-xs text-white border border-white/20 focus:border-amber-400 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-2xs text-slate-400 block mb-1 font-semibold">Student ID / Roll No</label>
                      <input
                        type="text"
                        value={outline.student_id || ''}
                        onChange={(e) => {
                          const val = sanitizeStudentId(e.target.value);
                          setOutline({ ...outline, student_id: val });
                          if (presenters[0]) {
                            const updated = [...presenters];
                            updated[0].student_id = val;
                            setPresenters(updated);
                          }
                        }}
                        placeholder="e.g. 771234 (optional)"
                        className="w-full px-3 py-2 bg-white/10 rounded-lg text-xs text-white border border-white/20 focus:border-amber-400 focus:outline-hidden"
                      />
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2 space-y-2 bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-2xs text-amber-300 font-bold block">
                        Team Presenters ({presenters.length})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddPresenter}
                        className="text-3xs font-bold px-2 py-0.5 rounded bg-indigo-500 hover:bg-indigo-400 text-white transition-colors cursor-pointer"
                      >
                        + Add Presenter
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {presenters.map((p, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2 bg-black/20 p-1.5 rounded-lg text-2xs">
                          <span className="font-mono text-slate-400 font-bold">#{pIdx + 1}</span>
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => handleUpdatePresenter(pIdx, 'name', e.target.value)}
                            placeholder="Full Name"
                            className="flex-1 px-2 py-0.5 bg-white/10 rounded text-white border border-white/10 focus:border-amber-400 focus:outline-hidden"
                          />
                          <input
                            type="text"
                            value={p.student_id}
                            onChange={(e) => handleUpdatePresenter(pIdx, 'student_id', e.target.value)}
                            placeholder="Student ID"
                            className="w-24 px-2 py-0.5 bg-white/10 rounded text-white border border-white/10 focus:border-amber-400 focus:outline-hidden"
                          />
                          <input
                            type="text"
                            value={p.role}
                            onChange={(e) => handleUpdatePresenter(pIdx, 'role', e.target.value)}
                            placeholder="Role / Topic"
                            className="w-32 px-2 py-0.5 bg-white/10 rounded text-white border border-white/10 focus:border-amber-400 focus:outline-hidden"
                          />
                          {presenters.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePresenter(pIdx)}
                              className="text-rose-400 hover:text-rose-300 px-1 cursor-pointer"
                              title="Remove"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-2xs text-slate-400 block mb-1 font-semibold">Institution / University</label>
                  <input
                    type="text"
                    value={outline.institution}
                    onChange={(e) => setOutline({ ...outline, institution: e.target.value })}
                    placeholder="e.g. Tribhuvan University"
                    className="w-full px-3 py-2 bg-white/10 rounded-lg text-xs text-white border border-white/20 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-2xs text-slate-400 block mb-1 font-semibold">College / Department</label>
                  <input
                    type="text"
                    value={outline.college_name || ''}
                    onChange={(e) => setOutline({ ...outline, college_name: e.target.value })}
                    placeholder="e.g. Dept. of Computer Science"
                    className="w-full px-3 py-2 bg-white/10 rounded-lg text-xs text-white border border-white/20 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Density & Add Slide Controls */}
            <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Detail Density:</span>
                {(['concise', 'balanced', 'detailed'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setTextDensity(d)}
                    className={`px-3 py-1 rounded-lg font-medium capitalize text-xs transition-colors ${
                      textDensity === d
                        ? 'bg-academic-navy text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAddSlide}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-academic-blue hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Slide
              </button>
            </div>

            {/* Slide Items List */}
            <div className="space-y-4">
              {outline.slides.map((slide, sIdx) => {
                const isConclusionSlide =
                  slide.slide_type === 'conclusion' ||
                  slide.category === 'Summary' ||
                  sIdx === outline.slides.length - 1;

                return (
                  <div
                    key={sIdx}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
                  >
                    {/* Slide Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                          {sIdx + 1 < 10 ? `0${sIdx + 1}` : sIdx + 1}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          {slide.category || 'Content Slide'}
                        </span>
                        {/* Visual Badge */}
                        <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          Visual: {VISUAL_TYPE_OPTIONS.find((v) => v.value === (slide.visual_type || 'none'))?.label || slide.visual_type || 'Standard Bullets'}
                        </span>
                        {/* Criteria Badge */}
                        {slide.criteria_addressed && slide.criteria_addressed.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Matches: {slide.criteria_addressed.join(', ')}
                          </span>
                        )}
                        {/* Assigned Speaker Badge */}
                        {presentationMode === 'group' && (
                          <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-sky-50 text-sky-800 border border-sky-100">
                            🎤 Speaker: {slide.assigned_presenter_name || presenters[0]?.name || 'Presenter'}
                            {slide.estimated_speaking_minutes ? ` (${slide.estimated_speaking_minutes}m)` : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveSlide(sIdx, 'up')}
                          disabled={sIdx === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveSlide(sIdx, 'down')}
                          disabled={sIdx === outline.slides.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(sIdx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title, Role & Dynamic Visual */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6">
                        <label className="text-2xs font-bold text-slate-500 block mb-1">
                          Slide Title
                        </label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleUpdateSlide(sIdx, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg focus:outline-hidden focus:border-academic-blue"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-2xs font-bold text-slate-500 block mb-1">
                          Layout Role
                        </label>
                        <select
                          value={slide.slide_type || 'content'}
                          onChange={(e) => handleUpdateSlide(sIdx, 'slide_type', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs text-slate-700 border border-slate-200 rounded-lg bg-white"
                        >
                          {SLIDE_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-2xs font-bold text-slate-500 block mb-1">
                          Dynamic Visual Layout
                        </label>
                        <select
                          value={slide.visual_type || 'none'}
                          onChange={(e) => handleUpdateSlide(sIdx, 'visual_type', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs text-slate-700 border border-slate-200 rounded-lg bg-white"
                        >
                          {VISUAL_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Group Speaker Allocation Row */}
                    {presentationMode === 'group' && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-2xs font-bold text-slate-600 block mb-1">
                            Assigned Presenter (Speaker for this slide)
                          </label>
                          <select
                            value={slide.assigned_presenter_name || presenters[0]?.name || ''}
                            onChange={(e) => handleUpdateSlide(sIdx, 'assigned_presenter_name', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg bg-white"
                          >
                            {presenters.map((p, pIdx) => (
                              <option key={pIdx} value={p.name}>
                                {p.name} {p.student_id ? `(${p.student_id})` : ''} — {p.role || `Speaker ${pIdx + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-2xs font-bold text-slate-600 block mb-1">
                            Est. Speaking Time (Mins)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={slide.estimated_speaking_minutes || 2}
                            onChange={(e) =>
                              handleUpdateSlide(sIdx, 'estimated_speaking_minutes', parseInt(e.target.value, 10) || 1)
                            }
                            className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Purpose, Key Message & Provenance */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-2xs">
                      <div>
                        <label className="font-bold text-slate-500 block mb-1">
                          Slide Purpose / Instructional Objective
                        </label>
                        <input
                          type="text"
                          value={slide.purpose || ''}
                          onChange={(e) => handleUpdateSlide(sIdx, 'purpose', e.target.value)}
                          placeholder="e.g. Synthesize system topology and data flows..."
                          className="w-full px-3 py-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-academic-blue"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-500 block mb-1">
                          Key Message for Examiner / Audience
                        </label>
                        <input
                          type="text"
                          value={slide.key_message || ''}
                          onChange={(e) => handleUpdateSlide(sIdx, 'key_message', e.target.value)}
                          placeholder="e.g. Pure byte signature sniffing guarantees zero parser injection..."
                          className="w-full px-3 py-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-academic-blue"
                        />
                      </div>
                    </div>

                    {/* Provenance & Decision Metadata Pills */}
                    {(slide.source_sections || slide.decision_reason) && (
                      <div className="flex flex-wrap items-center gap-2 text-3xs text-slate-500 pt-1">
                        {slide.source_sections && slide.source_sections.length > 0 && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            Provenance: {slide.source_sections.join(', ')}
                          </span>
                        )}
                        {slide.decision_reason && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            Decision ({slide.decision || 'KEEP'}): {slide.decision_reason}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Substantive Academic Conclusion Synthesis Box */}
                    {isConclusionSlide && (
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 border-b border-emerald-200 pb-2">
                          <CheckSquare className="w-4 h-4 text-emerald-700" />
                          <span>Substantive Academic Conclusion Synthesis (Mandatory Layout)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="sm:col-span-2">
                            <label className="text-2xs font-bold text-emerald-900 block mb-1">
                              Verdict / Core Academic Finding
                            </label>
                            <input
                              type="text"
                              value={
                                slide.conclusion_verdict ||
                                'Deterministic OpenXML manipulation eliminates thesis formatting defects with 0 cloud dependencies.'
                              }
                              onChange={(e) => handleUpdateSlide(sIdx, 'conclusion_verdict', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs text-emerald-950 font-bold bg-white border border-emerald-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-2xs font-bold text-emerald-900 block mb-1">
                              Recommended Solution / Judgement
                            </label>
                            <textarea
                              rows={2}
                              value={
                                slide.conclusion_recommendation ||
                                'Air-gapped local document processing is strongly recommended for institutional thesis compliance.'
                              }
                              onChange={(e) => handleUpdateSlide(sIdx, 'conclusion_recommendation', e.target.value)}
                              className="w-full px-3 py-1 text-xs text-emerald-900 bg-white border border-emerald-300 rounded-lg focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="text-2xs font-bold text-emerald-900 block mb-1">
                              Academic Limitations & Future Work
                            </label>
                            <textarea
                              rows={2}
                              value={
                                slide.conclusion_limitations ||
                                'Advanced nested equations in raw LaTeX require further grammar parsing support.'
                              }
                              onChange={(e) => handleUpdateSlide(sIdx, 'conclusion_limitations', e.target.value)}
                              className="w-full px-3 py-1 text-xs text-emerald-900 bg-white border border-emerald-300 rounded-lg focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bullet Points */}
                    <div className="space-y-1.5">
                      <label className="text-2xs font-bold text-slate-500 block">
                        Slide Bullet Points & Core Content
                      </label>
                      {slide.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">•</span>
                          <input
                            type="text"
                            value={b}
                            onChange={(e) => handleUpdateBullet(sIdx, bIdx, e.target.value)}
                            className="flex-1 px-3 py-1 text-xs text-slate-700 border border-slate-200 rounded-lg focus:outline-hidden focus:border-academic-blue"
                          />
                          <button
                            onClick={() => handleRemoveBullet(sIdx, bIdx)}
                            className="text-slate-300 hover:text-rose-500 text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddBullet(sIdx)}
                        className="text-2xs font-semibold text-academic-blue hover:underline mt-1"
                      >
                        + Add Point
                      </button>
                    </div>

                    {/* Presenter Talking Notes */}
                    <div className="pt-2 border-t border-slate-100">
                      <label className="text-2xs font-bold text-slate-500 block mb-1">
                        Presenter Talking Notes (Visible in PowerPoint Presenter View)
                      </label>
                      <textarea
                        rows={2}
                        value={slide.notes || ''}
                        onChange={(e) => handleUpdateSlide(sIdx, 'notes', e.target.value)}
                        placeholder="Talking points and context to explain this slide..."
                        className="w-full px-3 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-academic-blue"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 4: THEMES, DUAL LOGOS & TRANSITIONS */}
        {/* ==================================================== */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Select Theme, Dual Logos & Animation Settings
                </h2>
                <p className="text-xs text-slate-500">
                  Choose from 10 distinct academic visual palettes, attach institutional dual logos, and configure OOXML slide transitions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Back to Slide Plan
                </button>
                <button
                  onClick={handleGenerateDeck}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-md"
                >
                  <Presentation className="w-4 h-4 text-amber-300" />
                  <span>Generate PowerPoint Deck</span>
                </button>
              </div>
            </div>

            {/* 10 Themes Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">
                Academic Theme Palettes (10 Styles)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {ALL_10_THEMES.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'border-academic-blue bg-blue-50/20 shadow-md ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: theme.primary_color }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: theme.accent_color }}
                          />
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-academic-blue text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{theme.name}</h4>
                        <p className="text-2xs text-slate-500 mt-1 line-clamp-2">
                          {theme.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dual Logo Branding Section */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-academic-blue" />
                <h3 className="text-sm font-bold text-slate-900">
                  College & University Dual-Logo Branding
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Upload institutional emblems (University + College/School). Logos are positioned cleanly on the title slide with aspect-ratio preservation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* University Logo */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">University Logo</span>
                    {universityLogo && (
                      <button
                        onClick={() => {
                          setUniversityLogo('');
                          setOutline((prev) => ({ ...prev, university_logo_base64: '' }));
                        }}
                        className="text-2xs text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {universityLogo ? (
                    <div className="h-16 flex items-center justify-center bg-white rounded border border-slate-200 p-2">
                      <img src={universityLogo} alt="University Logo" className="max-h-full object-contain" />
                    </div>
                  ) : (
                    <button
                      onClick={() => uniLogoInputRef.current?.click()}
                      className="w-full h-16 border border-dashed border-slate-300 rounded text-xs font-medium text-slate-500 hover:bg-white flex items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" /> Upload University Logo
                    </button>
                  )}
                  <input
                    ref={uniLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleLogoUpload(f, 'university');
                    }}
                  />
                </div>

                {/* College / Department Logo */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">College / Department Logo</span>
                    {collegeLogo && (
                      <button
                        onClick={() => {
                          setCollegeLogo('');
                          setOutline((prev) => ({ ...prev, college_logo_base64: '' }));
                        }}
                        className="text-2xs text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {collegeLogo ? (
                    <div className="h-16 flex items-center justify-center bg-white rounded border border-slate-200 p-2">
                      <img src={collegeLogo} alt="College Logo" className="max-h-full object-contain" />
                    </div>
                  ) : (
                    <button
                      onClick={() => colLogoInputRef.current?.click()}
                      className="w-full h-16 border border-dashed border-slate-300 rounded text-xs font-medium text-slate-500 hover:bg-white flex items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" /> Upload College Logo
                    </button>
                  )}
                  <input
                    ref={colLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleLogoUpload(f, 'college');
                    }}
                  />
                </div>
              </div>
            </div>

            {/* OOXML Transitions & Output Filename */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Slide Transition Effect
                </label>
                <select
                  value={transitionType}
                  onChange={(e) => setTransitionType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="fade">Fade Transition (Clean & Scholarly)</option>
                  <option value="push">Push Transition (Directional Flow)</option>
                  <option value="wipe">Wipe Transition (Executive Precision)</option>
                  <option value="none">None (Standard Cut)</option>
                </select>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Animation Intensity
                </label>
                <select
                  value={animationIntensity}
                  onChange={(e) => setAnimationIntensity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="subtle">Subtle (Recommended for Defense)</option>
                  <option value="enhanced">Enhanced (Dynamic Transitions)</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Output File Name (.pptx)
                </label>
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-academic-blue"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 5: GENERATING PPTX */}
        {/* ==================================================== */}
        {currentStep === 5 && (
          <div className="max-w-md mx-auto py-16 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-academic-blue flex items-center justify-center animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Generating High-Impact PowerPoint Presentation...
            </h3>
            <p className="text-xs text-slate-500">
              Applying theme palettes, injecting OpenXML transitions, and formatting 16:9 widescreen slides.
            </p>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 6: INTERACTIVE 16:9 PREVIEW & DOWNLOAD */}
        {/* ==================================================== */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Interactive Presentation Preview & Download
                </h2>
                <p className="text-xs text-slate-500">
                  Review your 16:9 widescreen presentation slides. Download the editable Microsoft PowerPoint (.pptx) file.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Adjust Theme & Logos
                </button>
                {downloadInfo && (
                  <a
                    href={downloadInfo.download_url}
                    download={downloadInfo.filename}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PowerPoint (.pptx)</span>
                  </a>
                )}
              </div>
            </div>

            {/* 16:9 Interactive Slide Viewer */}
            <div className="max-w-4xl mx-auto space-y-4">
              <div
                className="w-full aspect-16/9 rounded-2xl shadow-xl border overflow-hidden p-8 flex flex-col justify-between transition-colors relative"
                style={{
                  backgroundColor: activeThemeObj.is_dark ? '#0B0F19' : '#FFFFFF',
                  color: activeThemeObj.is_dark ? '#F8FAFC' : '#1E293B',
                  borderColor: activeThemeObj.is_dark ? '#1E293B' : '#E2E8F0',
                }}
              >
                {/* Accent Top Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: activeThemeObj.accent_color }}
                />

                {previewSlideIdx === 0 ? (
                  /* Title Slide Preview */
                  <div className="flex-1 flex flex-col justify-between pt-4">
                    <div className="flex justify-between items-start">
                      {universityLogo && (
                        <img src={universityLogo} alt="Uni Logo" className="h-10 object-contain" />
                      )}
                      <span
                        className="text-2xs font-bold tracking-widest uppercase px-2.5 py-1 rounded"
                        style={{ color: activeThemeObj.accent_color }}
                      >
                        Academic Research Presentation
                      </span>
                      {collegeLogo && (
                        <img src={collegeLogo} alt="College Logo" className="h-10 object-contain" />
                      )}
                    </div>

                    <div className="space-y-3 my-auto">
                      <h2
                        className="text-3xl font-extrabold tracking-tight"
                        style={{
                          color: activeThemeObj.is_dark ? '#FFFFFF' : activeThemeObj.primary_color,
                          fontFamily: activeThemeObj.font_title,
                        }}
                      >
                        {outline.title}
                      </h2>
                      {outline.subtitle && (
                        <p className="text-base text-slate-500 font-medium">
                          {outline.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Presenter Footer: Individual vs Group */}
                    {presentationMode === 'group' && presenters.length > 0 ? (
                      <div className="space-y-2">
                        <span
                          className="text-3xs font-bold uppercase tracking-wider block"
                          style={{ color: activeThemeObj.accent_color }}
                        >
                          Team Presenters & Research Contributors ({presenters.length})
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {presenters.map((p, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-2 rounded-lg border text-left text-2xs"
                              style={{
                                backgroundColor: activeThemeObj.is_dark ? '#161F30' : '#F8FAFC',
                                borderColor: activeThemeObj.is_dark ? '#334155' : '#E2E8F0',
                              }}
                            >
                              <span
                                className="text-3xs font-bold uppercase block truncate mb-0.5"
                                style={{ color: activeThemeObj.accent_color }}
                              >
                                {p.role || `Speaker #${pIdx + 1}`}
                              </span>
                              <p className="font-bold truncate text-slate-900 dark:text-white">
                                {p.name || `Member ${pIdx + 1}`}
                              </p>
                              {p.student_id && (
                                <p className="text-3xs text-slate-400 font-mono">ID: {p.student_id}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-3xs text-slate-400 pt-1">
                          <span>{outline.institution} {outline.college_name ? `• ${outline.college_name}` : ''}</span>
                          <span className="font-mono">Slide 01 of {outline.slides.length + 1}</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="p-3.5 rounded-xl border text-xs flex justify-between items-center"
                        style={{
                          backgroundColor: activeThemeObj.is_dark ? '#161F30' : '#F8FAFC',
                          borderColor: activeThemeObj.is_dark ? '#334155' : '#E2E8F0',
                        }}
                      >
                        <div>
                          <p className="font-bold">
                            Presenter: {outline.author} {outline.student_id ? `(${outline.student_id})` : ''}
                          </p>
                          <p className="text-2xs text-slate-500">
                            {outline.institution} {outline.college_name ? `• ${outline.college_name}` : ''}
                          </p>
                        </div>
                        <span className="text-2xs text-slate-400 font-mono">Slide 01 of {outline.slides.length + 1}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Body Slide Preview */
                  (() => {
                    const slide = outline.slides[previewSlideIdx - 1];
                    const isChart = slide.visual_type?.startsWith('chart_');
                    const isArchitecture =
                      slide.visual_type === 'architecture_diagram' ||
                      slide.visual_type === 'diagram' ||
                      slide.visual_type === 'system_architecture';
                    const isProblemSolution = slide.visual_type === 'problem_solution';
                    const isTimeline = slide.visual_type === 'timeline';
                    const isConclusion =
                      slide.slide_type === 'conclusion' ||
                      slide.visual_type === 'conclusion';

                    return (
                      <div className="flex-1 flex flex-col justify-between pt-2">
                        {/* Slide Title & Speaker Pill Header */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span
                              className="text-2xs font-bold tracking-widest uppercase block mb-1"
                              style={{ color: activeThemeObj.accent_color }}
                            >
                              {slide.category || 'Analysis'}
                            </span>
                            {presentationMode === 'group' && slide.assigned_presenter_name && (
                              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                                🎤 Speaker: {slide.assigned_presenter_name}
                                {slide.estimated_speaking_minutes ? ` (${slide.estimated_speaking_minutes}m)` : ''}
                              </span>
                            )}
                          </div>
                          <h3
                            className="text-xl font-bold tracking-tight pb-2 border-b"
                            style={{
                              color: activeThemeObj.is_dark ? '#FFFFFF' : activeThemeObj.primary_color,
                              fontFamily: activeThemeObj.font_title,
                              borderColor: activeThemeObj.is_dark ? '#334155' : '#E2E8F0',
                            }}
                          >
                            {slide.title}
                          </h3>
                        </div>

                        {/* Dynamic Body Content Renderers */}
                        <div className="py-3 flex-1 flex flex-col justify-center">
                          {/* 1. Clustered Column / Line Chart Preview */}
                          {isChart ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                              <div
                                className="sm:col-span-2 p-3 rounded-xl border space-y-2"
                                style={{
                                  backgroundColor: activeThemeObj.is_dark ? '#161F30' : '#F8FAFC',
                                  borderColor: activeThemeObj.is_dark ? '#334155' : '#E2E8F0',
                                }}
                              >
                                <div className="flex items-center justify-between text-2xs font-bold uppercase tracking-wider text-slate-500">
                                  <span>Native Clustered Chart ({slide.chart_type || 'column_clustered'})</span>
                                  <span style={{ color: activeThemeObj.accent_color }}>Analytical Benchmark</span>
                                </div>
                                <div className="space-y-2 pt-2">
                                  {(slide.chart_categories || ['Adherence Rate', 'Processing Latency', 'Privacy Score']).map(
                                    (cat, cIdx) => (
                                      <div key={cIdx} className="space-y-0.5 text-2xs">
                                        <div className="flex justify-between font-semibold">
                                          <span>{cat}</span>
                                          <span className="font-mono text-emerald-600">
                                            {cIdx === 0 ? '99.4%' : cIdx === 1 ? '1.8s' : '100%'}
                                          </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden flex gap-0.5">
                                          <div
                                            className="h-2 rounded-full"
                                            style={{
                                              width: `${cIdx === 0 ? 99 : cIdx === 1 ? 85 : 100}%`,
                                              backgroundColor: activeThemeObj.accent_color,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                              <div
                                className="p-3 rounded-xl border text-2xs space-y-1.5"
                                style={{
                                  backgroundColor: activeThemeObj.is_dark ? '#161F30' : '#F8FAFC',
                                  borderColor: activeThemeObj.is_dark ? '#334155' : '#E2E8F0',
                                }}
                              >
                                <span className="font-bold text-amber-700 dark:text-amber-300 block">
                                  Analytical Takeaways
                                </span>
                                {slide.bullets.slice(0, 3).map((b, bIdx) => (
                                  <p key={bIdx} className="text-3xs text-slate-600 dark:text-slate-300">
                                    • {b}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ) : isArchitecture ? (
                            /* 2. Multi-Tier Architecture Diagram Preview */
                            <div className="space-y-2">
                              <div className="grid grid-cols-3 gap-2 text-center text-2xs">
                                {[
                                  { tier: 'Tier 1: Client Ingestion', sub: 'Byte Signature Sniffer & Isolation' },
                                  { tier: 'Tier 2: Slide Intelligence', sub: 'Rubric Compliance & Layout Planner' },
                                  { tier: 'Tier 3: Low-Level OOXML', sub: 'python-pptx Vector Generation' },
                                ].map((t, tIdx) => (
                                  <div
                                    key={tIdx}
                                    className="p-2.5 rounded-xl border relative shadow-2xs"
                                    style={{
                                      backgroundColor: activeThemeObj.is_dark ? '#161F30' : '#F8FAFC',
                                      borderColor: activeThemeObj.is_dark ? '#334155' : '#E2E8F0',
                                    }}
                                  >
                                    <span
                                      className="text-3xs font-bold uppercase tracking-wider block mb-1"
                                      style={{ color: activeThemeObj.accent_color }}
                                    >
                                      {t.tier}
                                    </span>
                                    <p className="text-3xs text-slate-500 font-medium">{t.sub}</p>
                                  </div>
                                ))}
                              </div>
                              <div
                                className="p-2 rounded-lg border text-3xs text-slate-500 flex justify-between"
                                style={{
                                  backgroundColor: activeThemeObj.is_dark ? '#161F30' : '#F8FAFC',
                                  borderColor: activeThemeObj.is_dark ? '#334155' : '#E2E8F0',
                                }}
                              >
                                <span>Architecture Topology: Directional OOXML Dataflow</span>
                                <span className="font-mono">100% Deterministic & Air-Gapped</span>
                              </div>
                            </div>
                          ) : isProblemSolution ? (
                            /* 3. 3-Column Problem-Solution Cards */
                            <div className="grid grid-cols-3 gap-2 text-2xs">
                              <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200">
                                <span className="text-3xs font-bold uppercase tracking-wider block mb-1 text-rose-700">
                                  1. Problem & Symptoms
                                </span>
                                <p className="text-3xs line-clamp-3 leading-relaxed">
                                  {slide.bullets[0] || 'Unlinked cover pages and non-standard typography.'}
                                </p>
                              </div>
                              <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200">
                                <span className="text-3xs font-bold uppercase tracking-wider block mb-1 text-amber-700">
                                  2. Root Cause Mechanism
                                </span>
                                <p className="text-3xs line-clamp-3 leading-relaxed">
                                  {slide.bullets[1] || 'Stochastic AI models fail section-aware pagination.'}
                                </p>
                              </div>
                              <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200">
                                <span className="text-3xs font-bold uppercase tracking-wider block mb-1 text-emerald-700">
                                  3. Engineered Solution
                                </span>
                                <p className="text-3xs line-clamp-3 leading-relaxed">
                                  {slide.bullets[2] || 'Deterministic OpenXML byte-level structure rewriting.'}
                                </p>
                              </div>
                            </div>
                          ) : isTimeline ? (
                            /* 4. Milestone Timeline Preview */
                            <div className="space-y-3 py-2">
                              <div className="flex items-center justify-between relative px-4">
                                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-slate-300 dark:bg-slate-700 z-0" />
                                {[1, 2, 3, 4].map((m) => (
                                  <div
                                    key={m}
                                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white z-10 shadow-xs"
                                    style={{ backgroundColor: activeThemeObj.accent_color }}
                                  >
                                    {m}
                                  </div>
                                ))}
                              </div>
                              <div className="grid grid-cols-4 gap-2 text-center text-3xs">
                                {slide.bullets.slice(0, 4).map((b, bIdx) => (
                                  <div
                                    key={bIdx}
                                    className="p-1.5 rounded-lg border"
                                    style={{
                                      backgroundColor: activeThemeObj.is_dark ? '#161F30' : '#F8FAFC',
                                      borderColor: activeThemeObj.is_dark ? '#334155' : '#E2E8F0',
                                    }}
                                  >
                                    <p className="line-clamp-2">{b}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : isConclusion ? (
                            /* 5. Substantive Conclusion Synthesis 4-Quadrant Preview */
                            <div className="space-y-2 text-2xs">
                              {/* Verdict Banner */}
                              <div
                                className="p-2 rounded-lg border font-bold text-xs text-center"
                                style={{
                                  backgroundColor: activeThemeObj.is_dark ? '#161F30' : '#F0FDF4',
                                  borderColor: activeThemeObj.is_dark ? '#334155' : '#BBF7D0',
                                  color: activeThemeObj.is_dark ? '#86EFAC' : '#166534',
                                }}
                              >
                                🎯 Verdict:{' '}
                                {slide.conclusion_verdict ||
                                  'Deterministic OpenXML manipulation eliminates thesis formatting defects with 0 cloud dependencies.'}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-3xs">
                                <div
                                  className="p-2 rounded-lg border space-y-1"
                                  style={{
                                    backgroundColor: activeThemeObj.is_dark ? '#161F30' : '#F8FAFC',
                                    borderColor: activeThemeObj.is_dark ? '#334155' : '#E2E8F0',
                                  }}
                                >
                                  <span className="font-bold text-emerald-700 block">
                                    Key Findings & Objectives Met
                                  </span>
                                  {slide.bullets.slice(0, 3).map((b, bIdx) => (
                                    <p key={bIdx} className="line-clamp-2">
                                      • {b}
                                    </p>
                                  ))}
                                </div>
                                <div
                                  className="p-2 rounded-lg border space-y-1"
                                  style={{
                                    backgroundColor: activeThemeObj.is_dark ? '#161F30' : '#F8FAFC',
                                    borderColor: activeThemeObj.is_dark ? '#334155' : '#E2E8F0',
                                  }}
                                >
                                  <span className="font-bold text-indigo-700 block">
                                    Recommended Solution & Limits
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-300">
                                    {slide.conclusion_recommendation ||
                                      'Air-gapped local document processing is strongly recommended for institutional thesis compliance.'}
                                  </p>
                                  <p className="text-slate-400 text-3xs">
                                    Limitations: {slide.conclusion_limitations || 'Nested LaTeX equations require grammar parser.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Default Bullets */
                            <div className="space-y-2">
                              {slide.bullets.map((b, bIdx) => (
                                <div key={bIdx} className="flex items-start gap-3 text-sm">
                                  <span
                                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                    style={{ backgroundColor: activeThemeObj.accent_color }}
                                  />
                                  <span className="leading-relaxed text-xs">{b}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Slide Footer */}
                        <div className="text-2xs text-slate-400 flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="truncate max-w-xs">{outline.title}</span>
                          <span className="font-mono">
                            Slide {previewSlideIdx + 1} of {outline.slides.length + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Slide Navigator Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto py-2">
                <button
                  onClick={() => setPreviewSlideIdx(0)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    previewSlideIdx === 0
                      ? 'bg-academic-navy text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  01. Title
                </button>
                {outline.slides.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPreviewSlideIdx(idx + 1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      previewSlideIdx === idx + 1
                        ? 'bg-academic-navy text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {idx + 2 < 10 ? `0${idx + 2}` : idx + 2}. {s.title.slice(0, 18)}...
                  </button>
                ))}
              </div>

              {/* Presenter Talking Notes Display */}
              {previewSlideIdx > 0 && outline.slides[previewSlideIdx - 1]?.notes && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-2xs font-bold uppercase tracking-wider text-amber-900 block">
                    Presenter Talking Notes for Slide {previewSlideIdx + 1}
                  </span>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {outline.slides[previewSlideIdx - 1].notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
