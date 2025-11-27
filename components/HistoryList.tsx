import React from 'react';
import { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
}

const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">History of Generated Audios</h3>
          <p className="text-sm text-slate-500">Recent exports (latest 10). Audio links require prior download.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-sm text-slate-500">No history yet. Generate and export an audio file to capture it here.</div>
      ) : (
        <div className="divide-y divide-slate-200">
          {history.map((item) => (
            <div key={item.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.config.topic || 'Untitled topic'}</p>
                <p className="text-xs text-slate-500">
                  {item.config.type} • {item.config.level} • {new Date(item.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2">{item.script.slice(0, 120)}...</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {item.audioUrl ? (
                  <a
                    href={item.audioUrl}
                    download
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                  >
                    WAV/Original
                  </a>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">Export audio to store</span>
                )}
                {item.mp3Url && (
                  <a
                    href={item.mp3Url}
                    download
                    className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  >
                    MP3/WebM
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;
