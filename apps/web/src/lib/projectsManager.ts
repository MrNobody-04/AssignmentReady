import { StudentProjectRecord } from '../types';

const STORAGE_KEY = 'assignmentready_student_projects';

export const projectsManager = {
  getAll(): StudentProjectRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const records: StudentProjectRecord[] = JSON.parse(stored);
      return Array.isArray(records)
        ? records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
    } catch {
      return [];
    }
  },

  add(record: Omit<StudentProjectRecord, 'id' | 'createdAt'>): StudentProjectRecord {
    const list = this.getAll();
    const newRecord: StudentProjectRecord = {
      ...record,
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newRecord);
    // Keep up to 50 recent projects locally
    const trimmed = list.slice(0, 50);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // LocalStorage quota fallback: keep last 10
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed.slice(0, 10)));
    }
    return newRecord;
  },

  update(id: string, updates: Partial<StudentProjectRecord>): void {
    const list = this.getAll().map((p) => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  },

  remove(id: string): void {
    const list = this.getAll().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
