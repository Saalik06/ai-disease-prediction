export type UserRole = 'patient' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  role: UserRole;
  created_at: string;
}

export interface Disease {
  id: string;
  disease_name: string;
  description: string;
  symptoms: string[];
  precautions: string[];
  when_to_seek_doctor: string;
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  category: string;
}

export interface Symptom {
  id: string;
  symptom_name: string;
  category: string;
  description?: string;
  severity_weight?: number; // Custom severity weight (range: 90 - 108)
  frequency_weight?: number; // Custom frequency weight (range: 90 - 108)
}

export interface SymptomWeightDetail {
  symptom: string;
  severity?: number; // Expected range: 90 - 108
  frequency?: number; // Expected range: 90 - 108
  raw_input_value?: number; // 90 - 108 input value
  normalized_score: number; // 0.0 (baseline 90) to 1.0 (peak 108)
  effective_multiplier: number; // Calibrated feature weight multiplier in Bayes
}

export interface PredictionRecord {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  symptoms: string[];
  symptom_weights?: Record<string, { severity?: number; frequency?: number; effective_multiplier?: number }>;
  predicted_disease: string;
  confidence: number;
  prediction_date: string;
  disease_description?: string;
  precautions?: string[];
  recommended_next_step?: string;
}

export interface PredictionResponse {
  possible_disease: string;
  confidence: number;
  matching_symptoms: string[];
  all_selected_symptoms: string[];
  weighted_symptoms?: SymptomWeightDetail[];
  disease_info: Disease;
  general_precautions: string[];
  recommended_next_step: string;
  alternative_conditions: Array<{
    disease_name: string;
    confidence: number;
  }>;
  disclaimer: string;
  prediction_id?: string;
  prediction_date?: string;
}

export interface AdminStats {
  total_users: number;
  total_predictions: number;
  total_diseases: number;
  total_symptoms: number;
  most_predicted_disease?: string;
  disease_distribution?: Record<string, number>;
  most_frequently_predicted?: Array<{
    disease: string;
    count: number;
    percentage: number;
  }>;
  recent_predictions: PredictionRecord[];
  daily_predictions?: Array<{
    date: string;
    count: number;
  }>;
}

export interface MLEvaluationData {
  active_model: {
    model_name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  comparison_models: Array<{
    model_name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    inference_time_ms: number;
  }>;
  confusion_matrix: {
    classes: string[];
    matrix: number[][];
  };
  dataset_statistics: {
    total_samples: number;
    train_samples: number;
    test_samples: number;
    features_count: number;
    classes_count: number;
  };
}

export type MLEvaluationMetrics = MLEvaluationData;

export interface HealthcareProvider {
  id: string;
  name: string;
  type: string;
  contact: string;
  phone?: string;
  hours: string;
  address: string;
  specialties: string[];
  distance?: string;
  isEmergency?: boolean;
}

export type HealthcareFacility = HealthcareProvider;
