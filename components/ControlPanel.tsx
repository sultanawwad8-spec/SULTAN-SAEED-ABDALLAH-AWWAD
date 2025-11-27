import React from 'react';
import {
  DifficultyLevel,
  ExamConfig,
  ExamType,
  VoiceName,
  SpeechRate,
  SpeakerTone,
  ExamPurpose,
  VocabularyComplexity,
  SentenceStructure,
  PauseStyle,
  VoiceStyle,
  AccentOption,
} from '../types';

interface ControlPanelProps {
  config: ExamConfig;
  setConfig: React.Dispatch<React.SetStateAction<ExamConfig>>;
  onGenerate: () => void;
  isGenerating: boolean;
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onGenerate, isGenerating, onReset }) => {
  
  const isMultiSpeaker = config.type === ExamType.DIALOGUE || config.type === ExamType.CONVERSATION;

  // Generic handler for selects
  const handleChange = (field: keyof ExamConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Configuration</h2>
          <p className="text-sm text-slate-500">Set your exam parameters and export rules</p>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
        >
          New Audio
        </button>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar">
        {/* Section: Content Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Content Generation</h3>
          
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
            <input
              type="text"
              value={config.topic}
              onChange={(e) => handleChange('topic', e.target.value)}
              placeholder="e.g. Climate Change, Ordering Coffee..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Level Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty Level</label>
            <div className="relative">
              <select
                value={config.level}
                onChange={(e) => handleChange('level', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {Object.values(DifficultyLevel).map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <ArrowIcon />
            </div>
          </div>

          {/* Type Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type</label>
            <div className="relative">
              <select
                value={config.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {Object.values(ExamType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ArrowIcon />
            </div>
          </div>

          {/* Word Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Word Count</label>
              <input
                type="number"
                value={config.wordCount}
                onChange={(e) => handleChange('wordCount', Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                min={80}
                max={400}
              />
            </div>

            {isMultiSpeaker && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Speakers</label>
                <div className="relative">
                  <select
                    value={config.speakerCount}
                    onChange={(e) => handleChange('speakerCount', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {[2,3,4].map((count) => (
                      <option key={count} value={count}>{count} speakers</option>
                    ))}
                  </select>
                  <ArrowIcon />
                </div>
              </div>
            )}
          </div>

          {/* Purpose */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
              <div className="relative">
                <select
                  value={config.purpose}
                  onChange={(e) => handleChange('purpose', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(ExamPurpose).map((purpose) => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
              <div className="relative">
                <select
                  value={config.speakerTone}
                  onChange={(e) => handleChange('speakerTone', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(SpeakerTone).map((tone) => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>
          </div>

          {/* Difficulty Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vocabulary</label>
              <div className="relative">
                <select
                  value={config.vocabularyComplexity}
                  onChange={(e) => handleChange('vocabularyComplexity', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  {Object.values(VocabularyComplexity).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sentence Structure</label>
              <div className="relative">
                <select
                  value={config.sentenceStructure}
                  onChange={(e) => handleChange('sentenceStructure', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  {Object.values(SentenceStructure).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Speed Indicator</label>
              <input
                type="text"
                value={config.speedIndicator}
                onChange={(e) => handleChange('speedIndicator', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                placeholder="e.g. slower for A1, faster for C1"
              />
            </div>
          </div>

          {/* Question Controls */}
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.includeQuestions}
                onChange={(e) => handleChange('includeQuestions', e.target.checked)}
              />
              Include comprehension questions
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.includeAnswerKey}
                onChange={(e) => handleChange('includeAnswerKey', e.target.checked)}
                disabled={!config.includeQuestions}
              />
              Include answer key
            </label>
          </div>
        </div>

        <div className="h-px bg-slate-100 my-1"></div>

        {/* Section: Audio Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audio Settings</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Speech Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Speed</label>
              <div className="relative">
                <select
                  value={config.speechRate}
                  onChange={(e) => handleChange('speechRate', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  {Object.values(SpeechRate).map((rate) => (
                    <option key={rate} value={rate}>{rate}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pause Guidance</label>
              <div className="text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg px-3 py-2">
                Pauses will follow the selected pause style during synthesis.
              </div>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isMultiSpeaker ? 'Speaker A Voice' : 'Voice Model'}
              </label>
              <div className="relative">
                <select
                  value={config.primaryVoice}
                  onChange={(e) => handleChange('primaryVoice', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(VoiceName).map((voice) => (
                    <option key={voice} value={voice}>{voice}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>

            {isMultiSpeaker && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Speaker B Voice</label>
                <div className="relative">
                  <select
                    value={config.secondaryVoice}
                    onChange={(e) => handleChange('secondaryVoice', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {Object.values(VoiceName).map((voice) => (
                      <option key={voice} value={voice}>{voice}</option>
                    ))}
                  </select>
                  <ArrowIcon />
                </div>
              </div>
            )}
          </div>

          {/* Voice styling */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Voice Style A</label>
              <div className="relative">
                <select
                  value={config.voiceStylePrimary}
                  onChange={(e) => handleChange('voiceStylePrimary', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  {Object.values(VoiceStyle).map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>

            {isMultiSpeaker && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Voice Style B</label>
                <div className="relative">
                  <select
                    value={config.voiceStyleSecondary}
                    onChange={(e) => handleChange('voiceStyleSecondary', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  >
                    {Object.values(VoiceStyle).map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                  <ArrowIcon />
                </div>
              </div>
            )}
          </div>

          {/* Accent and pause controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Accent</label>
              <div className="relative">
                <select
                  value={config.accent}
                  onChange={(e) => handleChange('accent', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  {Object.values(AccentOption).map((accent) => (
                    <option key={accent} value={accent}>{accent}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
              {config.accent === AccentOption.CUSTOM && (
                <input
                  type="text"
                  value={config.customAccentNote || ''}
                  onChange={(e) => handleChange('customAccentNote', e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  placeholder="Describe accent preference"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pause Style</label>
              <div className="relative">
                <select
                  value={config.pauseStyle}
                  onChange={(e) => handleChange('pauseStyle', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  {Object.values(PauseStyle).map((pause) => (
                    <option key={pause} value={pause}>{pause}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>
          </div>

          {/* Audio duration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Audio Duration (seconds)</label>
            <input
              type="number"
              min={30}
              max={600}
              value={config.audioDuration}
              onChange={(e) => handleChange('audioDuration', Number(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">Used as guidance for TTS pacing and script size.</p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !config.topic}
          className={`w-full py-3 px-6 rounded-xl text-white font-semibold shadow-md transition-all transform active:scale-[0.98]
            ${isGenerating || !config.topic 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Script...
            </span>
          ) : (
            "Generate Exam"
          )}
        </button>
      </div>
    </div>
  );
};

const ArrowIcon = () => (
  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
  </div>
);

export default ControlPanel;