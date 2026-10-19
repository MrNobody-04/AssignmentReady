import { FormattingSettings, JobStatusResponse, ComplianceReport } from '../types';

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

export function getDownloadDocxUrl(jobId: string): string {
  return `${API_BASE}/jobs/${jobId}/download`;
}

export function getDownloadPdfUrl(jobId: string): string {
  return `${API_BASE}/jobs/${jobId}/download-pdf`;
}

export async function deleteJob(jobId: string): Promise<void> {
  await fetch(`${API_BASE}/jobs/${jobId}`, { method: 'DELETE' });
}
