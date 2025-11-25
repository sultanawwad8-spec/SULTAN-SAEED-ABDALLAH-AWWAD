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
  let prompt = `You are a professional ESL/EFL exam content creator. 
  Create a **${config.type}** script for **${config.level}** level students.
  The topic is: "${config.topic}".
  
  The output must be a pure script.
  `;

  if (config.type === ExamType.DIALOGUE || config.type === ExamType.CONVERSATION) {
    prompt += `
    This is a conversation between two people.
    Use "Speaker A" and "Speaker B" as the labels.
    Ensure the language difficulty strictly matches ${config.level}.
    Keep it between 150-300 words.
    Return ONLY the script text, no markdown formatting like **bold** or titles.
    `;
  } else {
    prompt += `
    This is a single-speaker text.
    Ensure the language difficulty strictly matches ${config.level}.
    Keep it between 150-300 words.
    Return ONLY the script text, no markdown formatting like **bold** or titles.
    `;
  }

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
              speaker: 'Speaker A',
              voiceConfig: { prebuiltVoiceConfig: { voiceName: config.primaryVoice } }
            },
            {
              speaker: 'Speaker B',
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

  // Construct directions for the model to control emotion and speed
  const emotion = config.emotionalTone.toLowerCase();
  const speed = config.speechRate.toLowerCase();
  
  let promptText = '';

  if (isMultiSpeaker) {
    promptText = `
    Generate audio for the following conversation.
    
    Directions:
    - The emotional tone should be ${emotion}.
    - The speaking rate should be ${speed}.
    
    Script:
    ${script}
    `;
  } else {
    // For single speaker, we wrap it in a direct instruction
    promptText = `Read the following text with a ${emotion} tone and at a ${speed} pace:\n\n${script}`;
  }

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