import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  FileSpreadsheet,
  LineChart,
  Microscope,
  Network,
  Sparkles,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { MLEvaluationData } from '../types/index.js';

export const MLEvaluationPage: React.FC = () => {
  const [metricsData, setMetricsData] = useState<MLEvaluationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getMLMetrics();
        setMetricsData(data);
      } catch (err) {
        console.error('Failed to load ML metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Title */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
          <Brain className="w-3.5 h-3.5 text-blue-600" />
          <span>Machine Learning Research & Validation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Model Evaluation & Performance Metrics
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
          Empirical assessment of the disease prediction classifier comparing Bernoulli Naive Bayes, Decision Trees, Logistic Regression, and Random Forest on held-out test splits.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading benchmark metrics...</div>
      ) : metricsData ? (
        <div className="space-y-8">
          {/* Active Model Benchmark Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Primary Model
              </span>
              <div className="text-xl font-extrabold text-slate-900">
                {metricsData.active_model.model_name}
              </div>
              <p className="text-[11px] text-blue-700 font-medium">Laplace Smoothing (α=1.0)</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Test Accuracy
              </span>
              <div className="text-3xl font-extrabold text-blue-700">
                {(metricsData.active_model.accuracy * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400">On stratified holdout split</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Macro Precision & Recall
              </span>
              <div className="text-xl font-extrabold text-slate-900">
                {(metricsData.active_model.precision * 100).toFixed(1)}% / {(metricsData.active_model.recall * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400">Balanced multi-class average</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Harmonic F1-Score
              </span>
              <div className="text-3xl font-extrabold text-slate-900">
                {(metricsData.active_model.f1_score * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400">Precision-Recall harmonic mean</p>
            </div>
          </div>

          {/* Model Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Classifier Comparison Benchmark Table
                </h2>
                <p className="text-xs text-slate-500">
                  Comparative performance against standard supervised machine learning algorithms
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-600">
                80/20 Train-Test Split
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Algorithm Model</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Precision</th>
                    <th className="py-3 px-4">Recall</th>
                    <th className="py-3 px-4">F1-Score</th>
                    <th className="py-3 px-4">Inference Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metricsData.comparison_models.map((mod: any, idx: number) => {
                    const isWinner = mod.model_name.includes('Naive Bayes');
                    return (
                      <tr
                        key={idx}
                        className={isWinner ? 'bg-blue-50/40 font-semibold' : 'hover:bg-slate-50/70'}
                      >
                        <td className="py-3 px-4 flex items-center gap-2">
                          {isWinner && <Zap className="w-3.5 h-3.5 text-blue-600" />}
                          <span className={isWinner ? 'text-blue-950 font-bold' : 'text-slate-800'}>
                            {mod.model_name}
                          </span>
                          {isWinner && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-1 font-bold">
                              Production Choice
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {(mod.accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-slate-600">{(mod.precision * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4 text-slate-600">{(mod.recall * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4 text-slate-600">{(mod.f1_score * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{mod.inference_time_ms} ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mathematical Formulations & Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span>Feature Vector Formulation</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Symptoms are represented as binary sparse indicators:
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-blue-300 font-mono text-xs space-y-1">
                <div>X = [x₁, x₂, ..., xₘ]  where  xⱼ ∈ {'{0, 1}'}</div>
                <div className="text-slate-500">// 1 if symptom reported present, 0 otherwise</div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Total vocabulary size: <strong>30 symptom dimensions</strong> across {metricsData.dataset_statistics.classes_count} distinct clinical target classes.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Bayesian Posterior Formulation</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The posterior probability of disease class $C_k$ given feature vector $X$ is computed via Bayes' theorem:
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-blue-300 font-mono text-xs space-y-1">
                <div>P(C_k | X) ∝ P(C_k) · ∏ P(xⱼ | C_k)</div>
                <div className="text-slate-500">// Laplace add-one smoothing prevents zero-frequency</div>
                <div className="text-blue-400">P(xⱼ=1 | C_k) = (count + 1) / (N_k + 2)</div>
              </div>
            </div>
          </div>

          {/* Confusion Matrix Viewer */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Sample Multi-Class Confusion Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Comparison between Ground Truth clinical diagnoses and Model Predictions
                </p>
              </div>
              <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-200">
                High Diagonal Density = Superior Precision
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="py-2 px-3 text-left">Actual Condition ↓ / Predicted →</th>
                    {metricsData.confusion_matrix.classes.map((cls: string) => (
                      <th key={cls} className="py-2 px-2 font-semibold text-slate-700">
                        {cls}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metricsData.confusion_matrix.matrix.map((row: number[], rowIdx: number) => {
                    const rowClass = metricsData.confusion_matrix.classes[rowIdx];
                    return (
                      <tr key={rowClass}>
                        <td className="py-2.5 px-3 text-left font-bold text-slate-900">
                          {rowClass}
                        </td>
                        {row.map((val: number, colIdx: number) => {
                          const isDiagonal = rowIdx === colIdx;
                          return (
                            <td
                              key={colIdx}
                              className={`py-2 px-2 font-mono text-xs ${
                                isDiagonal
                                  ? 'bg-blue-100/70 font-bold text-blue-900'
                                  : val > 0
                                  ? 'bg-rose-50 font-medium text-rose-700'
                                  : 'text-slate-300'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
