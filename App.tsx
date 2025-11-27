import React, { useEffect, useMemo, useState } from 'react';
import ControlPanel from './components/ControlPanel';
import { ScriptDisplay } from './components/ScriptDisplay';
import { QuestionsDisplay } from './components/QuestionsDisplay';
import AudioPlayer from './components/AudioPlayer';
import HistoryPanel from './components/HistoryPanel';
import {
  AccentOption,
  ComplexityLevel,
  DifficultyLevel,
  EmotionalTone,
  ExamConfig,
  ExamPurpose,
  ExamType,
  PauseStyle,
  Question,
  SpeakerTone,
  SpeechRate,
  VoiceName,
  VoiceStyle,
} from './types';
import { generateExamScript, generateExamAudio, generateExamQuestions } from './services/geminiService';
import {
  base64ToUint8Array,
  decodeAudioData,
  audioBufferToMp3,
  audioBufferToWav,
  downloadBlob,
} from './utils/audioUtils';
import { downloadDocxLike, downloadText } from './utils/exportUtils';

interface HistoryItem {
  id: number;
  timestamp: string;
  configSnapshot: ExamConfig;
  script: string;
  questions: Question[];
  audioBuffer: AudioBuffer | null;
}

const defaultVoiceProfiles = [
  {
    id: 1,
    label: 'Speaker 1',
    voice: VoiceName.Zephyr,
    voiceStyle: VoiceStyle.MALE,
    accent: AccentOption.AMERICAN,
    tone: SpeakerTone.NEUTRAL,
  },
  {
    id: 2,
    label: 'Speaker 2',
    voice: VoiceName.Puck,
    voiceStyle: VoiceStyle.FEMALE,
    accent: AccentOption.BRITISH,
    tone: SpeakerTone.FRIENDLY,
  },
];

const App: React.FC = () => {
  const [config, setConfig] = useState<ExamConfig>({
    topic: '',
    level: DifficultyLevel.B1,
    type: ExamType.MONOLOGUE,
    wordCount: 180,
    numberOfSpeakers: 1,
    purpose: ExamPurpose.SCHOOL_EXAM,
    speechRate: SpeechRate.NORMAL,
    emotionalTone: EmotionalTone.NEUTRAL,
    speakerTone: SpeakerTone.NEUTRAL,
    vocabularyComplexity: ComplexityLevel.MODERATE,
    sentenceComplexity: ComplexityLevel.MODERATE,
    speedIndicator: SpeechRate.NORMAL,
    pauseStyle: PauseStyle.NATURAL,
    audioDuration: 90,
    includeQuestions: true,
    includeAnswerKey: true,
    voiceProfiles: defaultVoiceProfiles,
  });

  const [activeTab, setActiveTab] = useState<'script' | 'questions'>('script');

  const [script, setScript] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (config.type === ExamType.MONOLOGUE && config.numberOfSpeakers !== 1) {
      setConfig((prev) => ({ ...prev, numberOfSpeakers: 1 }));
    }
  }, [config.type]);

  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    setError(null);
    setAudioBuffer(null);
    setQuestions([]);
    setActiveTab('script');
    try {
      const generatedScript = await generateExamScript(config);
      setScript(generatedScript);
    } catch (err: any) {
      setError(err.message || 'Failed to generate script');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!script || !config.includeQuestions) return;
    setIsGeneratingQuestions(true);
    setError(null);
    try {
      const generatedQuestions = await generateExamQuestions(script, config);
      setQuestions(generatedQuestions);
    } catch (err: any) {
      setError(err.message || 'Failed to generate questions');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!script) return;

    setIsGeneratingAudio(true);
    setError(null);
    try {
      const base64Audio = await generateExamAudio(script, config);
      const audioBytes = base64ToUint8Array(base64Audio);

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const decodedBuffer = await decodeAudioData(audioBytes, audioContext, 24000);

      setAudioBuffer(decodedBuffer);
      addHistory(decodedBuffer);
    } catch (err: any) {
      setError(err.message || 'Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const addHistory = (buffer: AudioBuffer) => {
    const entry: HistoryItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      configSnapshot: { ...config, voiceProfiles: config.voiceProfiles.map((p) => ({ ...p })) },
      script,
      questions,
      audioBuffer: buffer,
    };
    setHistory((prev) => [entry, ...prev].slice(0, 8));
  };

  const handleDownloadAudio = async (format: 'mp3' | 'wav') => {
    if (!audioBuffer) return;
    const blob = format === 'mp3' ? await audioBufferToMp3(audioBuffer) : audioBufferToWav(audioBuffer);
    downloadBlob(blob, `listening-exam.${format}`);
  };

  const handleDownloadScriptTxt = () => {
    if (!script) return;
    downloadText(script, 'listening-exam.txt');
  };

  const handleDownloadDocx = () => {
    if (!script) return;
    downloadDocxLike(script, config.includeQuestions ? questions : [], config.includeAnswerKey);
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setConfig(item.configSnapshot);
    setScript(item.script);
    setQuestions(item.questions);
    setAudioBuffer(item.audioBuffer);
    setActiveTab('script');
  };

  const menus = useMemo(
    () => [
      'Generate New Audio',
      'Choose Type',
      'Set Parameters',
      'Preview Script',
      'Generate Audio',
      'Download Section',
      'History of Generated Audios',
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="mb-4 flex-none">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Listening Exam Generator</h1>
            <p className="text-sm text-slate-500">Monologues, dialogues, and conversations with instant TTS</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {menus.map((item) => (
            <span
              key={item}
              className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600 shadow-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 h-full overflow-hidden min-h-0">
        {/* Left Column: Controls */}
        <div className="w-full lg:w-1/3 flex-none overflow-y-auto space-y-4">
          <ControlPanel
            config={config}
            setConfig={setConfig}
            onGenerate={handleGenerateScript}
            isGenerating={isGeneratingScript}
          />
          <HistoryPanel history={history} onLoad={handleLoadHistory} />
        </div>

        {/* Right Column: Output */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4 overflow-hidden min-h-0 h-full">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3 animate-pulse">
              <svg className="w-5 h-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('script')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'script' ? 'text-indigo-600 bg-white' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
              >
                Exam Script
                {activeTab === 'script' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'questions' ? 'text-indigo-600 bg-white' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
              >
                MC Questions {questions.length > 0 && `(${questions.length})`}
                {activeTab === 'questions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
              </button>
            </div>

            <div className="flex-1 overflow-hidden min-h-0">
              <div className={`h-full ${activeTab === 'script' ? 'block' : 'hidden'}`}>
                <ScriptDisplay
                  script={script}
                  setScript={setScript}
                  onGenerateAudio={handleGenerateAudio}
                  isGeneratingAudio={isGeneratingAudio}
                  hasAudio={!!audioBuffer}
                  onDownloadMp3={() => handleDownloadAudio('mp3')}
                  onDownloadWav={() => handleDownloadAudio('wav')}
                  onDownloadTxt={handleDownloadScriptTxt}
                  onDownloadDocx={handleDownloadDocx}
                />
              </div>
              <div className={`h-full ${activeTab === 'questions' ? 'block' : 'hidden'}`}>
                <QuestionsDisplay
                  questions={questions}
                  onGenerate={handleGenerateQuestions}
                  isGenerating={isGeneratingQuestions}
                  hasScript={!!script}
                  showAnswers={config.includeAnswerKey}
                />
              </div>
            </div>
          </div>

          {audioBuffer && (
            <div className="flex-none">
              <AudioPlayer audioBuffer={audioBuffer} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
