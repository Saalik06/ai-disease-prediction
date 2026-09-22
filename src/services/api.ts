import { AdminStats, Disease, MLEvaluationMetrics, PredictionRecord, PredictionResponse, Symptom, User } from '../types/index.js';

const TOKEN_KEY = 'healthai_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async getMe(): Promise<{ user: User } | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/me', { headers: this.getHeaders() });
      if (!res.ok) {
        this.clearToken();
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const data = await this.getMe();
    return data ? data.user : null;
  },

  async register(data: any): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
    this.setToken(result.token);
    return result;
  },

  async login(emailOrUser: string, pass: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrUser, password: pass }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    this.setToken(result.token);
    return result;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/logout', { method: 'POST', headers: this.getHeaders() });
    } catch {
      // ignore
    }
    this.clearToken();
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update profile');
    return result;
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    const res = await fetch('/api/change-password', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to change password');
  },

  async predictDisease(
    symptoms: Array<string | { symptom: string; severity?: number; frequency?: number; weight?: number }>,
    weights?: Record<string, { severity?: number; frequency?: number; weight?: number } | number>
  ): Promise<PredictionResponse> {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ symptoms, weights }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Prediction calculation failed');
    return result;
  },

  async getHistory(): Promise<PredictionRecord[]> {
    const res = await fetch('/api/history', { headers: this.getHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch history');
    return result.history;
  },

  async getPredictionById(id: string): Promise<PredictionRecord> {
    const res = await fetch(`/api/history/${id}`, { headers: this.getHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch record');
    return result.record;
  },

  async getDiseases(): Promise<Disease[]> {
    const res = await fetch('/api/diseases');
    const result = await res.json();
    return result.diseases || [];
  },

  async getDiseaseById(id: string): Promise<Disease> {
    const res = await fetch(`/api/diseases/${id}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Disease not found');
    return result.disease;
  },

  async getSymptoms(): Promise<Symptom[]> {
    const res = await fetch('/api/symptoms');
    const result = await res.json();
    return result.symptoms || [];
  },

  async getMLEvaluation(): Promise<MLEvaluationMetrics> {
    const res = await fetch('/api/ml/evaluation');
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load ML metrics');
    return result;
  },

  async getMLMetrics(): Promise<MLEvaluationMetrics> {
    return this.getMLEvaluation();
  },

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats', { headers: this.getHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Unauthorized admin access');
    return result;
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch('/api/admin/users', { headers: this.getHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch users');
    return result.users;
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete user');
  },

  async getAdminPredictions(): Promise<PredictionRecord[]> {
    const res = await fetch('/api/admin/predictions', { headers: this.getHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch predictions');
    return result.predictions;
  },

  async addDisease(data: Partial<Disease>): Promise<Disease> {
    const res = await fetch('/api/admin/diseases', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to add disease');
    return result.disease;
  },

  async updateDisease(id: string, data: Partial<Disease>): Promise<Disease> {
    const res = await fetch(`/api/admin/diseases/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update disease');
    return result.disease;
  },

  async deleteDisease(id: string): Promise<void> {
    const res = await fetch(`/api/admin/diseases/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete disease');
  },

  async addSymptom(data: Partial<Symptom>): Promise<Symptom> {
    const res = await fetch('/api/admin/symptoms', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to add symptom');
    return result.symptom;
  },

  async updateSymptom(id: string, data: Partial<Symptom>): Promise<Symptom> {
    const res = await fetch(`/api/admin/symptoms/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update symptom');
    return result.symptom;
  },

  async assignSymptomWeights(
    id: string,
    weights: { severity_weight?: number; frequency_weight?: number }
  ): Promise<{ success: boolean; symptom: Symptom; message: string }> {
    const res = await fetch(`/api/admin/symptoms/${id}/weights`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(weights),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to assign symptom weights');
    return result;
  },

  async previewSymptomWeight(value: number): Promise<{
    input_value: number;
    range: string;
    normalized_score: number;
    effective_multiplier: number;
    explanation: string;
  }> {
    const res = await fetch('/api/symptoms/weights/preview', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to preview weight calculation');
    return result;
  },

  async deleteSymptom(id: string): Promise<void> {
    const res = await fetch(`/api/admin/symptoms/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete symptom');
  },

  async askAIExplainer(condition: string, symptoms: string[], query?: string): Promise<string> {
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ condition, symptoms, query }),
      });
      const result = await res.json();
      return result.response || 'Educational information unavailable.';
    } catch {
      return 'Guidance: Please consult your physician for individualized medical counsel.';
    }
  }
};
