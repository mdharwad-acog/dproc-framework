const API_BASE = '/api';

export interface Project {
  id: string;
  name: string;
  path: string;
  config: any;
  lastModified: string;
}

export const api = {
  async listProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  async generateReport(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${id}/generate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },

  async listReports(id: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/projects/${id}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  downloadReport(id: string, filename: string): string {
    return `${API_BASE}/projects/${id}/download?file=${filename}`;
  },

  async getSettings(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/status`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async saveSettings(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
  },
};
