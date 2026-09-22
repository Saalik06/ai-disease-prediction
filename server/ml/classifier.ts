import { Disease, Symptom, SymptomWeightDetail } from '../../src/types/index.js';
import { INITIAL_DISEASES, INITIAL_SYMPTOMS, TRAINING_DATASET, TrainingSample } from './dataset.js';

export interface SymptomWeightConfig {
  severity?: number; // 90 - 108
  frequency?: number; // 90 - 108
  weight?: number; // 90 - 108
}

export interface MLPredictionResult {
  disease_name: string;
  confidence: number;
  matching_symptoms: string[];
  disease_info: Disease;
  alternative_candidates: Array<{ disease_name: string; confidence: number }>;
  weighted_symptoms?: SymptomWeightDetail[];
}

/**
 * Normalizes input values in the 90-108 range into a [0.0, 1.0] scale
 * and calculates the effective feature multiplier [1.00x to 2.50x].
 *
 * 90  -> Baseline severity/frequency (0.0 normalized, 1.00x multiplier)
 * 99  -> Moderate severity/frequency (0.5 normalized, 1.75x multiplier)
 * 108 -> Maximum severity/frequency (1.0 normalized, 2.50x multiplier)
 */
export function normalize90to108Weight(val: number): {
  raw_value: number;
  normalized_score: number;
  multiplier: number;
} {
  const num = Number(val);
  if (isNaN(num)) {
    throw new Error(`Invalid numeric value provided for symptom weight: ${val}`);
  }
  if (num < 90 || num > 108) {
    throw new Error(
      `Custom severity or frequency weight (${num}) is outside the permitted 90-108 range. Please specify a value between 90 and 108.`
    );
  }

  const normalized_score = Math.round(((num - 90) / 18) * 1000) / 1000;
  const multiplier = Math.round((1.0 + normalized_score * 1.5) * 100) / 100;

  return {
    raw_value: num,
    normalized_score,
    multiplier,
  };
}

export class DiseaseClassifier {
  private vocabulary: string[] = [];
  private classes: string[] = [];
  private classPriors: Map<string, number> = new Map();
  private featureLikelihoods: Map<string, Map<string, number>> = new Map(); // class -> (symptom -> prob)
  private diseasesMap: Map<string, Disease> = new Map();
  private symptomsMap: Map<string, Symptom> = new Map();
  private isTrained: boolean = false;

  constructor(diseases: Disease[] = INITIAL_DISEASES, symptoms: Symptom[] = INITIAL_SYMPTOMS) {
    this.updateDiseases(diseases);
    this.updateSymptoms(symptoms);
    this.train(TRAINING_DATASET);
  }

  public updateDiseases(diseases: Disease[]) {
    this.diseasesMap.clear();
    for (const d of diseases) {
      this.diseasesMap.set(d.disease_name.toLowerCase(), d);
    }
  }

  public updateSymptoms(symptoms: Symptom[]) {
    this.symptomsMap.clear();
    for (const s of symptoms) {
      this.symptomsMap.set(s.symptom_name.toLowerCase(), s);
    }
  }

  /**
   * Train the Naive Bayes Classifier using binary feature vectors and Laplace smoothing.
   */
  public train(samples: TrainingSample[]) {
    // 1. Build symptom vocabulary
    const vocabSet = new Set<string>();
    for (const s of INITIAL_SYMPTOMS) {
      vocabSet.add(s.symptom_name.trim().toLowerCase());
    }
    for (const sample of samples) {
      for (const sym of sample.symptoms) {
        vocabSet.add(sym.trim().toLowerCase());
      }
    }
    this.vocabulary = Array.from(vocabSet);

    // 2. Identify classes
    const classCountMap = new Map<string, number>();
    for (const sample of samples) {
      const cls = sample.disease;
      classCountMap.set(cls, (classCountMap.get(cls) || 0) + 1);
    }
    this.classes = Array.from(classCountMap.keys());
    const totalSamples = samples.length;

    // 3. Compute class priors P(C)
    this.classPriors.clear();
    for (const cls of this.classes) {
      const count = classCountMap.get(cls) || 0;
      this.classPriors.set(cls, count / totalSamples);
    }

    // 4. Compute feature conditional probabilities P(x_j = 1 | C) with Laplace smoothing
    this.featureLikelihoods.clear();
    for (const cls of this.classes) {
      const classSamples = samples.filter((s) => s.disease === cls);
      const N_c = classSamples.length;
      const likelihoodMap = new Map<string, number>();

      for (const symptom of this.vocabulary) {
        let countWithSymptom = 0;
        for (const cs of classSamples) {
          if (cs.symptoms.some((s) => s.trim().toLowerCase() === symptom)) {
            countWithSymptom++;
          }
        }
        // Laplace smoothing with alpha = 1
        const prob = (countWithSymptom + 1) / (N_c + 2);
        likelihoodMap.set(symptom, prob);
      }
      this.featureLikelihoods.set(cls, likelihoodMap);
    }

    this.isTrained = true;
  }

  /**
   * Encodes a list of symptoms into a feature vector. If custom weights are supplied,
   * assigns the corresponding calculated effective multipliers.
   */
  public encodeSymptoms(
    inputSymptoms: string[],
    customWeights?: Record<string, number | SymptomWeightConfig>
  ): Record<string, number> {
    const vector: Record<string, number> = {};
    const lowerInputs = new Set(inputSymptoms.map((s) => s.trim().toLowerCase()));

    for (const feature of this.vocabulary) {
      if (!lowerInputs.has(feature)) {
        vector[feature] = 0;
        continue;
      }

      // Check if custom weight exists in 90-108 range
      let mult = 1.0;
      if (customWeights) {
        for (const [key, val] of Object.entries(customWeights)) {
          if (key.trim().toLowerCase() === feature) {
            const rawVal = typeof val === 'number' ? val : (val.severity || val.frequency || val.weight);
            if (rawVal !== undefined) {
              const norm = normalize90to108Weight(rawVal);
              mult = norm.multiplier;
            }
            break;
          }
        }
      }
      vector[feature] = mult;
    }
    return vector;
  }

  /**
   * Predict the most likely disease given the selected symptoms,
   * with full support for custom severity or frequency weights in the 90-108 range.
   */
  public predict(
    selectedSymptoms: Array<string | { symptom: string; severity?: number; frequency?: number; weight?: number }>,
    customWeights?: Record<string, number | SymptomWeightConfig>
  ): MLPredictionResult {
    if (!this.isTrained) {
      this.train(TRAINING_DATASET);
    }

    if (!selectedSymptoms || selectedSymptoms.length === 0) {
      throw new Error('Please select at least one symptom to run the AI prediction.');
    }

    // Parse symptom names and weights
    const cleanSymptoms: string[] = [];
    const weightedDetails: SymptomWeightDetail[] = [];
    const weightMultipliersMap = new Map<string, number>();

    for (const item of selectedSymptoms) {
      let symName: string;
      let inlineSeverity: number | undefined;
      let inlineFrequency: number | undefined;
      let inlineWeight: number | undefined;

      if (typeof item === 'string') {
        symName = item.trim();
      } else {
        symName = item.symptom.trim();
        inlineSeverity = item.severity;
        inlineFrequency = item.frequency;
        inlineWeight = item.weight;
      }

      cleanSymptoms.push(symName);
      const lowerName = symName.toLowerCase();

      // Check explicit customWeights passed as secondary argument
      let extConfig: number | SymptomWeightConfig | undefined;
      if (customWeights) {
        for (const [k, v] of Object.entries(customWeights)) {
          if (k.trim().toLowerCase() === lowerName) {
            extConfig = v;
            break;
          }
        }
      }

      // Check catalog default weights from database if available
      const catalogItem = this.symptomsMap.get(lowerName);

      const targetSeverity =
        inlineSeverity !== undefined
          ? inlineSeverity
          : typeof extConfig === 'object' && extConfig?.severity !== undefined
          ? extConfig.severity
          : catalogItem?.severity_weight;

      const targetFrequency =
        inlineFrequency !== undefined
          ? inlineFrequency
          : typeof extConfig === 'object' && extConfig?.frequency !== undefined
          ? extConfig.frequency
          : catalogItem?.frequency_weight;

      const targetWeight =
        inlineWeight !== undefined
          ? inlineWeight
          : typeof extConfig === 'number'
          ? extConfig
          : typeof extConfig === 'object' && extConfig?.weight !== undefined
          ? extConfig.weight
          : undefined;

      // If any 90-108 weight was specified or present
      if (targetSeverity !== undefined || targetFrequency !== undefined || targetWeight !== undefined) {
        let normalizedScore = 0;
        let effectiveMultiplier = 1.0;
        let rawInput = targetWeight || targetSeverity || targetFrequency;

        if (targetSeverity !== undefined && targetFrequency !== undefined) {
          const sNorm = normalize90to108Weight(targetSeverity);
          const fNorm = normalize90to108Weight(targetFrequency);
          normalizedScore = Math.round((0.6 * sNorm.normalized_score + 0.4 * fNorm.normalized_score) * 1000) / 1000;
          effectiveMultiplier = Math.round((1.0 + normalizedScore * 1.5) * 100) / 100;
        } else if (targetSeverity !== undefined) {
          const sNorm = normalize90to108Weight(targetSeverity);
          normalizedScore = sNorm.normalized_score;
          effectiveMultiplier = sNorm.multiplier;
        } else if (targetFrequency !== undefined) {
          const fNorm = normalize90to108Weight(targetFrequency);
          normalizedScore = fNorm.normalized_score;
          effectiveMultiplier = fNorm.multiplier;
        } else if (targetWeight !== undefined) {
          const wNorm = normalize90to108Weight(targetWeight);
          normalizedScore = wNorm.normalized_score;
          effectiveMultiplier = wNorm.multiplier;
        }

        weightMultipliersMap.set(lowerName, effectiveMultiplier);
        weightedDetails.push({
          symptom: symName,
          severity: targetSeverity,
          frequency: targetFrequency,
          raw_input_value: rawInput,
          normalized_score: normalizedScore,
          effective_multiplier: effectiveMultiplier,
        });
      } else {
        weightMultipliersMap.set(lowerName, 1.0);
      }
    }

    const inputSet = new Set(cleanSymptoms.map((s) => s.toLowerCase()));
    const scores: Array<{ disease: string; logScore: number; matchCount: number }> = [];

    for (const cls of this.classes) {
      const prior = this.classPriors.get(cls) || 1e-6;
      let logProb = Math.log(prior);
      const likelihoods = this.featureLikelihoods.get(cls);

      let matchCount = 0;

      // Bernoulli Naive Bayes formulation with weighted log-likelihoods
      for (const feature of this.vocabulary) {
        const hasFeature = inputSet.has(feature);
        const p1 = likelihoods?.get(feature) || 0.05;

        if (hasFeature) {
          const multiplier = weightMultipliersMap.get(feature) || 1.0;
          // Apply severity/frequency weight multiplier to feature likelihood
          logProb += Math.log(p1) * multiplier;

          const diseaseObj = this.diseasesMap.get(cls.toLowerCase());
          if (diseaseObj?.symptoms.some((s) => s.trim().toLowerCase() === feature)) {
            matchCount++;
          }
        } else {
          logProb += Math.log(1 - p1);
        }
      }

      // Add weighted canonical overlap bonus
      const diseaseObj = this.diseasesMap.get(cls.toLowerCase());
      if (diseaseObj) {
        let weightedCanonicalBonus = 0;
        for (const sym of diseaseObj.symptoms) {
          const symLower = sym.trim().toLowerCase();
          if (inputSet.has(symLower)) {
            const mult = weightMultipliersMap.get(symLower) || 1.0;
            weightedCanonicalBonus += mult * 0.4;
          }
        }
        logProb += weightedCanonicalBonus;
      }

      scores.push({ disease: cls, logScore: logProb, matchCount });
    }

    // Sort descending by log score
    scores.sort((a, b) => b.logScore - a.logScore);

    // Apply Softmax with temperature for calibrated probabilities
    const maxLog = scores[0]?.logScore || 0;
    const temperature = 1.2;
    const expScores = scores.map((s) => ({
      disease: s.disease,
      exp: Math.exp((s.logScore - maxLog) / temperature),
    }));
    const sumExp = expScores.reduce((acc, curr) => acc + curr.exp, 0);

    const candidates = expScores.map((s) => {
      const rawProb = (s.exp / sumExp) * 100;
      return {
        disease_name: s.disease,
        confidence: Math.round(rawProb * 10) / 10,
      };
    });

    const topCandidate = candidates[0];
    const diseaseName = topCandidate.disease_name;

    // Retrieve or create fallback disease information
    let diseaseInfo = this.diseasesMap.get(diseaseName.toLowerCase());
    if (!diseaseInfo) {
      diseaseInfo = INITIAL_DISEASES.find(
        (d) => d.disease_name.toLowerCase() === diseaseName.toLowerCase()
      ) || {
        id: 'dis_gen_' + Date.now(),
        disease_name: diseaseName,
        description: 'A clinical condition matching the entered symptom profile.',
        symptoms: cleanSymptoms,
        precautions: [
          'Hydrate well and monitor vital signs.',
          'Get adequate rest in a calm environment.',
          'Seek medical advice if symptoms persist or deteriorate.',
        ],
        when_to_seek_doctor: 'Consult a physician if symptoms last more than a few days or worsen.',
        risk_level: 'moderate',
        category: 'General',
      };
    }

    // Determine matching symptoms
    const matchingSymptoms = cleanSymptoms.filter((s) =>
      diseaseInfo?.symptoms.some((ds) => ds.trim().toLowerCase() === s.trim().toLowerCase())
    );

    let calibratedConfidence = topCandidate.confidence;
    if (matchingSymptoms.length === 1 && cleanSymptoms.length > 2) {
      calibratedConfidence = Math.min(calibratedConfidence, 65);
    } else if (matchingSymptoms.length >= 3) {
      calibratedConfidence = Math.max(calibratedConfidence, 78);
    }
    calibratedConfidence = Math.min(Math.max(calibratedConfidence, 52), 94);

    return {
      disease_name: diseaseName,
      confidence: calibratedConfidence,
      matching_symptoms: matchingSymptoms.length > 0 ? matchingSymptoms : cleanSymptoms.slice(0, 3),
      disease_info: diseaseInfo,
      alternative_candidates: candidates.slice(1, 4),
      weighted_symptoms: weightedDetails.length > 0 ? weightedDetails : undefined,
    };
  }

  public getVocabulary(): string[] {
    return this.vocabulary;
  }
}

export const globalClassifier = new DiseaseClassifier();
