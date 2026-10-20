import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileType,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Presentation,
  X,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  ShieldCheck,
  FileCheck,
  Lock,
  Zap,
  Layers,
  BookOpen,
} from 'lucide-react';
import {
  getConversionRegistry,
  convertUniversalFile,
} from '../../services/api';
import { InputFormatInfo, ConversionOption, ConversionResult } from '../../types';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

interface UniversalUploadCenterProps {
  onStartAssignmentFormatting: (file: File) => void;
  onOpenPresentationWorkspace: (file?: File) => void;
}

const DEFAULT_CONVERSION_REGISTRY: Record<string, InputFormatInfo> = {
  docx: {
    format_key: 'docx',
    label: 'Microsoft Word Document (.docx)',
    extensions: ['.docx'],
    mime_types: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowed_outputs: [
      {
        target_format: 'pdf',
        target_label: 'Portable Document Format (.pdf)',
        extension: '.pdf',
        mime_type: 'application/pdf',
        available: true,
        description: 'Convert Word document to submission-ready, print-perfect PDF.',
      },
      {
        target_format: 'pptx',
        target_label: 'PowerPoint Presentation (.pptx)',
        extension: '.pptx',
        mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        available: true,
        description: 'Convert document sections and key findings into structured presentation slides.',
      },
      {
        target_format: 'txt',
        target_label: 'Plain Text (.txt)',
        extension: '.txt',
        mime_type: 'text/plain',
        available: true,
        description: 'Extract all paragraph text without formatting.',
      },
    ],
  },
  pdf: {
    format_key: 'pdf',
    label: 'Portable Document Format (.pdf)',
    extensions: ['.pdf'],
    mime_types: ['application/pdf'],
    allowed_outputs: [
      {
        target_format: 'docx',
        target_label: 'Microsoft Word (.docx)',
        extension: '.docx',
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        available: true,
        description: 'Extract text and structural sections into an editable Microsoft Word document.',
      },
      {
        target_format: 'pptx',
        target_label: 'PowerPoint Presentation (.pptx)',
        extension: '.pptx',
        mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        available: true,
        description: 'Synthesize key sections from the PDF into presentation slides.',
      },
      {
        target_format: 'txt',
        target_label: 'Plain Text (.txt)',
        extension: '.txt',
        mime_type: 'text/plain',
        available: true,
        description: 'Extract clean text from all pages in the PDF document.',
      },
    ],
  },
  image: {
    format_key: 'image',
    label: 'Images (.png, .jpg, .jpeg, .webp, .bmp, .tiff)',
    extensions: ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'],
    mime_types: ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/tiff'],
    allowed_outputs: [
      {
        target_format: 'pdf',
        target_label: 'High-Quality PDF Document (.pdf)',
        extension: '.pdf',
        mime_type: 'application/pdf',
        available: true,
        description: 'Convert image into a crisp, printable PDF document with preserved DPI.',
      },
      {
        target_format: 'png',
        target_label: 'PNG Image (.png)',
        extension: '.png',
        mime_type: 'image/png',
        available: true,
        description: 'Convert image to lossless PNG format.',
      },
      {
        target_format: 'jpeg',
        target_label: 'JPEG Image (.jpg)',
        extension: '.jpg',
        mime_type: 'image/jpeg',
        available: true,
        description: 'Convert image to compressed JPEG format.',
      },
    ],
  },
  csv: {
    format_key: 'csv',
    label: 'CSV Data File (.csv)',
    extensions: ['.csv'],
    mime_types: ['text/csv', 'application/vnd.ms-excel'],
    allowed_outputs: [
      {
        target_format: 'xlsx',
        target_label: 'Microsoft Excel Workbook (.xlsx)',
        extension: '.xlsx',
        mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        available: true,
        description: 'Convert raw CSV into a formatted Excel spreadsheet with styled headers and auto-column widths.',
      },
      {
        target_format: 'docx',
        target_label: 'Word Table (.docx)',
        extension: '.docx',
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        available: true,
        description: 'Render CSV rows and columns into an academic Word table.',
      },
    ],
  },
  txt: {
    format_key: 'txt',
    label: 'Plain Text File (.txt)',
    extensions: ['.txt', '.md'],
    mime_types: ['text/plain', 'text/markdown'],
    allowed_outputs: [
      {
        target_format: 'docx',
        target_label: 'Microsoft Word Document (.docx)',
        extension: '.docx',
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        available: true,
        description: 'Convert plain text notes into a standard academic Word document.',
      },
      {
        target_format: 'pptx',
        target_label: 'PowerPoint Presentation (.pptx)',
        extension: '.pptx',
        mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        available: true,
        description: 'Convert bulleted or outlined text into presentation slides.',
      },
    ],
  },
};

export const UniversalUploadCenter: React.FC<UniversalUploadCenterProps> = ({
  onStartAssignmentFormatting,
  onOpenPresentationWorkspace,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTask, setSelectedTask] = useState<'format' | 'convert' | 'presentation'>('convert');
  const [registry, setRegistry] = useState<Record<string, InputFormatInfo>>(DEFAULT_CONVERSION_REGISTRY);
  const [selectedTargetFormat, setSelectedTargetFormat] = useState<string>('');
  const [customFilename, setCustomFilename] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingQuickAction, setPendingQuickAction] = useState<{
    targetFormat?: string;
    task?: 'format' | 'convert' | 'presentation';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getConversionRegistry()
      .then((data) => {
        setRegistry(data.registry);
      })
      .catch((err) => {
        console.warn('Could not load conversion registry from server:', err);
      });
  }, []);

  const detectFormatKey = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop() || '';
    if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'].includes(ext)) return 'image';
    if (ext === 'docx') return 'docx';
    if (ext === 'pdf') return 'pdf';
    if (ext === 'csv') return 'csv';
    if (['txt', 'md'].includes(ext)) return 'txt';
    return 'unknown';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFormatIcon = (key: string) => {
    switch (key) {
      case 'docx':
        return <FileText className="w-5 h-5 text-academic-navy" />;
      case 'pdf':
        return <FileType className="w-5 h-5 text-rose-600" />;
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-600" />;
    }
  };

  const handleFileSelected = (
    selectedFile: File,
    override?: { targetFormat?: string; task?: 'format' | 'convert' | 'presentation' }
  ) => {
    setFile(selectedFile);
    setConversionResult(null);
    setErrorMessage(null);

    // Default custom filename to original stem
    const stem = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
    setCustomFilename(`${stem}_Converted`);

    const fmtKey = detectFormatKey(selectedFile.name);

    const activeOverride = override || pendingQuickAction;

    if (activeOverride?.task) {
      setSelectedTask(activeOverride.task);
      if (activeOverride.task === 'presentation') {
        onOpenPresentationWorkspace(selectedFile);
        return;
      }
      if (activeOverride.task === 'format') {
        onStartAssignmentFormatting(selectedFile);
        return;
      }
    } else if (fmtKey === 'docx') {
      setSelectedTask('format');
    } else {
      setSelectedTask('convert');
    }

    if (activeOverride?.targetFormat) {
      setSelectedTargetFormat(activeOverride.targetFormat);
    } else {
      // Set first available target format
      if (registry && registry[fmtKey]) {
        const avail = registry[fmtKey].allowed_outputs.filter((o: ConversionOption) => o.available);
        if (avail.length > 0) {
          setSelectedTargetFormat(avail[0].target_format);
        }
      } else {
        if (fmtKey === 'pdf') setSelectedTargetFormat('docx');
        if (fmtKey === 'image') setSelectedTargetFormat('pdf');
        if (fmtKey === 'csv') setSelectedTargetFormat('xlsx');
        if (fmtKey === 'txt') setSelectedTargetFormat('docx');
      }
    }

    setPendingQuickAction(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const triggerQuickConversion = (
    acceptExt: string,
    action: { targetFormat?: string; task?: 'format' | 'convert' | 'presentation' }
  ) => {
    setPendingQuickAction(action);
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptExt;
      fileInputRef.current.click();
    }
  };

  const handleExecuteConversion = async () => {
    if (!file || !selectedTargetFormat) return;

    setIsConverting(true);
    setErrorMessage(null);
    setConversionResult(null);

    try {
      const result = await convertUniversalFile(
        file,
        selectedTargetFormat,
        customFilename.trim()
      );
      setConversionResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'File conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const currentFmtKey = file ? detectFormatKey(file.name) : 'unknown';
  const currentOptions: ConversionOption[] =
    registry && registry[currentFmtKey]
      ? registry[currentFmtKey].allowed_outputs
      : [];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,.pptx,.png,.jpg,.jpeg,.csv,.txt,.md"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelected(e.target.files[0]);
          }
          if (fileInputRef.current) {
            fileInputRef.current.accept = '.docx,.pdf,.pptx,.png,.jpg,.jpeg,.csv,.txt,.md';
          }
        }}
      />

      {/* Main Upload / Conversion Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>100% Free & Client-Safe • Native Academic OpenXML Engine</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Universal Academic Document Converter
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Convert assignments, thesis drafts, research scans, and lecture notes between Word, PDF, PowerPoint, Excel, and text formats with guaranteed layout retention.
              </p>
            </div>

            {/* Quick feature indicators */}
            <div className="hidden sm:flex flex-col gap-1.5 text-2xs text-slate-500 shrink-0 border-l border-slate-200 pl-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero File Retention / Ephemeral
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tables, Citations & Headings Preserved
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant Direct Downloads
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8">
          <ScrollReveal delay={50} key={file ? 'file-active' : 'no-file'}>
            {!file ? (
              /* State 1: Dropzone */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => {
                  setPendingQuickAction(null);
                  fileInputRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50/60 scale-[1.01] shadow-md'
                    : 'border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-white shadow-2xs hover:shadow-sm'
                }`}
                role="button"
                tabIndex={0}
                aria-label="Upload document dropzone"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-2xs border border-indigo-100 transition-transform duration-200 group-hover:scale-105">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Drag & Drop Any Academic Document or File
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5 leading-relaxed">
                  Upload your research paper, assignment report, lecture slides, scanned notes, or dataset to convert or format instantly.
                </p>

                {/* Filter tags */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Accepted formats:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerQuickConversion('.docx', { task: 'format' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all hover:-translate-y-0.5"
                  >
                    .docx (Word)
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerQuickConversion('.pdf', { targetFormat: 'docx', task: 'convert' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all hover:-translate-y-0.5"
                  >
                    .pdf (PDF)
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerQuickConversion('.png,.jpg,.jpeg,.webp', { targetFormat: 'pdf', task: 'convert' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all hover:-translate-y-0.5"
                  >
                    .png / .jpg (Images)
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerQuickConversion('.csv', { targetFormat: 'xlsx', task: 'convert' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all hover:-translate-y-0.5"
                  >
                    .csv (Datasets)
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerQuickConversion('.txt,.md', { targetFormat: 'docx', task: 'convert' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all hover:-translate-y-0.5"
                  >
                    .txt / .md (Text)
                  </button>
                </div>
              </div>
            ) : (
              /* State 2: File Selected & Actions */
              <div className="space-y-6">
                {/* File Overview Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs shrink-0">
                      {getFormatIcon(currentFmtKey)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium">{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className="capitalize font-medium">{currentFmtKey} Format</span>
                      </div>
                    </div>
                  </div>

                  {/* Replace / Remove Controls */}
                  <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-2xs transition-all hover:-translate-y-0.5"
                    >
                      Replace File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setConversionResult(null);
                        setErrorMessage(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove file"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Task Chooser Tabs */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Your Workflow Task
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Task 1: Assignment Formatter */}
                    <button
                      type="button"
                      onClick={() => setSelectedTask('format')}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        selectedTask === 'format'
                          ? 'border-academic-navy bg-blue-50/50 ring-2 ring-academic-navy/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-academic-navy font-bold text-sm mb-1">
                        <Sliders className="w-4 h-4 text-academic-navy" />
                        <span>College Formatter</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Apply font hierarchy, margins, Roman numeral front matter, and college compliance checks.
                      </p>
                    </button>

                    {/* Task 2: Universal Converter */}
                    <button
                      type="button"
                      onClick={() => setSelectedTask('convert')}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        selectedTask === 'convert'
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                        <FileType className="w-4 h-4 text-indigo-600" />
                        <span>File Converter</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Convert to editable Word, printable PDF, structured Excel table, or plain text.
                      </p>
                    </button>

                    {/* Task 3: PowerPoint Deck */}
                    <button
                      type="button"
                      onClick={() => setSelectedTask('presentation')}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        selectedTask === 'presentation'
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                        <Presentation className="w-4 h-4 text-indigo-600" />
                        <span>Report to PPTX</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        Extract findings and sections into editable PowerPoint slides in 10 academic themes.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Conditional Workflow Execution Panels */}
                {selectedTask === 'format' && (
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left animate-fade-up">
                    <h4 className="font-bold text-sm text-slate-900 mb-1">Ready for College Formatting</h4>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                      Your document will be loaded into the AssignmentReady 7-step workspace where you can verify 40+ university presets, customize cover pages, and download compliant OpenXML documents.
                    </p>
                    <button
                      type="button"
                      onClick={() => onStartAssignmentFormatting(file)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                    >
                      <span>Launch Formatting Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {selectedTask === 'presentation' && (
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left animate-fade-up">
                    <h4 className="font-bold text-sm text-slate-900 mb-1">Generate PowerPoint Presentation</h4>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                      Open the Presentation Deck Generator to audit lecturer marking schemes, configure strict slide budgets, and download decorated PowerPoint slides.
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenPresentationWorkspace(file)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                    >
                      <span>Open Presentation Deck Generator</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {selectedTask === 'convert' && (
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-up">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Select Output Target Format
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentOptions.length > 0 ? (
                          currentOptions.map((opt) => (
                            <button
                              key={opt.target_format}
                              type="button"
                              disabled={!opt.available}
                              onClick={() => setSelectedTargetFormat(opt.target_format)}
                              className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                selectedTargetFormat === opt.target_format
                                  ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/30 shadow-xs'
                                  : opt.available
                                  ? 'border-slate-200 bg-white hover:border-slate-300 hover:-translate-y-0.5'
                                  : 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs text-slate-900">{opt.target_label}</span>
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600">
                                  {opt.extension}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-tight">{opt.description}</p>
                            </button>
                          ))
                        ) : (
                          <div className="col-span-2 text-xs text-slate-500 p-2">
                            Detecting available outputs for this file...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Custom Filename */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Custom Output Filename (Optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customFilename}
                          onChange={(e) => setCustomFilename(e.target.value)}
                          placeholder="e.g. My_Assignment_Final"
                          className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        />
                        <span className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-200 rounded-lg">
                          .{selectedTargetFormat || 'ext'}
                        </span>
                      </div>
                    </div>

                    {/* Error message */}
                    {errorMessage && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Conversion Result Download Card */}
                    {conversionResult && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <h4 className="font-bold text-sm text-emerald-950">
                              {conversionResult.output_filename}
                            </h4>
                            <p className="text-xs text-emerald-700">
                              Successfully converted ({formatFileSize(conversionResult.size_bytes)})
                            </p>
                          </div>
                        </div>
                        <a
                          href={conversionResult.download_url}
                          download={conversionResult.output_filename}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all hover:-translate-y-0.5"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Converted File</span>
                        </a>
                      </div>
                    )}

                    {/* Action Button */}
                    {!conversionResult && (
                      <button
                        type="button"
                        disabled={isConverting || !selectedTargetFormat}
                        onClick={handleExecuteConversion}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 cursor-pointer"
                      >
                        {isConverting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Converting Document...</span>
                          </>
                        ) : (
                          <>
                            <span>Convert and Save</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>

      {/* QUICK CONVERSION HUB - 6 ACTION CARDS (Solves "this page is useless" on mobile & desktop) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Quick-Conversion Actions</span>
            </h2>
            <p className="text-xs text-slate-500">
              Select a specialized academic workflow to launch directly with one click.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Word to PDF */}
          <div
            onClick={() => triggerQuickConversion('.docx', { targetFormat: 'pdf', task: 'convert' })}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-academic-blue flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  <span>DOCX</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-rose-600 font-bold">PDF</span>
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                Word to Submission PDF
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Export print-perfect, submission-ready PDF files with preserved equations, margins, and citations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Choose Word Document</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: PDF to Word */}
          <div
            onClick={() => triggerQuickConversion('.pdf', { targetFormat: 'docx', task: 'convert' })}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <FileType className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  <span>PDF</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-academic-blue font-bold">DOCX</span>
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                PDF to Editable Word
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Extract chapter sections, tables, and paragraphs from locked PDFs into editable Microsoft Word documents.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Choose PDF File</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Report to PPTX */}
          <div
            onClick={() => triggerQuickConversion('.docx,.pdf,.txt', { task: 'presentation' })}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Presentation className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  <span>DOCX/PDF</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-amber-600 font-bold">PPTX</span>
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                Assignment to PowerPoint Deck
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Transform report chapters and executive summaries into structured slide presentations in 10 academic themes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Generate Presentation</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Scans to PDF */}
          <div
            onClick={() => triggerQuickConversion('.png,.jpg,.jpeg,.webp', { targetFormat: 'pdf', task: 'convert' })}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  <span>JPG/PNG</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-rose-600 font-bold">PDF</span>
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                Homework & Lab Scans to PDF
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Convert handwritten notebook photos, diagram scans, and lab charts into a clean, printable PDF document.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Choose Scan Image</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: CSV to Academic Table */}
          <div
            onClick={() => triggerQuickConversion('.csv', { targetFormat: 'xlsx', task: 'convert' })}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  <span>CSV</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-emerald-700 font-bold">XLSX</span>
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                CSV to Formatted Excel Table
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Convert raw survey responses and experimental measurements into styled Excel sheets with auto-width columns.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Choose CSV Dataset</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: College Format Compliance */}
          <div
            onClick={() => triggerQuickConversion('.docx', { task: 'format' })}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-academic-navy flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  <span>Draft</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-indigo-600 font-bold">Formatted</span>
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                University Format Compliance
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Audit margins, font hierarchy, Roman numeral front matter, and automatic TOC against 40+ college rubrics.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Format Assignment</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* SUPPORTED FORMAT MATRIX & CAPABILITY OVERVIEW */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Supported File Format Matrix</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 pr-4">Source Format</th>
                <th className="py-2.5 px-4">Supported Outputs</th>
                <th className="py-2.5 px-4 hidden sm:table-cell">Academic Processing Type</th>
                <th className="py-2.5 pl-4 text-right">Engine Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 pr-4 font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-academic-navy" /> Word Document (.docx)
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-2xs">PDF</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-2xs">PowerPoint</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-2xs">TXT</span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell text-slate-500">Full heading & citation retention</td>
                <td className="py-3 pl-4 text-right font-semibold text-emerald-600">Lossless OOXML</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-slate-900 flex items-center gap-2">
                  <FileType className="w-4 h-4 text-rose-600" /> Portable Document (.pdf)
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-2xs">DOCX</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-2xs">PowerPoint</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-2xs">TXT</span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell text-slate-500">Structural chapter & table extraction</td>
                <td className="py-3 pl-4 text-right font-semibold text-emerald-600">High Precision</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" /> Scans & Photos (.png, .jpg, .webp)
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-2xs">Printable PDF</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-2xs">PNG</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-2xs">JPEG</span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell text-slate-500">Preserves original DPI and resolution</td>
                <td className="py-3 pl-4 text-right font-semibold text-emerald-600">DPI-Preserved</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Data Table (.csv)
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-2xs">Excel (.xlsx)</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-2xs">Word Table</span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell text-slate-500">Styled header rows & auto column widths</td>
                <td className="py-3 pl-4 text-right font-semibold text-emerald-600">Native Excel</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" /> Plain Text (.txt, .md)
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-2xs">Word Document</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-2xs">PowerPoint</span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell text-slate-500">Converts outline bullet points to slides</td>
                <td className="py-3 pl-4 text-right font-semibold text-emerald-600">Structured</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PRIVACY & SECURITY COMMITMENT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">100% Ephemeral Processing</h4>
            <p className="text-2xs text-slate-500 mt-0.5 leading-relaxed">
              Files are processed in memory and discarded immediately after download. Nothing is ever stored or logged.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Zero Watermarks or Paywalls</h4>
            <p className="text-2xs text-slate-500 mt-0.5 leading-relaxed">
              Completely free for students. Converted files have zero watermarks, header tags, or size penalties.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Academic Integrity Built-in</h4>
            <p className="text-2xs text-slate-500 mt-0.5 leading-relaxed">
              Preserves author citations, numerical equations, references, and institutional compliance standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
