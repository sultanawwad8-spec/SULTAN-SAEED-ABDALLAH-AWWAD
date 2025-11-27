import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import { ScriptDisplay } from './components/ScriptDisplay';
import { QuestionsDisplay } from './components/QuestionsDisplay';
import AudioPlayer from './components/AudioPlayer';
import {
  DifficultyLevel,
  ExamConfig,
  ExamType,
  VoiceName,
  SpeechRate,
  SpeakerTone,
  Question,
  ExamPurpose,
  VocabularyComplexity,
  SentenceStructure,
  PauseStyle,
  HistoryItem,
  VoiceStyle,
  AccentOption,
} from './types';
import { generateExamScript, generateExamAudio, generateExamQuestions } from './services/geminiService';
import { base64ToUint8Array, decodeAudioData } from './utils/audioUtils';
import HistoryList from './components/HistoryList';

const defaultConfig: ExamConfig = {
  topic: '',
  level: DifficultyLevel.B1,
  type: ExamType.MONOLOGUE,
  wordCount: 200,
  purpose: ExamPurpose.SCHOOL,
  speakerCount: 2,
  speakerTone: SpeakerTone.NEUTRAL,
  primaryVoice: VoiceName.Zephyr,
  secondaryVoice: VoiceName.Puck,
  speechRate: SpeechRate.NORMAL,
  voiceStylePrimary: VoiceStyle.FEMALE,
  voiceStyleSecondary: VoiceStyle.MALE,
  accent: AccentOption.AMERICAN,
  vocabularyComplexity: VocabularyComplexity.MODERATE,
  sentenceStructure: SentenceStructure.MIXED,
  speedIndicator: 'Normal pace suitable for listening exams',
  audioDuration: 90,
  pauseStyle: PauseStyle.NATURAL,
  includeQuestions: true,
  includeAnswerKey: true,
};

const App: React.FC = () => {
  const [config, setConfig] = useState<ExamConfig>(defaultConfig);

  const [activeTab, setActiveTab] = useState<'script' | 'questions'>('script');

  const [script, setScript] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const cached = localStorage.getItem('listening-exam-history');
    if (!cached) return [];
    try {
      return JSON.parse(cached) as HistoryItem[];
    } catch (e) {
      console.warn('Failed to parse history', e);
      return [];
    }
  });

  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    setError(null);
    setAudioBuffer(null); // Clear previous audio
    setQuestions([]); // Clear previous questions
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
    if (!script) return;
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

      const timestamp = Date.now();
      const newHistoryItem: HistoryItem = {
        id: `${timestamp}`,
        createdAt: timestamp,
        config,
        script,
      };

      // Store minimal history (audio URLs generated in AudioPlayer when downloaded)
      const nextHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(nextHistory);
      localStorage.setItem('listening-exam-history', JSON.stringify(nextHistory));
    } catch (err: any) {
      setError(err.message || 'Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    setScript('');
    setQuestions([]);
    setAudioBuffer(null);
    setActiveTab('script');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="mb-6 flex-none">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Listening Exam Generator</h1>
            <p className="text-sm text-slate-500">Powered by Gemini 2.5</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
          {["Generate New Audio", "Choose Type", "Set Parameters", "Preview Script", "Generate Audio", "Download Section", "History"].map((step) => (
            <div key={step} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="font-semibold">{step}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 h-full overflow-hidden min-h-0">
        
        {/* Left Column: Controls */}
        <div className="w-full lg:w-1/3 flex-none overflow-y-auto">
          <ControlPanel
            config={config}
            setConfig={setConfig}
            onGenerate={handleGenerateScript}
            isGenerating={isGeneratingScript}
            onReset={handleReset}
          />
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
                  />
               </div>
               <div className={`h-full ${activeTab === 'questions' ? 'block' : 'hidden'}`}>
                  <QuestionsDisplay
                    questions={questions}
                    onGenerate={handleGenerateQuestions}
                    isGenerating={isGeneratingQuestions}
                    hasScript={!!script}
                    showAnswers={config.includeAnswerKey}
                    enabled={config.includeQuestions}
                  />
               </div>
             </div>
          </div>

          {audioBuffer && (
            <div className="flex-none">
              <AudioPlayer
                audioBuffer={audioBuffer}
                config={config}
                script={script}
                onSave={(record) => {
                  if (history.length === 0) return;
                  const updatedHistory = history.map((item, idx) => idx === 0 ? { ...item, ...record } : item);
                  setHistory(updatedHistory);
                  localStorage.setItem('listening-exam-history', JSON.stringify(updatedHistory));
                }}
              />
            </div>
          )}

          <div className="flex-none bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <HistoryList history={history} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;