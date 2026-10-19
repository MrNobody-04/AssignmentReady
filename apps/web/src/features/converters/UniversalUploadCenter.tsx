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
} from 'lucide-react';
import {
  getConversionRegistry,
  convertUniversalFile,
} from '../../services/api';
import { InputFormatInfo, ConversionOption, ConversionResult } from '../../types';

interface UniversalUploadCenterProps {
  onStartAssignmentFormatting: (file: File) => void;
  onOpenPresentationWorkspace: (file?: File) => void;
}

export const UniversalUploadCenter: React.FC<UniversalUploadCenterProps> = ({
  onStartAssignmentFormatting,
  onOpenPresentationWorkspace,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTask, setSelectedTask] = useState<'format' | 'convert' | 'presentation'>('convert');
  const [registry, setRegistry] = useState<Record<string, InputFormatInfo> | null>(null);
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
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-white rounded-2xl border border-slate-200 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Universal Document Center
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Format academic assignments, convert between file types, or generate presentation decks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-academic-blue border border-blue-200">
            OpenXML • PDF • PPTX • Images • CSV
          </span>
        </div>
      </div>

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
          className={`border-2 border-dashed rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-academic-teal bg-teal-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-academic-blue bg-slate-50/50 hover:bg-white shadow-xs'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelected(e.target.files[0]);
              }
            }}
          />
          <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 text-academic-teal flex items-center justify-center mb-4 shadow-sm border border-teal-100">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Upload Any Academic Document or File
          </h3>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Drag and drop your assignment, syllabus, scan, notes, or dataset here, or click to browse.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-600">
            <span className="px-2.5 py-1 rounded bg-white border border-slate-200 shadow-2xs">.docx</span>
            <span className="px-2.5 py-1 rounded bg-white border border-slate-200 shadow-2xs">.pdf</span>
            <span className="px-2.5 py-1 rounded bg-white border border-slate-200 shadow-2xs">.png / .jpg</span>
            <span className="px-2.5 py-1 rounded bg-white border border-slate-200 shadow-2xs">.csv</span>
            <span className="px-2.5 py-1 rounded bg-white border border-slate-200 shadow-2xs">.txt</span>
          </div>
        </div>
      ) : (
        /* File Selected & Task Chooser */
        <div className="space-y-6 animate-fadeIn">
          {/* File Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-academic-navy text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {file.name.split('.').pop() || 'DOC'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 truncate max-w-md">{file.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span className="capitalize">{currentFmtKey} Format</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setConversionResult(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Task Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Task
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Task 1: Assignment Formatter */}
              <button
                type="button"
                onClick={() => setSelectedTask('format')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedTask === 'format'
                    ? 'border-academic-navy bg-blue-50/40 ring-2 ring-academic-navy/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 text-academic-navy font-bold text-sm mb-1">
                  <Sliders className="w-4 h-4 text-academic-blue" />
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
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedTask === 'convert'
                    ? 'border-academic-teal bg-teal-50/40 ring-2 ring-academic-teal/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 text-academic-teal font-bold text-sm mb-1">
                  <FileType className="w-4 h-4 text-academic-teal" />
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
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedTask === 'presentation'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
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
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <h4 className="font-bold text-sm text-slate-900 mb-1">Ready to Format Assignment</h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Your document will be loaded into the 6-step AssignmentReady workspace where you can attach college rubrics, configure page numbering, and download compliant OpenXML documents.
              </p>
              <button
                onClick={() => onStartAssignmentFormatting(file)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-academic-navy hover:bg-academic-indigo shadow-md transition-all"
              >
                <span>Launch Formatting Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {selectedTask === 'presentation' && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <h4 className="font-bold text-sm text-slate-900 mb-1">Generate PowerPoint Presentation</h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Open the presentation deck editor to review the structured slide outline, choose from 5 academic themes, and download an editable .pptx file.
              </p>
              <button
                onClick={() => onOpenPresentationWorkspace(file)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
              >
                <span>Open Presentation Deck Generator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {selectedTask === 'convert' && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
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
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedTargetFormat === opt.target_format
                            ? 'border-academic-teal bg-white ring-2 ring-academic-teal/30 shadow-xs'
                            : opt.available
                            ? 'border-slate-200 bg-white hover:border-slate-300'
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
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-academic-teal focus:border-academic-teal bg-white"
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
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-emerald-950">
                        {conversionResult.output_filename}
                      </h4>
                      <p className="text-xs text-emerald-700">
                        Successfully converted ({(conversionResult.size_bytes / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  </div>
                  <a
                    href={conversionResult.download_url}
                    download={conversionResult.output_filename}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all"
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-academic-teal hover:bg-academic-teal-dark shadow-md transition-all disabled:opacity-50"
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
    </div>
  );
};
