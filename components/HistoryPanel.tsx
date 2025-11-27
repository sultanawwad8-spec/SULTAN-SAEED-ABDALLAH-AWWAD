import React from 'react';
import { ExamConfig, Question } from '../types';

interface HistoryItem {
  id: number;
  timestamp: string;
  configSnapshot: ExamConfig;
  script: string;
  questions: Question[];
  audioBuffer: AudioBuffer | null;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">History of Generated Audios</h3>
          <p className="text-xs text-slate-500">Reload previous scripts and audio mixes</p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{history.length}</span>
      </div>

      {history.length === 0 ? (
        <div className="text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center">
          No audio history yet.
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {history.map((item) => (
            <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">{item.configSnapshot.topic || 'Untitled topic'}</p>
                <p className="text-xs text-slate-500">
                  {item.configSnapshot.type} · {new Date(item.timestamp).toLocaleTimeString()} · {item.script.split(/\s+/).length} words
                </p>
              </div>
              <button
                onClick={() => onLoad(item)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Load
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
