import {
  FormattingSettings,
  JobStatusResponse,
  ComplianceReport,
  InputFormatInfo,
  ConversionResult,
  PresentationOutline,
  PresentationThemeInfo,
} from '../types';

const API_BASE = '/api';

export async function checkApiHealth(): Promise<{ status: string; libreoffice_available: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('API server unreachable');
    return await res.json();
  } catch (err) {
    return { status: 'offline', libreoffice_available: false };
  }
}

export async function uploadAssignment(file: File): Promise<JobStatusResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/jobs/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Upload failed with HTTP ${res.status}`);
  }

  return await res.json();
}

export async function uploadCoverTemplate(jobId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/jobs/${jobId}/upload-cover`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to upload cover template');
  }
}

export async function uploadGuidelines(jobId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/jobs/${jobId}/upload-guidelines`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to upload guidelines');
  }
}

export async function uploadRubric(jobId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/jobs/${jobId}/upload-rubric`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to upload marking rubric');
  }
}

export async function formatDocument(jobId: string, settings: FormattingSettings): Promise<JobStatusResponse> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/format`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to format document');
  }

  return await res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`);
  if (!res.ok) throw new Error('Failed to retrieve job status');
  return await res.json();
}

export async function getComplianceReport(jobId: string): Promise<ComplianceReport> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/compliance`);
  if (!res.ok) throw new Error('Failed to retrieve compliance audit');
  return await res.json();
}

export function getDownloadDocxUrl(jobId: string, customFilename?: string): string {
  if (customFilename && customFilename.trim()) {
    return `${API_BASE}/jobs/${jobId}/download?filename=${encodeURIComponent(customFilename.trim())}`;
  }
  return `${API_BASE}/jobs/${jobId}/download`;
}

export function getDownloadPdfUrl(jobId: string, customFilename?: string): string {
  if (customFilename && customFilename.trim()) {
    return `${API_BASE}/jobs/${jobId}/download-pdf?filename=${encodeURIComponent(customFilename.trim())}`;
  }
  return `${API_BASE}/jobs/${jobId}/download-pdf`;
}

export async function deleteJob(jobId: string): Promise<void> {
  await fetch(`${API_BASE}/jobs/${jobId}`, { method: 'DELETE' });
}

// ----------------------------------------------------
// Universal Conversion APIs
// ----------------------------------------------------

export async function getConversionRegistry(): Promise<{
  registry: Record<string, InputFormatInfo>;
  libreoffice_available: boolean;
}> {
  const res = await fetch(`${API_BASE}/conversions/registry`);
  if (!res.ok) throw new Error('Failed to fetch conversion registry');
  return await res.json();
}

export async function convertUniversalFile(
  file: File,
  targetFormat: string,
  customFilename: string = '',
  theme: string = 'academic_classic'
): Promise<ConversionResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', targetFormat);
  formData.append('custom_filename', customFilename);
  formData.append('theme', theme);

  const res = await fetch(`${API_BASE}/conversions/convert`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || errData?.detail || 'File conversion failed');
  }

  return await res.json();
}

// ----------------------------------------------------
// Presentation Generator APIs
// ----------------------------------------------------

export async function getPresentationThemes(): Promise<{ themes: PresentationThemeInfo[] }> {
  const res = await fetch(`${API_BASE}/presentation/themes`);
  if (!res.ok) throw new Error('Failed to fetch presentation themes');
  return await res.json();
}

export async function extractPresentationOutline(file: File): Promise<PresentationOutline> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/presentation/extract-outline`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || errData?.detail || 'Failed to extract presentation outline');
  }

  return await res.json();
}

export async function analyzeReport(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/presentation/analyze-report`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || errData?.detail || 'Failed to analyze report');
  }

  return await res.json();
}

export async function analyzeRubric(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/presentation/analyze-rubric`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || errData?.detail || 'Failed to analyze rubric');
  }

  return await res.json();
}

export async function mapCompliance(report: any, criteria: any[]): Promise<any> {
  const res = await fetch(`${API_BASE}/presentation/map-compliance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report, criteria }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || errData?.detail || 'Failed to map compliance');
  }

  return await res.json();
}

export async function planSlides(payload: {
  report: any;
  criteria?: any[];
  text_density?: string;
  target_slide_count?: number;
  audience?: string;
  presentation_type?: string;
  duration_minutes?: number;
  include_notes?: boolean;
  include_references?: boolean;
  include_qa?: boolean;
  transition_type?: string;
  animation_intensity?: string;
  university_logo_base64?: string;
  college_logo_base64?: string;
  presentation_mode?: 'individual' | 'group';
  presenters?: any[];
  counting_mode?: 'total' | 'content_only';
}): Promise<PresentationOutline> {
  const res = await fetch(`${API_BASE}/presentation/plan-slides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || errData?.detail || 'Failed to plan presentation slides');
  }

  return await res.json();
}

export async function generatePresentation(
  outline: PresentationOutline,
  theme: string = 'academic_classic',
  customFilename: string = ''
): Promise<{ presentation_id: string; filename: string; total_slides: number; download_url: string }> {
  const res = await fetch(`${API_BASE}/presentation/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      outline,
      theme,
      custom_filename: customFilename,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || errData?.detail || 'Failed to generate presentation');
  }

  return await res.json();
}

