import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ExamConfig, ExamType, Question } from "../types";

const getAiClient = () => {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing from environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

const buildSpeakerLabels = (config: ExamConfig) => {
  if (config.type === ExamType.MONOLOGUE) return ['Narrator'];
  return config.voiceProfiles.slice(0, config.numberOfSpeakers).map((p, idx) => p.label || `Speaker ${idx + 1}`);
};

export const generateExamScript = async (config: ExamConfig): Promise<string> => {
  const ai = getAiClient();
  const speakerLabels = buildSpeakerLabels(config);

  const speakerFormatting = speakerLabels.map((label) => `${label}:`).join(' ');
  const toneLine = `Use a ${config.speakerTone.toLowerCase()} tone with ${config.emotionalTone.toLowerCase()} emotion.`;
  const difficultyLine = `Vocabulary: ${config.vocabularyComplexity}. Sentence structure: ${config.sentenceComplexity}. Listening speed indicator: ${config.speedIndicator}.`;

  const prompt = `You are a professional ESL/EFL exam content creator.
  Create a ${config.type} script for ${config.level} learners about "${config.topic}".
  Purpose: ${config.purpose}. Target length: around ${config.wordCount} words.
  ${toneLine}
  ${difficultyLine}
  Include natural pause markers for ${config.pauseStyle.toLowerCase()} pacing and plan for approximately ${config.audioDuration} seconds of audio.
  Speakers: ${speakerLabels.length} (${speakerFormatting}).
  Return ONLY the script text with each turn labeled using the speaker names shown above. Avoid markdown or bullet lists.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Failed to generate text.";
  } catch (error) {
    console.error("Script Generation Error:", error);
    throw error;
  }
};

export const generateExamQuestions = async (script: string, config: ExamConfig): Promise<Question[]> => {
  const ai = getAiClient();

  const prompt = `Create 5 Multiple Choice Questions based on the following text.
  Audience level: ${config.level}.
  Include an answer key inline with the correct option marked as correctAnswer.
  Text:
  "${script}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              text: { type: Type.STRING, description: "The question text" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 4 possible answers"
              },
              correctAnswer: { type: Type.STRING, description: "The correct option text (must match one of the options)" }
            },
            required: ["id", "text", "options", "correctAnswer"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    return JSON.parse(jsonText) as Question[];
  } catch (error) {
    console.error("Question Generation Error:", error);
    throw error;
  }
};

export const generateExamAudio = async (
  script: string,
  config: ExamConfig
): Promise<string> => {
  const ai = getAiClient();

  const speakerLabels = buildSpeakerLabels(config);
  const isMultiSpeaker = config.type === ExamType.DIALOGUE || config.type === ExamType.CONVERSATION;

  let speechConfig: any;

  if (isMultiSpeaker) {
     speechConfig = {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: config.voiceProfiles.slice(0, config.numberOfSpeakers).map((profile, idx) => ({
            speaker: speakerLabels[idx] || `Speaker ${idx + 1}`,
            voiceConfig: { prebuiltVoiceConfig: { voiceName: profile.voice } }
          }))
        }
    };
  } else {
    speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: config.voiceProfiles[0]?.voice || 'Puck' },
        },
    };
  }

  const emotion = config.emotionalTone.toLowerCase();
  const speed = config.speechRate.toLowerCase();
  const pauseNotes = `Use ${config.pauseStyle.toLowerCase()} pauses between sentences and ${isMultiSpeaker ? 'between speakers' : ''}.`;
  const accentLine = config.voiceProfiles
    .slice(0, config.numberOfSpeakers)
    .map((p, idx) => `${speakerLabels[idx] || `Speaker ${idx + 1}`}: ${p.accent} accent, ${p.voiceStyle} style`)
    .join(' | ');

  const promptText = `Generate audio for the following script.
  Tone: ${config.speakerTone}. Emotion: ${emotion}. Speaking rate: ${speed}.
  Target duration around ${config.audioDuration} seconds.
  Accents & styles: ${accentLine}.
  ${pauseNotes}

  Script:
  ${script}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: speechConfig,
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned from API");
    }
    return base64Audio;
  } catch (error) {
    console.error("Audio Generation Error:", error);
    throw error;
  }
};
