
import React from 'react';
import { Language } from '../types';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language: Language;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, language }) => {
  return (
    <div className="relative flex-1 flex flex-col h-full bg-slate-950 border-r border-slate-800">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Editor ({language})</span>
        <span className="text-xs text-slate-500">{code.length} characters</span>
      </div>
      <div className="flex-1 relative overflow-hidden group">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="absolute inset-0 w-full h-full bg-transparent text-slate-300 p-4 font-mono text-sm resize-none focus:outline-none z-10 selection:bg-indigo-500/30"
          spellCheck={false}
          placeholder="Paste or type your code here..."
        />
        {/* Simple background line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-900/30 border-r border-slate-800 flex flex-col items-center pt-4 select-none pointer-events-none">
            {code.split('\n').map((_, i) => (
                <span key={i} className="text-[10px] leading-[1.5rem] text-slate-600 font-mono">{i + 1}</span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
