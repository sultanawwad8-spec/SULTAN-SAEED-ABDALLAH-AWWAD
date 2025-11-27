import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ExamConfig, ExamType, Question } from "../types";

// Helper to get fresh client with current key (safe for re-renders)
const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing from environment variables");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateExamScript = async (config: ExamConfig): Promise<string> => {
  const ai = getAiClient();
  
  // Construct a prompt optimized for the 2.5 flash text model
  const pauseGuidance = config.pauseStyle === 'Natural pauses between sentences'
    ? 'Add short natural pauses between sentences.'
    : config.pauseStyle === 'Pauses between speakers'
      ? 'Ensure a brief pause whenever the speaker changes.'
      : 'Do not add pauses.';

  const speakerLabel = config.type === ExamType.MONOLOGUE
    ? 'Speaker 1'
    : `Speaker 1, Speaker 2${config.speakerCount > 2 ? ', Speaker 3/4 as needed' : ''}`;

  const difficultyLine = `Difficulty: ${config.level}. Purpose: ${config.purpose}. Vocabulary: ${config.vocabularyComplexity}. Sentence structure: ${config.sentenceStructure}. Target pace: ${config.speedIndicator}. Target words: ${config.wordCount}.`;

  const prompt = `You are a professional ESL/EFL listening-exam author.
Generate a ${config.type} script with ${speakerLabel} labels on each line.
Topic: "${config.topic}".
${difficultyLine}
Speaker tone: ${config.speakerTone}.
${pauseGuidance}
If ${config.type !== ExamType.MONOLOGUE ? 'multi-speaker, keep turns balanced among all speakers.' : 'single-speaker, keep flow continuous.'}
Keep the script tightly aligned to the requested word count and avoid markdown formatting.
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
  Target Audience Level: ${config.level}.
  Include an explicit answer key if requested: ${config.includeAnswerKey}.
  Text:
  "${script}"
  `;

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

  const isMultiSpeaker = config.type === ExamType.DIALOGUE || config.type === ExamType.CONVERSATION;

  let speechConfig;

  if (isMultiSpeaker) {
     speechConfig = {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'Speaker 1',
              voiceConfig: { prebuiltVoiceConfig: { voiceName: config.primaryVoice } }
            },
            {
              speaker: 'Speaker 2',
              voiceConfig: { prebuiltVoiceConfig: { voiceName: config.secondaryVoice } }
            }
          ]
        }
    };
  } else {
    speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: config.primaryVoice },
        },
    };
  }

  const speed = config.speechRate.toLowerCase();
  const accent = config.customAccentNote ? `${config.accent} (${config.customAccentNote})` : config.accent;

  const promptText = `
  Read the script as a ${config.voiceStylePrimary} voice${isMultiSpeaker ? ` for Speaker 1 and ${config.voiceStyleSecondary} for Speaker 2` : ''}.
  Accent preference: ${accent}.
  Insert ${config.pauseStyle.toLowerCase()}.
  Aim for audio close to ${config.audioDuration} seconds.
  Speaking rate: ${speed}.
  Keep speaker labels intact.

  Script:
  ${script}
  `;

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