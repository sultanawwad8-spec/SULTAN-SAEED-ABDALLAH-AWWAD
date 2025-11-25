import React, { useMemo } from 'react';

interface ScriptDisplayProps {
  script: string;
  setScript: (script: string) => void;
  onGenerateAudio: () => void;
  isGeneratingAudio: boolean;
  hasAudio: boolean;
}

export const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ 
  script, 
  setScript, 
  onGenerateAudio, 
  isGeneratingAudio,
  hasAudio 
}) => {

  const wordCount = useMemo(() => {
    if (!script || !script.trim()) return 0;
    return script.trim().split(/\s+/).length;
  }, [script]);

  return (
    <div className="p-6 h-full flex flex-col bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">Exam Script</h2>
            {wordCount > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                {wordCount} words
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">Edit the text before generating audio</p>
        </div>
        
        {script && (
          <button
            onClick={onGenerateAudio}
            disabled={isGeneratingAudio}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm
              ${isGeneratingAudio
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
          >
            {isGeneratingAudio ? 'Synthesizing...' : hasAudio ? 'Regenerate Audio' : 'Generate Audio'}
          </button>
        )}
      </div>

      <div className="flex-1 relative">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm leading-relaxed text-slate-700"
          placeholder="Generated exam script will appear here..."
        />
        {!script && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
              </svg>
              <p className="text-slate-500 font-medium">Ready to generate</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};