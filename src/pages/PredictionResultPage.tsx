import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  HeartPulse,
  Info,
  MapPin,
  MessageSquare,
  Printer,
  RefreshCw,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import React, { useState } from 'react';
import { api } from '../services/api.js';
import { PredictionResponse } from '../types/index.js';

interface PredictionResultPageProps {
  prediction: PredictionResponse;
  onNewPrediction: () => void;
  onNavigate: (page: string, params?: any) => void;
}

export const PredictionResultPage: React.FC<PredictionResultPageProps> = ({
  prediction,
  onNewPrediction,
  onNavigate,
}) => {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    try {
      const resp = await api.askAIExplainer(
        prediction.possible_disease,
        prediction.all_selected_symptoms,
        aiQuestion
      );
      setAiResponse(resp);
    } catch {
      setAiResponse('Unable to retrieve AI educational note at this time.');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `AI Disease Prediction Result: Possible Condition: ${prediction.possible_disease} (${prediction.confidence}% confidence). Evaluated symptoms: ${prediction.all_selected_symptoms.join(', ')}. For educational purposes only.`
    );
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNewPrediction}
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1.5"
        >
          <Stethoscope className="w-4 h-4" />
          ← Start Another Prediction
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            {showCopied ? 'Summary Copied!' : 'Share Summary'}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* The Requested Structured AI PREDICTION RESULT CARD */}
      <div className="bg-white rounded-2xl border-2 border-blue-600/30 shadow-xl overflow-hidden print:border-none print:shadow-none">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-700 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-slate-950 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-blue-200">
                AI PREDICTION RESULT
              </h2>
              <p className="text-[11px] text-blue-100/80 font-normal">
                Machine Learning Classification Output
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-blue-800/80 px-2.5 py-1 rounded border border-blue-500/40">
            Status: Assessment Complete
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Condition Header */}
          <div className="border-b border-slate-200/80 pb-6 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Possible Condition:
            </span>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {prediction.possible_disease}
              </h1>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl">
                <span className="text-xs text-slate-600 font-medium">Model Confidence:</span>
                <span className="text-base font-extrabold text-blue-800">
                  {prediction.confidence}%
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Computed based on the specific set of symptoms you entered.
            </p>
          </div>

          {/* Symptoms List Checked */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Matching Evaluated Symptoms:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {prediction.all_selected_symptoms.map((sym) => {
                const isMatching = prediction.matching_symptoms.includes(sym);
                return (
                  <div
                    key={sym}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                      isMatching
                        ? 'bg-blue-50/80 border-blue-300 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${isMatching ? 'text-blue-600' : 'text-slate-400'}`}
                    />
                    <span>{sym}</span>
                    {isMatching && (
                      <span className="text-[10px] ml-auto text-blue-700 font-semibold uppercase">
                        Primary Key
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom Severity & Frequency Weights Breakdown (90-108 Scale) */}
            {prediction.weighted_symptoms && prediction.weighted_symptoms.length > 0 && (
              <div className="mt-3 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-700" />
                    Custom Clinical Weights Applied (90-108 Range):
                  </span>
                  <span className="text-[11px] font-medium text-blue-700">
                    Posterior Log-Likelihood Multipliers
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {prediction.weighted_symptoms.map((ws) => (
                    <div
                      key={ws.symptom}
                      className="p-2 bg-white rounded-lg border border-blue-100 shadow-2xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{ws.symptom}</span>
                        <div className="text-[11px] text-slate-500">
                          {ws.severity !== undefined && `Severity: ${ws.severity}`}
                          {ws.severity !== undefined && ws.frequency !== undefined && ' | '}
                          {ws.frequency !== undefined && `Freq: ${ws.frequency}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-blue-600 text-white font-mono font-bold text-[11px]">
                          {ws.effective_multiplier}x
                        </span>
                        <div className="text-[10px] text-blue-800">
                          {Math.round(ws.normalized_score * 100)}% intensity
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* About this condition */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              About This Condition:
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {prediction.disease_info.description}
            </p>
            {prediction.disease_info.category && (
              <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Category:</span> {prediction.disease_info.category}
                <span className="mx-1">•</span>
                <span className="font-semibold text-slate-700">Severity Tier:</span>{' '}
                <span className="capitalize font-bold text-amber-700">{prediction.disease_info.risk_level}</span>
              </div>
            )}
          </div>

          {/* General Precautions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              General Precautions:
            </h3>
            <ul className="space-y-2">
              {prediction.general_precautions.map((prec, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                  <span>{prec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Next Step Box */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-blue-700" />
              Recommended Next Step:
            </h3>
            <p className="text-xs sm:text-sm text-blue-950 font-medium leading-relaxed">
              {prediction.recommended_next_step}
            </p>
            {prediction.disease_info.when_to_seek_doctor && (
              <p className="text-xs text-blue-800 pt-1 font-normal">
                <strong>When to seek immediate attention:</strong> {prediction.disease_info.when_to_seek_doctor}
              </p>
            )}
          </div>

          {/* Alternative Differential Candidates */}
          {prediction.alternative_conditions && prediction.alternative_conditions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Alternative Potential Conditions (Differential Classification):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {prediction.alternative_conditions.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                      {alt.disease_name}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {alt.confidence}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prominent Educational Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block uppercase tracking-wider font-bold text-amber-950 mb-0.5">
                IMPORTANT MEDICAL NOTICE:
              </strong>
              {prediction.disclaimer}
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => onNavigate('find-care')}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <MapPin className="w-4 h-4" />
            Locate Healthcare Professionals
          </button>

          <button
            onClick={onNewPrediction}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Start Another Prediction
          </button>
        </div>
      </div>

      {/* Auxiliary AI Educational Explainer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Have questions about this condition? (AI Health Educator)
            </h3>
            <p className="text-xs text-slate-500">
              Ask clarifying questions about recovery, lifestyle precautions, or red flag symptoms.
            </p>
          </div>
        </div>

        <form onSubmit={handleAskAI} className="flex gap-2">
          <input
            type="text"
            placeholder={`e.g. What dietary precautions are recommended for ${prediction.possible_disease}?`}
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuestion.trim()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Ask AI
          </button>
        </form>

        {aiResponse && (
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-slate-700 leading-relaxed space-y-2">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Educational Assistant Note:
            </div>
            <p className="whitespace-pre-line">{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};
