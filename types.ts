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
  primaryVoice: VoiceName;
  secondaryVoice: VoiceName; // For dialogues
  speechRate: SpeechRate;
  emotionalTone: EmotionalTone;
}

export interface GeneratedData {
  script: string;
  audioBuffer: AudioBuffer | null;
}