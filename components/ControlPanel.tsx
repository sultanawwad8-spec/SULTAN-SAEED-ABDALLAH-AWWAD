import React, { useMemo } from 'react';
import {
  AccentOption,
  ComplexityLevel,
  DifficultyLevel,
  EmotionalTone,
  ExamConfig,
  ExamPurpose,
  ExamType,
  PauseStyle,
  SpeakerTone,
  SpeechRate,
  VoiceName,
  VoiceStyle,
} from '../types';

interface ControlPanelProps {
  config: ExamConfig;
  setConfig: React.Dispatch<React.SetStateAction<ExamConfig>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onGenerate, isGenerating }) => {
  const isMultiSpeaker = config.type === ExamType.DIALOGUE || config.type === ExamType.CONVERSATION;

  const handleChange = (field: keyof ExamConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpeakerCountChange = (value: number) => {
    const min = isMultiSpeaker ? 2 : 1;
    const safeValue = Math.max(min, Math.min(4, value));
    setConfig((prev) => {
      let voiceProfiles = [...prev.voiceProfiles];
      if (voiceProfiles.length < safeValue) {
        const needed = safeValue - voiceProfiles.length;
        const additions = Array.from({ length: needed }).map((_, idx) => ({
          id: Date.now() + idx,
          label: `Speaker ${voiceProfiles.length + idx + 1}`,
          voice: VoiceName.Zephyr,
          voiceStyle: VoiceStyle.MALE,
          accent: AccentOption.AMERICAN,
          tone: prev.speakerTone,
        }));
        voiceProfiles = [...voiceProfiles, ...additions];
      } else if (voiceProfiles.length > safeValue) {
        voiceProfiles = voiceProfiles.slice(0, safeValue);
      }
      return { ...prev, numberOfSpeakers: safeValue, voiceProfiles };
    });
  };

  const speakerProfiles = useMemo(() => {
    const min = isMultiSpeaker ? 2 : 1;
    const required = Math.max(min, config.numberOfSpeakers);
    const profiles = [...config.voiceProfiles];
    while (profiles.length < required) {
      profiles.push({
        id: Date.now() + profiles.length,
        label: `Speaker ${profiles.length + 1}`,
        voice: VoiceName.Zephyr,
        voiceStyle: VoiceStyle.MALE,
        accent: AccentOption.AMERICAN,
        tone: config.speakerTone,
      });
    }
    return profiles.slice(0, required);
  }, [config.voiceProfiles, config.numberOfSpeakers, config.speakerTone, isMultiSpeaker]);

  const updateProfile = (index: number, field: 'voice' | 'voiceStyle' | 'accent' | 'tone', value: string) => {
    setConfig((prev) => {
      const profiles = [...prev.voiceProfiles];
      if (!profiles[index]) return prev;
      profiles[index] = { ...profiles[index], [field]: value };
      return { ...prev, voiceProfiles: profiles };
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Configuration</h2>
        <p className="text-sm text-slate-500">Set parameters for the listening exam and audio</p>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar">
        {/* Section: Content Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Content Generation</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={config.topic}
                onChange={(e) => handleChange('topic', e.target.value)}
                placeholder="e.g. Climate Change, Ordering Coffee..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Word Count</label>
              <input
                type="number"
                min={80}
                max={600}
                value={config.wordCount}
                onChange={(e) => handleChange('wordCount', Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
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
            {isMultiSpeaker && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Speakers</label>
                <input
                  type="number"
                  min={2}
                  max={4}
                  value={config.numberOfSpeakers}
                  onChange={(e) => handleSpeakerCountChange(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Supports 2-4 speakers for dialogues and conversations</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Speaker Tone</label>
              <div className="relative">
                <select
                  value={config.speakerTone}
                  onChange={(e) => handleChange('speakerTone', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(SpeakerTone).map((tone) => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Narration Emotion</label>
              <div className="relative">
                <select
                  value={config.emotionalTone}
                  onChange={(e) => handleChange('emotionalTone', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(EmotionalTone).map((tone) => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vocabulary Complexity</label>
              <div className="relative">
                <select
                  value={config.vocabularyComplexity}
                  onChange={(e) => handleChange('vocabularyComplexity', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(ComplexityLevel).map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sentence Structure</label>
              <div className="relative">
                <select
                  value={config.sentenceComplexity}
                  onChange={(e) => handleChange('sentenceComplexity', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(ComplexityLevel).map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Listening Speed Indicator</label>
              <div className="relative">
                <select
                  value={config.speedIndicator}
                  onChange={(e) => handleChange('speedIndicator', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {Object.values(SpeechRate).map((rate) => (
                    <option key={rate} value={rate}>{rate}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100 my-1"></div>

        {/* Section: Audio Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audio Generation</h3>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Pause Style</label>
              <div className="relative">
                <select
                  value={config.pauseStyle}
                  onChange={(e) => handleChange('pauseStyle', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  {Object.values(PauseStyle).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ArrowIcon />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Duration (seconds)</label>
              <input
                type="number"
                min={30}
                max={600}
                value={config.audioDuration}
                onChange={(e) => handleChange('audioDuration', Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Include Questions & Answer Key</label>
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.includeQuestions}
                    onChange={(e) => handleChange('includeQuestions', e.target.checked)}
                  />
                  <span>Questions</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.includeAnswerKey}
                    onChange={(e) => handleChange('includeAnswerKey', e.target.checked)}
                  />
                  <span>Answer key</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Voices, styles, and accents</p>
            <div className="grid grid-cols-1 gap-3">
              {speakerProfiles.map((profile, index) => (
                <div key={profile.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-800">{profile.label}</p>
                    <span className="text-xs text-slate-500">{isMultiSpeaker ? 'Speaker' : 'Narrator'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Voice</label>
                      <div className="relative">
                        <select
                          value={profile.voice}
                          onChange={(e) => updateProfile(index, 'voice', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        >
                          {Object.values(VoiceName).map((voice) => (
                            <option key={voice} value={voice}>{voice}</option>
                          ))}
                        </select>
                        <ArrowIcon />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Voice Style</label>
                      <div className="relative">
                        <select
                          value={profile.voiceStyle}
                          onChange={(e) => updateProfile(index, 'voiceStyle', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        >
                          {Object.values(VoiceStyle).map((style) => (
                            <option key={style} value={style}>{style}</option>
                          ))}
                        </select>
                        <ArrowIcon />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Accent</label>
                      <div className="relative">
                        <select
                          value={profile.accent}
                          onChange={(e) => updateProfile(index, 'accent', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        >
                          {Object.values(AccentOption).map((accent) => (
                            <option key={accent} value={accent}>{accent}</option>
                          ))}
                        </select>
                        <ArrowIcon />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">Tone</label>
                      <div className="relative">
                        <select
                          value={profile.tone}
                          onChange={(e) => updateProfile(index, 'tone', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        >
                          {Object.values(SpeakerTone).map((tone) => (
                            <option key={tone} value={tone}>{tone}</option>
                          ))}
                        </select>
                        <ArrowIcon />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
