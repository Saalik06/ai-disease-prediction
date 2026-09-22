import { GoogleGenAI } from '@google/genai';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { globalClassifier, normalize90to108Weight } from './server/ml/classifier.js';
import { runModelEvaluation } from './server/ml/evaluation.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to extract bearer token
function getAuthToken(req: Request): string {
  const header = req.headers.authorization;
  if (!header) return '';
  if (header.startsWith('Bearer ')) {
    return header.substring(7).trim();
  }
  return header.trim();
}

// ----------------- AUTHENTICATION API -----------------

// POST /api/register
app.post('/api/register', (req: Request, res: Response) => {
  try {
    const { name, email, phone, age, gender, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const result = db.registerUser({
      name,
      email,
      phone: phone || '',
      age: age ? Number(age) : 25,
      gender: gender || 'Prefer not to say',
      password,
      role: 'patient',
    });

    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

// POST /api/login
app.post('/api/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const result = db.loginUser(email, password);
    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'Authentication failed.' });
  }
});

// GET /api/me
app.get('/api/me', (req: Request, res: Response) => {
  const token = getAuthToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
  return res.json({ user });
});

// POST /api/logout
app.post('/api/logout', (req: Request, res: Response) => {
  const token = getAuthToken(req);
  if (token) {
    db.logout(token);
  }
  return res.json({ success: true });
});

// PUT /api/profile
app.put('/api/profile', (req: Request, res: Response) => {
  const token = getAuthToken(req);
  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const updated = db.updateUserProfile(user.id, req.body);
    return res.json({ user: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/change-password
app.put('/api/change-password', (req: Request, res: Response) => {
  const token = getAuthToken(req);
  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }
  if (confirmPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New passwords do not match.' });
  }

  try {
    db.changePassword(user.id, currentPassword, newPassword);
    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ----------------- ML PREDICTION API -----------------

// POST /api/predict
app.post('/api/predict', (req: Request, res: Response) => {
  try {
    const { symptoms, weights, severities, frequencies, symptom_weights } = req.body;
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: 'Please select at least one symptom for disease prediction.' });
    }

    // Consolidate custom weights specifically mapped to symptoms
    const consolidatedWeights: Record<string, { severity?: number; frequency?: number; weight?: number }> = {};

    if (symptom_weights && typeof symptom_weights === 'object') {
      for (const [sym, cfg] of Object.entries(symptom_weights)) {
        if (typeof cfg === 'object' && cfg !== null) {
          consolidatedWeights[sym] = { ...(consolidatedWeights[sym] || {}), ...(cfg as any) };
        }
      }
    }

    if (weights && typeof weights === 'object') {
      for (const [sym, w] of Object.entries(weights)) {
        if (typeof w === 'number') {
          consolidatedWeights[sym] = { ...(consolidatedWeights[sym] || {}), weight: w };
        } else if (typeof w === 'object' && w !== null) {
          consolidatedWeights[sym] = { ...(consolidatedWeights[sym] || {}), ...(w as any) };
        }
      }
    }

    if (severities && typeof severities === 'object') {
      for (const [sym, s] of Object.entries(severities)) {
        if (typeof s === 'number') {
          consolidatedWeights[sym] = { ...(consolidatedWeights[sym] || {}), severity: s };
        }
      }
    }

    if (frequencies && typeof frequencies === 'object') {
      for (const [sym, f] of Object.entries(frequencies)) {
        if (typeof f === 'number') {
          consolidatedWeights[sym] = { ...(consolidatedWeights[sym] || {}), frequency: f };
        }
      }
    }

    // Validate 90-108 range on all explicitly provided weights
    for (const [sym, cfg] of Object.entries(consolidatedWeights)) {
      if (cfg.severity !== undefined && (cfg.severity < 90 || cfg.severity > 108)) {
        return res.status(400).json({
          error: `Severity weight for "${sym}" (${cfg.severity}) is invalid. Custom severity weights must be within the 90-108 range.`
        });
      }
      if (cfg.frequency !== undefined && (cfg.frequency < 90 || cfg.frequency > 108)) {
        return res.status(400).json({
          error: `Frequency weight for "${sym}" (${cfg.frequency}) is invalid. Custom frequency weights must be within the 90-108 range.`
        });
      }
      if (cfg.weight !== undefined && (cfg.weight < 90 || cfg.weight > 108)) {
        return res.status(400).json({
          error: `Weight value for "${sym}" (${cfg.weight}) is invalid. Custom weights must be within the 90-108 range.`
        });
      }
    }

    // Also validate if symptoms are passed as objects: { symptom, severity, frequency, weight }
    for (const item of symptoms) {
      if (typeof item === 'object' && item !== null && item.symptom) {
        if (item.severity !== undefined && (item.severity < 90 || item.severity > 108)) {
          return res.status(400).json({
            error: `Severity weight for "${item.symptom}" (${item.severity}) is invalid. Must be in the 90-108 range.`
          });
        }
        if (item.frequency !== undefined && (item.frequency < 90 || item.frequency > 108)) {
          return res.status(400).json({
            error: `Frequency weight for "${item.symptom}" (${item.frequency}) is invalid. Must be in the 90-108 range.`
          });
        }
        if (item.weight !== undefined && (item.weight < 90 || item.weight > 108)) {
          return res.status(400).json({
            error: `Weight for "${item.symptom}" (${item.weight}) is invalid. Must be in the 90-108 range.`
          });
        }
      }
    }

    // Identify user if logged in
    const token = getAuthToken(req);
    const user = token ? db.getUserByToken(token) : null;

    // Run trained ML model with custom weights
    globalClassifier.updateDiseases(db.getDiseases());
    globalClassifier.updateSymptoms(db.getSymptoms());
    const predResult = globalClassifier.predict(symptoms, consolidatedWeights);

    // Extract clean symptom names for storage
    const symptomNames = symptoms.map((s: any) => (typeof s === 'string' ? s : s.symptom));

    // Prepare serialized weights for record audit
    const weightsToSave: Record<string, any> = {};
    if (predResult.weighted_symptoms) {
      for (const ws of predResult.weighted_symptoms) {
        weightsToSave[ws.symptom] = {
          severity: ws.severity,
          frequency: ws.frequency,
          effective_multiplier: ws.effective_multiplier,
        };
      }
    }

    // Save prediction to database
    const savedRecord = db.savePrediction({
      user_id: user ? user.id : 'anonymous',
      user_name: user ? user.name : 'Guest User',
      user_email: user ? user.email : 'guest@example.com',
      symptoms: symptomNames,
      symptom_weights: Object.keys(weightsToSave).length > 0 ? weightsToSave : undefined,
      predicted_disease: predResult.disease_name,
      confidence: predResult.confidence,
      disease_description: predResult.disease_info.description,
      precautions: predResult.disease_info.precautions,
      recommended_next_step:
        'Consider consulting a qualified healthcare professional, especially if symptoms are severe, persistent, or worsening.'
    });

    const responsePayload = {
      possible_disease: predResult.disease_name,
      confidence: predResult.confidence,
      matching_symptoms: predResult.matching_symptoms,
      all_selected_symptoms: symptomNames,
      weighted_symptoms: predResult.weighted_symptoms,
      disease_info: predResult.disease_info,
      general_precautions: predResult.disease_info.precautions,
      recommended_next_step:
        'Consider consulting a qualified healthcare professional, especially if symptoms are severe, persistent, or worsening.',
      alternative_conditions: predResult.alternative_candidates,
      disclaimer:
        'IMPORTANT: This AI result is generated using machine-learning pattern recognition for educational and informational purposes only. It is not a medical diagnosis or treatment plan. Always seek the advice of a qualified physician or healthcare provider with any questions you may have regarding a medical condition.',
      prediction_id: savedRecord.id,
      prediction_date: savedRecord.prediction_date
    };

    return res.json(responsePayload);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Model prediction failed.' });
  }
});

// GET /api/history
app.get('/api/history', (req: Request, res: Response) => {
  const token = getAuthToken(req);
  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Please log in to view prediction history.' });
  }

  const history = db.getUserPredictions(user.id);
  return res.json({ history });
});

// GET /api/history/:id
app.get('/api/history/:id', (req: Request, res: Response) => {
  const token = getAuthToken(req);
  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const record = db.getPredictionById(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Prediction record not found.' });
  }

  // Check access permission (user owns it or user is admin)
  if (record.user_id !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  return res.json({ record });
});

// ----------------- CATALOG DATA APIS -----------------

// GET /api/diseases
app.get('/api/diseases', (_req: Request, res: Response) => {
  return res.json({ diseases: db.getDiseases() });
});

// GET /api/diseases/:id
app.get('/api/diseases/:id', (req: Request, res: Response) => {
  const disease = db.getDiseaseById(req.params.id);
  if (!disease) {
    return res.status(404).json({ error: 'Disease information not found.' });
  }
  return res.json({ disease });
});

// GET /api/symptoms
app.get('/api/symptoms', (_req: Request, res: Response) => {
  return res.json({ symptoms: db.getSymptoms() });
});

// GET /api/ml/evaluation
app.get('/api/ml/evaluation', (_req: Request, res: Response) => {
  try {
    const metrics = runModelEvaluation();
    return res.json(metrics);
  } catch (err: any) {
    return res.status(500).json({ error: 'Evaluation failed: ' + err.message });
  }
});

// ----------------- ADMIN APIS -----------------

function requireAdmin(req: Request, res: Response, next: () => void) {
  const token = getAuthToken(req);
  const user = db.getUserByToken(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator rights required.' });
  }
  next();
}

// GET /api/admin/stats
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const stats = db.getAdminStats();
  return res.json(stats);
});

// GET /api/admin/users
app.get('/api/admin/users', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ users: db.getAllUsers() });
});

// DELETE /api/admin/users/:id
app.delete('/api/admin/users/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    db.deleteUser(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/admin/predictions
app.get('/api/admin/predictions', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ predictions: db.getAllPredictions() });
});

// POST /api/admin/diseases
app.post('/api/admin/diseases', requireAdmin, (req: Request, res: Response) => {
  try {
    const { disease_name, description, symptoms, precautions, when_to_seek_doctor, risk_level, category } = req.body;
    if (!disease_name || !description) {
      return res.status(400).json({ error: 'Disease name and description are required.' });
    }
    const created = db.addDisease({
      disease_name,
      description,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      precautions: Array.isArray(precautions) ? precautions : [precautions],
      when_to_seek_doctor: when_to_seek_doctor || '',
      risk_level: risk_level || 'moderate',
      category: category || 'General',
    });
    globalClassifier.updateDiseases(db.getDiseases());
    return res.status(201).json({ disease: created });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/admin/diseases/:id
app.put('/api/admin/diseases/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateDisease(req.params.id, req.body);
    globalClassifier.updateDiseases(db.getDiseases());
    return res.json({ disease: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/diseases/:id
app.delete('/api/admin/diseases/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    db.deleteDisease(req.params.id);
    globalClassifier.updateDiseases(db.getDiseases());
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/admin/symptoms
app.post('/api/admin/symptoms', requireAdmin, (req: Request, res: Response) => {
  try {
    const { symptom_name, category, description, severity_weight, frequency_weight } = req.body;
    if (!symptom_name) {
      return res.status(400).json({ error: 'Symptom name is required.' });
    }
    const created = db.addSymptom({
      symptom_name,
      category: category || 'General',
      description: description || '',
      severity_weight: severity_weight !== undefined ? Number(severity_weight) : undefined,
      frequency_weight: frequency_weight !== undefined ? Number(frequency_weight) : undefined,
    });
    globalClassifier.updateSymptoms(db.getSymptoms());
    return res.status(201).json({ symptom: created });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/admin/symptoms/:id
app.put('/api/admin/symptoms/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateSymptom(req.params.id, req.body);
    globalClassifier.updateSymptoms(db.getSymptoms());
    return res.json({ symptom: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/admin/symptoms/:id/weights (Assign custom severity or frequency weights in 90-108 range)
app.put('/api/admin/symptoms/:id/weights', requireAdmin, (req: Request, res: Response) => {
  try {
    const { severity_weight, frequency_weight } = req.body;
    const updated = db.updateSymptom(req.params.id, {
      severity_weight: severity_weight !== undefined ? Number(severity_weight) : undefined,
      frequency_weight: frequency_weight !== undefined ? Number(frequency_weight) : undefined,
    });
    globalClassifier.updateSymptoms(db.getSymptoms());
    return res.json({
      success: true,
      message: 'Custom severity/frequency weights updated successfully for 90-108 range.',
      symptom: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/symptoms/:id
app.delete('/api/admin/symptoms/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    db.deleteSymptom(req.params.id);
    globalClassifier.updateSymptoms(db.getSymptoms());
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/symptoms/weights/preview (Helper to preview 90-108 range normalization & multipliers)
app.post('/api/symptoms/weights/preview', (req: Request, res: Response) => {
  try {
    const { value, severity, frequency } = req.body;
    const target = value !== undefined ? value : severity !== undefined ? severity : frequency;
    if (target === undefined) {
      return res.status(400).json({ error: 'Please provide a numeric input value in the 90-108 range.' });
    }
    const calculation = normalize90to108Weight(target);
    return res.json({
      input_value: target,
      range: '90 - 108',
      normalized_score: calculation.normalized_score,
      effective_multiplier: calculation.multiplier,
      explanation: `Input ${target} in 90-108 range maps to ${(calculation.normalized_score * 100).toFixed(1)}% intensity with a ${calculation.multiplier}x multiplier in Naive Bayes inference.`
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ----------------- AI HEALTH EXPLAINER (GEMINI) -----------------

app.post('/api/ai/explain', async (req: Request, res: Response) => {
  try {
    const { query, condition, symptoms } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        response: `Medical Education Note: For ${condition || 'this symptom pattern'}, clinical literature highlights the importance of restful recovery, adequate oral fluid intake, and monitoring symptom progression. If experiencing high fever, chest pain, or breathing distress, professional medical evaluation is essential. (Educational guidance only).`
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a medical education AI assistant for the "AI Disease Prediction System".
Educational context:
- Predicted Condition: ${condition || 'Not specified'}
- Patient Symptoms: ${(symptoms || []).join(', ') || 'Not specified'}
- User Question: ${query || 'Please provide a clear educational explanation of this condition and precautions.'}

Instructions:
1. Explain the physiological mechanism simply for a layperson.
2. Outline 3 evidence-based home care steps.
3. Clearly specify "red flag" symptoms that require urgent medical attention.
4. Conclude with an unequivocal disclaimer that this is educational information and not a medical diagnosis. Keep under 180 words.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.json({ response: result.text });
  } catch (err: any) {
    console.error('Gemini error:', err);
    return res.json({
      response: `Educational Note: When managing suspected conditions, prioritize hydration, monitoring for warning signs, and consulting a licensed physician. Predictions are for educational purposes and not a substitute for diagnosis.`
    });
  }
});

// ----------------- VITE MIDDLEWARE SETUP -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Disease Prediction Server running on port ${PORT}`);
  });
}

startServer();
