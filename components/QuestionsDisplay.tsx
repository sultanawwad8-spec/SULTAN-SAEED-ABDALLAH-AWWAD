import React from 'react';
import { Question } from '../types';

interface QuestionsDisplayProps {
  questions: Question[];
  onGenerate: () => void;
  isGenerating: boolean;
  hasScript: boolean;
}

export const QuestionsDisplay: React.FC<QuestionsDisplayProps> = ({ 
  questions, 
  onGenerate, 
  isGenerating,
  hasScript
}) => {
  
  if (!hasScript) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p className="text-lg font-medium">No script available</p>
        <p className="text-sm">Generate a script first to create questions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-b-2xl rounded-tr-2xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Comprehension Questions</h2>
          <p className="text-sm text-slate-500">Multiple choice questions based on the script</p>
        </div>
        
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm
            ${isGenerating
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'
            }`}
        >
          {isGenerating ? 'Generating...' : questions.length > 0 ? 'Regenerate Questions' : 'Generate Questions'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
             <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>
             <p>No questions generated yet</p>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {questions.map((q, index) => (
              <div key={q.id || index} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-semibold text-slate-800 mb-3 flex gap-2">
                  <span className="text-indigo-600">{index + 1}.</span>
                  {q.text}
                </p>
                <div className="space-y-2 pl-6">
                  {q.options.map((option, i) => {
                    const isCorrect = option === q.correctAnswer;
                    return (
                      <div 
                        key={i} 
                        className={`flex items-center gap-3 p-2 rounded-lg border text-sm transition-colors
                          ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-slate-200 text-slate-600'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center
                          ${isCorrect ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}>
                          {isCorrect && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                        {option}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};