
import { GoogleGenAI, GenerateContentResponse, Part, Modality } from "@google/genai";
import { Message } from '../types';

// Initialize the client. The API key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ChatResponse {
  text: string;
  sources?: { title: string; uri: string }[];
}

/**
 * Sends a message to a specific agent with multimodal capabilities (Images + Search).
 * Uses 'thinkingBudget' to enable Gemini 3.0 Thinking for complex tasks.
 */
export const chatWithAgent = async (
  agentName: string,
  agentInstruction: string,
  history: Message[],
  newMessage: string,
  base64Image?: string,
  thinkingBudget?: number
): Promise<ChatResponse> => {
  try {
    // Select Model based on complexity
    const model = (thinkingBudget && thinkingBudget > 0) 
      ? 'gemini-3-pro-preview' 
      : 'gemini-3-flash-preview';

    // Construct the chat history for context
    // CRITICAL UPDATE: If the user message has a translatedText, use that for the context.
    // This allows the Agent (who might only speak English) to "understand" the User (who spoke Chinese),
    // because the translation layer happened before reaching the Agent.
    const conversationContext = history.map(m => {
        const content = m.role === 'user' ? (m.translatedText || m.text) : m.text;
        return `${m.role === 'user' ? 'User' : agentName}: ${content} ${m.image ? '[User attached an image]' : ''}`;
    }).join('\n');

    const parts: Part[] = [];

    // 1. Add Image if present
    if (base64Image) {
      const cleanBase64 = base64Image.split(',')[1] || base64Image;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    // 2. Add Text Prompt
    const thoughtInstruction = thinkingBudget && thinkingBudget > 0 
      ? "You have a thinking budget. Use it to analyze the request deeply, cross-reference multiple data points from Google Search, and structure a comprehensive report."
      : "Keep responses mobile-friendly.";

    parts.push({
      text: `
      PREVIOUS CONTEXT:
      ${conversationContext}

      CURRENT REQUEST:
      User: ${newMessage}
      
      INSTRUCTIONS:
      You are ${agentName}. ${agentInstruction}
      ${thoughtInstruction}
      If the user provides an image, analyze it professionally based on your role.
      Use Google Search to provide up-to-date information.
      `
    });

    // 3. Configure Tools (Google Search + Thinking)
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: thinkingBudget ? { thinkingBudget: thinkingBudget } : undefined,
      }
    });

    // 4. Extract Text
    const text = response.text || "I'm analyzing the data but couldn't generate a text response.";

    // 5. Extract Sources (Grounding)
    let sources: { title: string; uri: string }[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      sources = response.candidates[0].groundingMetadata.groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title)
        .map((web: any) => ({ title: web.title, uri: web.uri }));
    }

    return { text, sources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Connection to the neural link failed. Please check your network." };
  }
};

/**
 * Checks if translation is actually needed based on content analysis.
 * Returns false if:
 * 1. Text is empty
 * 2. Text is only emojis/punctuation/numbers
 * 3. Text language roughly matches target language (simple heuristic)
 */
export const isTranslationNeeded = (text: string, targetLanguage: string): boolean => {
    if (!text || text.trim().length === 0) return false;

    // 1. Check for Sticker/Emoji/Symbol only content
    const isOnlySymbols = /^[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s\d.,!?;:()\[\]"']+$/u.test(text);
    if (isOnlySymbols) return false;

    // 2. Simple Language Heuristic
    const hasChineseChar = /[\u4e00-\u9fa5]/.test(text);
    
    // If target is Chinese, but text already has Chinese -> No need to translate (likely)
    if (targetLanguage.toLowerCase().includes('chinese') && hasChineseChar) return false;

    // If target is English, but text has NO Chinese characters (and is likely English/Latin) -> No need to translate
    // (This is a simplified check, ideally we'd use a language detection library or API)
    if (targetLanguage.toLowerCase().includes('english') && !hasChineseChar) return false;

    return true;
};

/**
 * Translates text between languages using Gemini.
 * @param text Source text
 * @param targetLanguage Target language name (e.g. "English", "Chinese", "Japanese")
 */
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    // Early exit check
    if (!isTranslationNeeded(text, targetLanguage)) {
        return text;
    }

    try {
        const prompt = `Translate the following text to ${targetLanguage}. Only output the translated text, nothing else. Text: "${text}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text?.trim() || text;
    } catch (e) {
        console.error("Translation failed", e);
        return text;
    }
};

/**
 * Generates Speech from Text using Gemini 2.5 Flash TTS.
 */
export const generateSpeech = async (text: string, voiceName: string = 'Puck'): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
             return base64Audio;
        }
        return null;
    } catch (e) {
        console.error("TTS failed", e);
        return null;
    }
};

/**
 * Helper to decode base64 audio and play it using Web Audio API
 */
export const playBase64Audio = async (base64: string) => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    } catch (e) {
        console.error("Audio playback error", e);
    }
}


/**
 * Analyzes a URL or text input to "Import" an agent from another platform.
 * Uses Google Search to find details about the agent if a URL is provided.
 */
export const importAgentFromLink = async (platform: string, input: string): Promise<{
  name: string, 
  tagline: string, 
  description: string,
  systemInstruction: string,
  category: string,
  personality: string,
  suggestedPrice: number
}> => {
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        The user wants to import an AI Agent from the platform "${platform}".
        The user provided this input (URL or Name): "${input}".

        Task:
        1. Use Google Search to find out what this agent is if it's a known agent or URL.
        2. If it's a generic description, generate a persona based on it.
        3. Create a profile for this agent.

        Return JSON with these exact keys:
        - name (string)
        - tagline (max 10 words, catchy)
        - description (max 40 words, selling the agent)
        - systemInstruction (The prompt that makes this agent work. Be creative and specific based on the persona.)
        - category (One of: 'Creative', 'Coding', 'Lifestyle', 'Business', 'Companion')
        - personality (One word e.g. 'Sassy', 'Professional', 'Kind')
        - suggestedPrice (number between 10 and 200 based on value)
      `,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }], // Enable search to actually look up the URL
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Import failed", e);
    // Fallback if search/generation fails
    return {
      name: "Imported Agent",
      tagline: "Ready to learn",
      description: "Successfully connected to external knowledge base.",
      systemInstruction: "You are a helpful assistant imported from an external source.",
      category: "Business",
      personality: "Helpful",
      suggestedPrice: 50
    };
  }
};