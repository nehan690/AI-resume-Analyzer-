
import React, { useState } from 'react';
import { FileText, Award, AlertCircle, Search, Lightbulb, UserPlus, CheckCircle, Copy, Loader2, Sparkles, Target, Briefcase } from 'lucide-react';
import { analyzeResume } from '../services/geminiService';
import { ResumeAnalysis, AnalysisState } from '../types';

const App: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisState>({
    loading: false,
    result: null,
    error: null,
  });
  const [copied, setCopied] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    
    setAnalysis({ loading: true, result: null, error: null });
    try {
      const result = await analyzeResume(resumeText, targetRole);
      setAnalysis({ loading: false, result, error: null });
    } catch (err: any) {
      setAnalysis({ loading: false, result: null, error: err.message || 'Failed to analyze resume' });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-md border border-white/20">
          <Sparkles className="text-yellow-400 w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          AI Resume <span className="text-indigo-300">Analyzer</span>
        </h1>
        <p className="text-indigo-100 text-lg opacity-80 max-w-2xl mx-auto">
          Optimize your resume for the modern job market. Get instant feedback on ATS compatibility, score, and actionable improvements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <div className="space-y-4">
              <label className="flex items-center text-sm font-semibold text-white/90">
                <Target className="w-4 h-4 mr-2 text-indigo-300" />
                Target Job Role (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center text-sm font-semibold text-white/90">
                <FileText className="w-4 h-4 mr-2 text-indigo-300" />
                Resume Content
              </label>
              <textarea
                placeholder="Paste your resume text here..."
                className="w-full h-80 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none font-sans leading-relaxed"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!resumeText.trim() || analysis.loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center space-x-2 group"
            >
              {analysis.loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Get Analysis</span>
                </>
              )}
            </button>
          </div>
          
          {analysis.error && (
            <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-red-100 text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              {analysis.error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          {analysis.loading ? (
            <div className="glass-card h-full flex flex-col items-center justify-center p-12 rounded-2xl text-center space-y-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 right-0 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Evaluating your potential...</h3>
                <p className="text-white/60">Our AI is cross-referencing industry standards and ATS algorithms.</p>
              </div>
            </div>
          ) : analysis.result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Summary Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Resume Score</p>
                    <div className="flex items-baseline space-x-1">
                      <span className={`text-4xl font-black ${getScoreColor(analysis.result.score)}`}>
                        {analysis.result.score}
                      </span>
                      <span className="text-white/40 text-sm">/ 10</span>
                    </div>
                  </div>
                  <Award className={`w-12 h-12 ${getScoreColor(analysis.result.score)} opacity-80`} />
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">ATS Match</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-black text-blue-400">
                        {analysis.result.atsCompatibility}%
                      </span>
                    </div>
                  </div>
                  <CheckCircle className="w-12 h-12 text-blue-400 opacity-80" />
                </div>
              </div>

              {/* Executive Summary */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-indigo-300" />
                  Executive Summary
                </h3>
                <p className="text-white/80 leading-relaxed italic">"{analysis.result.summary}"</p>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section icon={<Award className="text-green-400" />} title="Strengths" items={analysis.result.strengths} />
                <Section icon={<AlertCircle className="text-red-400" />} title="Weaknesses" items={analysis.result.weaknesses} />
                <Section icon={<Search className="text-blue-400" />} title="Keywords to Add" items={analysis.result.keywordSuggestions} canCopy copyToClipboard={copyToClipboard} copied={copied} />
                <Section icon={<UserPlus className="text-purple-400" />} title="Skills to Add" items={analysis.result.suggestedSkills} canCopy copyToClipboard={copyToClipboard} copied={copied} />
              </div>

              {/* Recommendations */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                  Improvement Plan
                </h3>
                <ul className="space-y-3">
                  {analysis.result.improvementRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start text-white/80 text-sm">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5 shrink-0 text-indigo-300 border border-white/10">
                        {i + 1}
                      </div>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center p-12 rounded-2xl text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-2">
                <Target className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-xl font-bold text-white/60">Ready for Analysis</h3>
              <p className="text-white/40 max-w-xs mx-auto text-sm leading-relaxed">
                Paste your resume on the left to uncover insights and optimize your application.
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-20 text-center text-white/40 text-xs">
        <p>&copy; {new Date().getFullYear()} AI Resume Analyzer. Powered by Gemini 3.0 Flash.</p>
      </footer>
    </div>
  );
};

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
  canCopy?: boolean;
  copyToClipboard?: (text: string, id: string) => void;
  copied?: string | null;
}

const Section: React.FC<SectionProps> = ({ icon, title, items, canCopy, copyToClipboard, copied }) => (
  <div className="glass-card p-5 rounded-2xl flex flex-col">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-bold text-white flex items-center text-sm uppercase tracking-wide">
        <span className="mr-2">{icon}</span>
        {title}
      </h4>
      {canCopy && copyToClipboard && (
        <button
          onClick={() => copyToClipboard(items.join(', '), title)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
          title="Copy to clipboard"
        >
          {copied === title ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-white/40 group-hover:text-white/80" />
          )}
        </button>
      )}
    </div>
    <ul className="space-y-2 flex-1">
      {items.map((item, i) => (
        <li key={i} className="text-white/70 text-sm flex items-start">
          <span className="mr-2 mt-1.5 w-1 h-1 rounded-full bg-indigo-400 shrink-0"></span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default App;
