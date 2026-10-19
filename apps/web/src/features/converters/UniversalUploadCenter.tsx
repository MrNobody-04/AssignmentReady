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
      {
        target_format: 'pdf',
        target_label: 'Portable Document Format (.pdf)',
        extension: '.pdf',
        mime_type: 'application/pdf',
        available: true,
        description: 'Convert Word document to PDF.',
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
        return <FileType className="w-5 h-5 text-red-600" />;
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-600" />;
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setConversionResult(null);
    setErrorMessage(null);

    // Default custom filename to original stem
    const stem = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
    setCustomFilename(`${stem}_Converted`);

    const fmtKey = detectFormatKey(selectedFile.name);
    if (fmtKey === 'docx') {
      setSelectedTask('format');
    } else {
      setSelectedTask('convert');
    }

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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFormatTagClick = (acceptExt: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-white rounded-2xl border border-slate-200/80 border-t-2 border-t-indigo-600 shadow-xl transition-all duration-300">
      {/* Header (Clean, professional, without generic blue pill) */}
      <ScrollReveal delay={0}>
        <div className="pb-6 mb-6 border-b border-slate-200">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Universal Document Center
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Format academic assignments, convert between file types, or generate presentation decks.
          </p>
        </div>
      </ScrollReveal>

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
          // Reset accept filter to default for next click
          if (fileInputRef.current) {
            fileInputRef.current.accept = '.docx,.pdf,.pptx,.png,.jpg,.jpeg,.csv,.txt,.md';
          }
        }}
      />

      <ScrollReveal delay={100} key={file ? 'file-active' : 'no-file'}>
        {/* Upload Zone */}
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all duration-200 ${
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
          <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-2xs border border-indigo-100 transition-transform duration-200 group-hover:scale-105">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Upload Any Academic Document or File
          </h3>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5 leading-relaxed">
            Drag and drop your assignment, syllabus, scan, notes, or dataset here, or click anywhere to browse.
          </p>

          {/* Clickable Format Tags (Filters OS picker to that format) */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={(e) => handleFormatTagClick('.docx', e)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 hover:border-slate-300 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
              title="Upload Word Document"
            >
              .docx
            </button>
            <button
              type="button"
              onClick={(e) => handleFormatTagClick('.pdf', e)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 hover:border-slate-300 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
              title="Upload PDF Document"
            >
              .pdf
            </button>
            <button
              type="button"
              onClick={(e) => handleFormatTagClick('.png,.jpg,.jpeg,.webp', e)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 hover:border-slate-300 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
              title="Upload Images"
            >
              .png / .jpg
            </button>
            <button
              type="button"
              onClick={(e) => handleFormatTagClick('.csv', e)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 hover:border-slate-300 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
              title="Upload CSV Dataset"
            >
              .csv
            </button>
            <button
              type="button"
              onClick={(e) => handleFormatTagClick('.txt,.md', e)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 hover:border-slate-300 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
              title="Upload Plain Text"
            >
              .txt
            </button>
          </div>
        </div>
      ) : (
        /* File Selected State & Task Chooser */
        <div className="space-y-6 animate-fade-up">
          {/* File Card & Actions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs shrink-0">
                {getFormatIcon(currentFmtKey)}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate max-w-sm sm:max-w-md">
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
            <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-2xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
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

          {/* Task Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Task
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Task 1: Assignment Formatter */}
              <button
                type="button"
                onClick={() => setSelectedTask('format')}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
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
                  Apply font hierarchy, margins, cover page, and institutional compliance checks.
                </p>
              </button>

              {/* Task 2: Universal Converter */}
              <button
                type="button"
                onClick={() => setSelectedTask('convert')}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
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
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
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
                  Extract findings and sections into editable PowerPoint slides in 5 academic themes.
                </p>
              </button>
            </div>
          </div>

          {/* Conditional Workflow Action Area */}
          {selectedTask === 'format' && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 text-left animate-fade-up">
              <h4 className="font-bold text-sm text-slate-900 mb-1">Ready to Format Assignment</h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Your document will be loaded into the 6-step AssignmentReady workspace where you can attach college rubrics, configure page numbering, and download compliant OpenXML documents.
              </p>
              <button
                type="button"
                onClick={() => onStartAssignmentFormatting(file)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              >
                <span>Launch Formatting Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {selectedTask === 'presentation' && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 text-left animate-fade-up">
              <h4 className="font-bold text-sm text-slate-900 mb-1">Generate PowerPoint Presentation</h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Open the presentation deck editor to review the structured slide outline, choose from 5 academic themes, and download an editable .pptx file.
              </p>
              <button
                type="button"
                onClick={() => onOpenPresentationWorkspace(file)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              >
                <span>Open Presentation Deck Generator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {selectedTask === 'convert' && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4 animate-fade-up">
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
                        className={`p-3 rounded-xl border text-left transition-all duration-200 ${
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all duration-150 hover:-translate-y-0.5"
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-academic-navy hover:bg-academic-indigo shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-50"
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
  );
};
