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
  CONVERSATION = 'General Conversation',
  RADIO_TALK = 'Radio Talk',
  LECTURE = 'Lecture',
}

export enum ExamPurpose {
  SCHOOL_EXAM = 'School Exam',
  QUIZ = 'Quiz',
  PRACTICE = 'Listening Practice',
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

export enum EmotionalTone {
  NEUTRAL = 'Neutral',
  HAPPY = 'Happy',
  SAD = 'Sad',
  SURPRISED = 'Surprised',
  SERIOUS = 'Serious',
  PROFESSIONAL = 'Professional',
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

export enum ComplexityLevel {
  BASIC = 'Basic',
  MODERATE = 'Moderate',
  ADVANCED = 'Advanced',
}

export enum PauseStyle {
  NATURAL = 'Natural',
  BALANCED = 'Balanced',
  MINIMAL = 'Minimal',
}

export interface SpeakerProfile {
  id: number;
  label: string;
  voice: VoiceName;
  voiceStyle: VoiceStyle;
  accent: AccentOption;
  tone: SpeakerTone;
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
  numberOfSpeakers: number;
  purpose: ExamPurpose;
  speechRate: SpeechRate;
  emotionalTone: EmotionalTone;
  speakerTone: SpeakerTone;
  vocabularyComplexity: ComplexityLevel;
  sentenceComplexity: ComplexityLevel;
  speedIndicator: SpeechRate;
  pauseStyle: PauseStyle;
  audioDuration: number;
  includeQuestions: boolean;
  includeAnswerKey: boolean;
  voiceProfiles: SpeakerProfile[];
}

export interface GeneratedData {
  script: string;
  audioBuffer: AudioBuffer | null;
}