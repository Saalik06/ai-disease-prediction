import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { AdminStats, Disease, PredictionRecord, Symptom, User } from '../src/types/index.js';
import { INITIAL_DISEASES, INITIAL_SYMPTOMS } from './ml/dataset.js';

interface StoredUser extends User {
  password_hash: string;
  salt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'healthcare_db.json');

interface DatabaseStore {
  users: StoredUser[];
  diseases: Disease[];
  symptoms: Symptom[];
  predictions: PredictionRecord[];
  sessions: Record<string, string>; // token -> userId
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, finalSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: finalSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return testHash === hash;
}

class HealthcareDB {
  private data: DatabaseStore;

  constructor() {
    this.data = this.loadData();
    this.seedInitialData();
  }

  private loadData(): DatabaseStore {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to read db file, initializing fresh store:', err);
      }
    }
    return {
      users: [],
      diseases: [...INITIAL_DISEASES],
      symptoms: [...INITIAL_SYMPTOMS],
      predictions: [],
      sessions: {},
    };
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }
  }

  private seedInitialData() {
    let changed = false;

    // 1. Seed Admin
    const adminEmail = 'admin@healthai.org';
    const existingAdmin = this.data.users.find((u) => u.email.toLowerCase() === adminEmail);
    if (!existingAdmin) {
      const { hash, salt } = hashPassword('admin123');
      this.data.users.push({
        id: 'usr_admin_master',
        name: 'System Administrator',
        email: adminEmail,
        phone: '+1 (555) 019-2831',
        age: 38,
        gender: 'Other',
        role: 'admin',
        created_at: new Date('2026-01-10T08:00:00Z').toISOString(),
        password_hash: hash,
        salt,
      });
      changed = true;
    }

    // 2. Seed Demo Patient
    const demoPatientEmail = 'john.doe@example.com';
    let demoPatient = this.data.users.find((u) => u.email.toLowerCase() === demoPatientEmail);
    if (!demoPatient) {
      const { hash, salt } = hashPassword('password123');
      demoPatient = {
        id: 'usr_patient_demo1',
        name: 'John Doe',
        email: demoPatientEmail,
        phone: '+1 (555) 234-5678',
        age: 34,
        gender: 'Male',
        role: 'patient',
        created_at: new Date('2026-02-15T10:30:00Z').toISOString(),
        password_hash: hash,
        salt,
      };
      this.data.users.push(demoPatient);
      changed = true;
    }

    // 3. Seed sample patient Sarah
    const sarahEmail = 'sarah.jenkins@example.com';
    let sarahPatient = this.data.users.find((u) => u.email.toLowerCase() === sarahEmail);
    if (!sarahPatient) {
      const { hash, salt } = hashPassword('password123');
      sarahPatient = {
        id: 'usr_patient_demo2',
        name: 'Sarah Jenkins',
        email: sarahEmail,
        phone: '+1 (555) 876-5432',
        age: 29,
        gender: 'Female',
        role: 'patient',
        created_at: new Date('2026-03-01T14:15:00Z').toISOString(),
        password_hash: hash,
        salt,
      };
      this.data.users.push(sarahPatient);
      changed = true;
    }

    // 4. Seed initial diseases & symptoms if empty
    if (this.data.diseases.length === 0) {
      this.data.diseases = [...INITIAL_DISEASES];
      changed = true;
    }
    if (this.data.symptoms.length === 0) {
      this.data.symptoms = [...INITIAL_SYMPTOMS];
      changed = true;
    }

    // 5. Seed historical predictions for realistic dashboard analytics
    if (this.data.predictions.length === 0) {
      const samplePredictions: PredictionRecord[] = [
        {
          id: 'pred_hist_01',
          user_id: 'usr_patient_demo1',
          user_name: 'John Doe',
          user_email: 'john.doe@example.com',
          symptoms: ['Fever', 'Cough', 'Fatigue', 'Chills'],
          predicted_disease: 'Influenza (Flu)',
          confidence: 88.4,
          prediction_date: new Date(Date.now() - 5 * 86400000).toISOString(),
          disease_description: 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and sometimes the lungs.',
          precautions: [
            'Get plenty of bed rest and sleep.',
            'Drink fluids such as water, broth, and electrolyte solutions.',
            'Take fever reducers as advised by pharmacist.'
          ],
          recommended_next_step: 'Consult a primary care physician if fever exceeds 103°F or lasts more than 4 days.'
        },
        {
          id: 'pred_hist_02',
          user_id: 'usr_patient_demo1',
          user_name: 'John Doe',
          user_email: 'john.doe@example.com',
          symptoms: ['Headache', 'Dizziness', 'Nausea'],
          predicted_disease: 'Migraine Headache',
          confidence: 82.1,
          prediction_date: new Date(Date.now() - 14 * 86400000).toISOString(),
          disease_description: 'A neurological condition that causes intense, throbbing pain usually on one side of the head.',
          precautions: [
            'Rest in a dark, quiet room.',
            'Apply cool compresses across the forehead.',
            'Ensure adequate hydration.'
          ],
          recommended_next_step: 'Schedule an appointment with a neurologist if headaches occur with visual aura or severe frequency.'
        },
        {
          id: 'pred_hist_03',
          user_id: 'usr_patient_demo2',
          user_name: 'Sarah Jenkins',
          user_email: 'sarah.jenkins@example.com',
          symptoms: ['Sneezing', 'Runny nose', 'Itching (Pruritus)', 'Sore throat'],
          predicted_disease: 'Allergic Rhinitis (Hay Fever)',
          confidence: 91.5,
          prediction_date: new Date(Date.now() - 2 * 86400000).toISOString(),
          disease_description: 'An allergic response to airborne allergens such as pollen, dust mites, or pet dander.',
          precautions: [
            'Minimize exposure to pollen by keeping windows closed.',
            'Use HEPA air purifiers.',
            'Rinse nasal passages with saline rinse.'
          ],
          recommended_next_step: 'Consult an allergist if symptoms persist beyond seasonal pollen peaks.'
        },
        {
          id: 'pred_hist_04',
          user_id: 'usr_patient_demo2',
          user_name: 'Sarah Jenkins',
          user_email: 'sarah.jenkins@example.com',
          symptoms: ['Burning sensation during urination', 'Frequent urination', 'Abdominal pain'],
          predicted_disease: 'Urinary Tract Infection (UTI)',
          confidence: 89.2,
          prediction_date: new Date(Date.now() - 25 * 86400000).toISOString(),
          disease_description: 'An infection in any part of the urinary system, including kidneys, bladder, or urethra.',
          precautions: [
            'Drink copious amounts of clean water.',
            'Do not delay urination.',
            'Avoid bladder irritants like caffeine.'
          ],
          recommended_next_step: 'Visit an urgent care clinic for a urinalysis and prescription antibiotics.'
        }
      ];
      this.data.predictions = samplePredictions;
      changed = true;
    }

    if (changed) {
      this.save();
    }
  }

  // --- AUTH METHODS ---

  public registerUser(params: {
    name: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    password: string;
    role?: 'patient' | 'admin';
  }): { user: User; token: string } {
    const emailLower = params.email.trim().toLowerCase();
    const existing = this.data.users.find((u) => u.email.toLowerCase() === emailLower);
    if (existing) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const { hash, salt } = hashPassword(params.password);
    const id = 'usr_' + crypto.randomUUID().slice(0, 12);
    const newUser: StoredUser = {
      id,
      name: params.name.trim(),
      email: emailLower,
      phone: params.phone.trim(),
      age: Number(params.age),
      gender: params.gender,
      role: params.role || 'patient',
      created_at: new Date().toISOString(),
      password_hash: hash,
      salt,
    };

    this.data.users.push(newUser);
    const token = crypto.randomUUID();
    this.data.sessions[token] = id;
    this.save();

    const safeUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      age: newUser.age,
      gender: newUser.gender,
      role: newUser.role,
      created_at: newUser.created_at,
    };

    return { user: safeUser, token };
  }

  public loginUser(emailOrUsername: string, password: string): { user: User; token: string } {
    const lookup = emailOrUsername.trim().toLowerCase();
    const user = this.data.users.find(
      (u) => u.email.toLowerCase() === lookup || u.name.toLowerCase() === lookup
    );

    if (!user) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const token = crypto.randomUUID();
    this.data.sessions[token] = user.id;
    this.save();

    const safeUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      age: user.age,
      gender: user.gender,
      role: user.role,
      created_at: user.created_at,
    };

    return { user: safeUser, token };
  }

  public getUserByToken(token: string): User | null {
    if (!token) return null;
    const userId = this.data.sessions[token];
    if (!userId) return null;
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      age: user.age,
      gender: user.gender,
      role: user.role,
      created_at: user.created_at,
    };
  }

  public logout(token: string) {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.save();
    }
  }

  public updateUserProfile(userId: string, updates: Partial<User>): User {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found.');
    }

    if (updates.name) user.name = updates.name.trim();
    if (updates.phone) user.phone = updates.phone.trim();
    if (updates.age !== undefined) user.age = Number(updates.age);
    if (updates.gender) user.gender = updates.gender;

    this.save();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      age: user.age,
      gender: user.gender,
      role: user.role,
      created_at: user.created_at,
    };
  }

  public changePassword(userId: string, currentPass: string, newPass: string) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found.');

    const isValid = verifyPassword(currentPass, user.password_hash, user.salt);
    if (!isValid) throw new Error('Current password does not match.');

    const { hash, salt } = hashPassword(newPass);
    user.password_hash = hash;
    user.salt = salt;
    this.save();
  }

  public deleteUser(userId: string): void {
    const idx = this.data.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found.');
    this.data.users.splice(idx, 1);
    this.save();
  }

  // --- PREDICTION METHODS ---

  public savePrediction(pred: Omit<PredictionRecord, 'id' | 'prediction_date'>): PredictionRecord {
    const id = 'pred_' + crypto.randomUUID().slice(0, 10);
    const newRecord: PredictionRecord = {
      id,
      ...pred,
      prediction_date: new Date().toISOString(),
    };
    this.data.predictions.unshift(newRecord);
    this.save();
    return newRecord;
  }

  public getUserPredictions(userId: string): PredictionRecord[] {
    return this.data.predictions
      .filter((p) => p.user_id === userId)
      .sort((a, b) => new Date(b.prediction_date).getTime() - new Date(a.prediction_date).getTime());
  }

  public getPredictionById(id: string): PredictionRecord | null {
    return this.data.predictions.find((p) => p.id === id) || null;
  }

  // --- DISEASE CATALOG METHODS ---

  public getDiseases(): Disease[] {
    return this.data.diseases;
  }

  public getDiseaseById(id: string): Disease | null {
    return this.data.diseases.find((d) => d.id === id) || null;
  }

  public addDisease(d: Omit<Disease, 'id'>): Disease {
    const id = 'dis_' + crypto.randomUUID().slice(0, 8);
    const newDisease: Disease = { id, ...d };
    this.data.diseases.push(newDisease);
    this.save();
    return newDisease;
  }

  public updateDisease(id: string, updates: Partial<Disease>): Disease {
    const idx = this.data.diseases.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Disease not found');
    this.data.diseases[idx] = { ...this.data.diseases[idx], ...updates };
    this.save();
    return this.data.diseases[idx];
  }

  public deleteDisease(id: string) {
    this.data.diseases = this.data.diseases.filter((d) => d.id !== id);
    this.save();
  }

  // --- SYMPTOMS CATALOG METHODS ---

  public getSymptoms(): Symptom[] {
    return this.data.symptoms;
  }

  public addSymptom(s: Omit<Symptom, 'id'>): Symptom {
    const id = 'sym_' + crypto.randomUUID().slice(0, 8);
    const newSymptom: Symptom = { id, ...s };

    if (newSymptom.severity_weight !== undefined) {
      const val = Number(newSymptom.severity_weight);
      if (isNaN(val) || val < 90 || val > 108) {
        throw new Error('Custom severity weight must be within the 90-108 range.');
      }
      newSymptom.severity_weight = val;
    }

    if (newSymptom.frequency_weight !== undefined) {
      const val = Number(newSymptom.frequency_weight);
      if (isNaN(val) || val < 90 || val > 108) {
        throw new Error('Custom frequency weight must be within the 90-108 range.');
      }
      newSymptom.frequency_weight = val;
    }

    this.data.symptoms.push(newSymptom);
    this.save();
    return newSymptom;
  }

  public updateSymptom(id: string, updates: Partial<Symptom>): Symptom {
    const idx = this.data.symptoms.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Symptom not found');

    if (updates.severity_weight !== undefined) {
      const val = Number(updates.severity_weight);
      if (isNaN(val) || val < 90 || val > 108) {
        throw new Error('Custom severity weight must be within the 90-108 range.');
      }
      updates.severity_weight = val;
    }

    if (updates.frequency_weight !== undefined) {
      const val = Number(updates.frequency_weight);
      if (isNaN(val) || val < 90 || val > 108) {
        throw new Error('Custom frequency weight must be within the 90-108 range.');
      }
      updates.frequency_weight = val;
    }

    this.data.symptoms[idx] = { ...this.data.symptoms[idx], ...updates };
    this.save();
    return this.data.symptoms[idx];
  }

  public deleteSymptom(id: string) {
    this.data.symptoms = this.data.symptoms.filter((s) => s.id !== id);
    this.save();
  }

  // --- ADMIN METHODS ---

  public getAllUsers(): User[] {
    return this.data.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      age: u.age,
      gender: u.gender,
      role: u.role,
      created_at: u.created_at,
    }));
  }

  public getAllPredictions(): PredictionRecord[] {
    return [...this.data.predictions].sort(
      (a, b) => new Date(b.prediction_date).getTime() - new Date(a.prediction_date).getTime()
    );
  }

  public getAdminStats(): AdminStats {
    const totalUsers = this.data.users.filter((u) => u.role !== 'admin').length;
    const totalPredictions = this.data.predictions.length;
    const totalDiseases = this.data.diseases.length;
    const totalSymptoms = this.data.symptoms.length;

    // Disease frequency count
    const diseaseCounts: Record<string, number> = {};
    for (const p of this.data.predictions) {
      diseaseCounts[p.predicted_disease] = (diseaseCounts[p.predicted_disease] || 0) + 1;
    }

    const freqArray = Object.entries(diseaseCounts)
      .map(([disease, count]) => ({
        disease,
        count,
        percentage: Math.round((count / (totalPredictions || 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Daily predictions for chart
    const dailyMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[dateStr] = 0;
    }

    for (const p of this.data.predictions) {
      const dateStr = new Date(p.prediction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr]++;
      }
    }

    const daily_predictions = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
    const most_predicted_disease = freqArray.length > 0 ? freqArray[0].disease : 'None';

    return {
      total_users: totalUsers,
      total_predictions: totalPredictions,
      total_diseases: totalDiseases,
      total_symptoms: totalSymptoms,
      most_predicted_disease,
      disease_distribution: diseaseCounts,
      most_frequently_predicted: freqArray,
      recent_predictions: this.data.predictions.slice(0, 10),
      daily_predictions,
    };
  }
}

export const db = new HealthcareDB();
