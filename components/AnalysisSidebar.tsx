
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisTab, Language, Message } from '../types';
import { analyzeCode, chatWithTutor } from '../services/geminiService';
import { Loader2, Send, MessageSquare, BookOpen, Bug, Sparkles, TestTube, ChevronRight, Copy, Check } from 'lucide-react';

interface AnalysisSidebarProps {
  code: string;
  language: Language;
}

const AnalysisSidebar: React.FC<AnalysisSidebarProps> = ({ code, language }) => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>(AnalysisTab.EXPLAIN);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<AnalysisTab, string | null>>({
    [AnalysisTab.EXPLAIN]: null,
    [AnalysisTab.BUGS]: null,
    [AnalysisTab.OPTIMIZE]: null,
    [AnalysisTab.TESTS]: null,
    [AnalysisTab.RESOURCES]: null,
  });
  
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const runAnalysis = async (tab: AnalysisTab) => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeCode(code, language, tab);
      setResults(prev => ({ ...prev, [tab]: result || 'No analysis available.' }));
    } catch (error) {
      setResults(prev => ({ ...prev, [tab]: 'Error running analysis. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== AnalysisTab.EXPLAIN && !results[activeTab]) {
      // Don't auto-run for other tabs unless user switches, keeping it efficient
    }
  }, [activeTab]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || chatLoading) return;
    
    const userMsg: Message = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setChatLoading(true);

    try {
      const response = await chatWithTutor(code, language, chatMessages, userInput);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response || 'Sorry, I couldn\'t process that.' }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'There was an error connecting to the tutor.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: AnalysisTab.EXPLAIN, icon: BookOpen, label: 'Explanation' },
    { id: AnalysisTab.BUGS, icon: Bug, label: 'Bugs' },
    { id: AnalysisTab.OPTIMIZE, icon: Sparkles, label: 'Optimize' },
    { id: AnalysisTab.TESTS, icon: TestTube, label: 'Tests' },
    { id: AnalysisTab.RESOURCES, icon: BookOpen, label: 'Resources' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 w-full md:w-[500px] border-l border-slate-800">
      {/* Tab Header */}
      <div className="flex items-center space-x-1 p-2 bg-slate-950/50 border-b border-slate-800 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap
              ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Analysis Result Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-slate-400 text-sm">Gemini is studying your code...</p>
            </div>
          ) : results[activeTab] ? (
            <div className="prose prose-invert prose-sm max-w-none">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-indigo-400 font-semibold uppercase text-[10px] tracking-widest">{activeTab} Results</h3>
                    <button 
                        onClick={() => copyToClipboard(results[activeTab] || '')}
                        className="p-1 hover:bg-slate-800 rounded transition-colors"
                        title="Copy analysis"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-500" />}
                    </button>
                </div>
              <div className="whitespace-pre-wrap text-slate-300 font-sans leading-relaxed">
                {results[activeTab]}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed border-slate-800 rounded-xl">
              <Sparkles className="text-slate-700 mb-4" size={48} />
              <p className="text-slate-400 text-sm mb-4 italic">Request an analysis to see insights here.</p>
              <button
                onClick={() => runAnalysis(activeTab)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
              >
                Analyze Code
              </button>
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className="h-2/5 flex flex-col border-t border-slate-800 bg-slate-950/80">
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-400">
              <MessageSquare size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Tutor Chat</span>
            </div>
            {chatMessages.length > 0 && (
                 <button onClick={() => setChatMessages([])} className="text-[10px] text-slate-500 hover:text-slate-300">Clear chat</button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
            {chatMessages.length === 0 && (
              <p className="text-center text-slate-500 text-xs italic mt-4">Ask the tutor about specific parts of your code!</p>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
                <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tl-none border border-slate-700 px-3 py-2">
                        <Loader2 className="animate-spin text-slate-400" size={16} />
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <div className="relative">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a follow-up question..."
                className="w-full bg-slate-950 border border-slate-700 rounded-full pl-4 pr-12 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSidebar;
