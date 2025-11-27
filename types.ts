export enum DifficultyLevel {
  A1 = 'A1 (Beginner)',
  A2 = 'A2 (Elementary)',
  B1 = 'B1 (Intermediate)',
  B2 = 'B2 (Upper Intermediate)',
  C1 = 'C1 (Advanced)',
  C2 = 'C2 (Proficiency)',
}

export enum ExamType {
  MONOLOGUE = 'Monologue',
  DIALOGUE = 'Dialogue',
  CONVERSATION = 'Conversation',
}

export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
  // Aoede = 'Aoede', // Valid names from docs: Puck, Charon, Kore, Fenrir, Zephyr
}

export enum SpeechRate {
  SLOW = 'Slow',
  NORMAL = 'Normal',
  FAST = 'Fast',
}

export enum SpeakerTone {
  NEUTRAL = 'Neutral',
  ENTHUSIASTIC = 'Enthusiastic',
  FORMAL = 'Formal',
  FRIENDLY = 'Friendly',
  SERIOUS = 'Serious',
  CHILDLIKE = 'Child-like',
  TEACHER = 'Teacher tone',
}

export enum VoiceStyle {
  MALE = 'Male',
  FEMALE = 'Female',
  TEEN = 'Teen',
  CHILD = 'Child',
  ROBOTIC = 'Robotic',
}

export enum AccentOption {
  AMERICAN = 'American',
  BRITISH = 'British',
  AUSTRALIAN = 'Australian',
  INDIAN = 'Indian',
  CUSTOM = 'Custom',
}

export enum VocabularyComplexity {
  BASIC = 'Basic everyday words',
  MODERATE = 'Moderate academic and daily vocabulary',
  ADVANCED = 'Advanced/idiomatic vocabulary',
}

export enum SentenceStructure {
  SIMPLE = 'Short and simple sentences',
  MIXED = 'Mix of simple and compound sentences',
  COMPLEX = 'Complex and academic sentences',
}

export enum ExamPurpose {
  SCHOOL = 'School exam',
  QUIZ = 'Quiz',
  PRACTICE = 'Listening practice',
  CERT_PREP = 'Certification prep',
}

export enum PauseStyle {
  NATURAL = 'Natural pauses between sentences',
  SPEAKER = 'Pauses between speakers',
  NONE = 'No pauses',
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface ExamConfig {
  topic: string;
  level: DifficultyLevel;
  type: ExamType;
  wordCount: number;
  purpose: ExamPurpose;
  speakerCount: number;
  speakerTone: SpeakerTone;
  primaryVoice: VoiceName;
  secondaryVoice: VoiceName; // For dialogues
  speechRate: SpeechRate;
  voiceStylePrimary: VoiceStyle;
  voiceStyleSecondary: VoiceStyle;
  accent: AccentOption;
  customAccentNote?: string;
  vocabularyComplexity: VocabularyComplexity;
  sentenceStructure: SentenceStructure;
  speedIndicator: string;
  audioDuration: number;
  pauseStyle: PauseStyle;
  includeQuestions: boolean;
  includeAnswerKey: boolean;
}

export interface GeneratedData {
  script: string;
  audioBuffer: AudioBuffer | null;
}

export interface HistoryItem {
  id: string;
  createdAt: number;
  config: ExamConfig;
  script: string;
  audioUrl?: string;
  mp3Url?: string;
}
