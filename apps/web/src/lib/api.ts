import {
  FormattingSettings,
  InspectionResult,
  JobStatusResponse,
  ComplianceReport,
} from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  code: string;
  details: unknown[];

  constructor(message: string, code = 'API_ERROR', details: unknown[] = []) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errData;
    try {
      errData = await res.json();
    } catch {
      throw new ApiError(`Server responded with status ${res.status}: ${res.statusText}`);
    }
    const err = errData.error || errData;
    throw new ApiError(err.message || 'An error occurred', err.code || 'UNKNOWN_ERROR', err.details || []);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async healthCheck(): Promise<{ status: string; app: string; libreoffice_available: boolean }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async uploadAssignment(file: File): Promise<{ job_id: string; filename: string; inspection: InspectionResult }> {
    const formData = new FormData();
    formData.append('file', file);

    let res = await fetch(`${API_BASE}/jobs/upload`, {
      method: 'POST',
      body: formData,
    });

    // Fallback to /upload if /jobs/upload returns 404
    if (!res.ok && res.status === 404) {
      res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
    }

    const data = await handleResponse<JobStatusResponse & { filename?: string }>(res);
    return {
      job_id: data.job_id,
      filename: data.original_filename || data.filename || file.name,
      inspection: data.inspection!,
    };
  },

  async uploadCoverTemplate(jobId: string, file: File): Promise<{ status: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload/template/${jobId}`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async uploadGuidelines(jobId: string, file: File): Promise<{ status: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload/guidelines/${jobId}`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async uploadMarkingScheme(jobId: string, file: File): Promise<{ status: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload/marking-scheme/${jobId}`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async inspectDocument(jobId: string): Promise<InspectionResult> {
    const res = await fetch(`${API_BASE}/inspect/${jobId}`, { method: 'POST' });
    return handleResponse<InspectionResult>(res);
  },

  async formatDocument(jobId: string, settings: FormattingSettings): Promise<JobStatusResponse> {
    const res = await fetch(`${API_BASE}/format/${jobId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse<JobStatusResponse>(res);
  },

  async checkCompliance(jobId: string, settings: FormattingSettings): Promise<ComplianceReport> {
    const res = await fetch(`${API_BASE}/check-compliance/${jobId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse<ComplianceReport>(res);
  },

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`);
    return handleResponse<JobStatusResponse>(res);
  },

  getDownloadUrl(jobId: string, format: 'docx' | 'pdf' = 'docx'): string {
    return `${API_BASE}/download/${jobId}?format=${format}`;
  },

  async deleteJob(jobId: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // ==========================================
  // Assignment Doctor
  // ==========================================
  async diagnoseUploadedAssignment(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/doctor/diagnose-upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async diagnoseExistingJob(jobId: string, versionId?: number): Promise<any> {
    const url = versionId ? `${API_BASE}/doctor/diagnose/${jobId}?version_id=${versionId}` : `${API_BASE}/doctor/diagnose/${jobId}`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async fixAssignmentIssues(
    jobId: string,
    fixAllSafe: boolean,
    selectedActionIds: string[],
    settings?: FormattingSettings,
    versionId?: number
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/doctor/fix/${jobId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fix_all_safe: fixAllSafe,
        selected_action_ids: selectedActionIds,
        settings: settings || undefined,
        version_id: versionId || undefined,
      }),
    });
    return handleResponse(res);
  },

  // ==========================================
  // Document Versions & Shared Project Workflow
  // ==========================================
  async getDocumentVersions(jobId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/versions`);
    return handleResponse(res);
  },

  async setDocumentVersion(jobId: string, versionId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/versions/${versionId}/set-current`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async getProjectRubricAnalysis(jobId: string, versionId?: number): Promise<any> {
    const url = versionId
      ? `${API_BASE}/jobs/${jobId}/rubric-analysis?version_id=${versionId}`
      : `${API_BASE}/jobs/${jobId}/rubric-analysis`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async planProjectSlides(jobId: string, req: any): Promise<any> {
    const res = await fetch(`${API_BASE}/presentation/project/${jobId}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return handleResponse(res);
  },

  async generateProjectPresentation(jobId: string, req: any): Promise<any> {
    const res = await fetch(`${API_BASE}/presentation/project/${jobId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return handleResponse(res);
  },

  async getProjectPresentationStatus(jobId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/presentation/project/${jobId}/status`);
    return handleResponse(res);
  },

  // ==========================================
  // Marking Scheme & Rubric
  // ==========================================
  async analyzeRubricFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/presentation/analyze-rubric`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async mapRubricCompliance(report: any, criteria: any[]): Promise<any> {
    const res = await fetch(`${API_BASE}/presentation/map-compliance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report, criteria }),
    });
    return handleResponse(res);
  },
};
