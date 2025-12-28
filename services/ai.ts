
import { GoogleGenAI } from '@google/genai';

export interface GeminiOptions {
    model?: string;
    systemInstruction?: string;
    temperature?: number;
    isJson?: boolean;
}

/**
 * Migration Protocol: @google/genai
 * 1. process.env.API_KEY usage
 * 2. gemini-3 models
 * 3. Native JSON support
 */
export const callGemini = async (apiKey: string, prompt: string | any[], options: GeminiOptions = {}) => {
    const {
        model = 'gemini-3-flash-preview',
        systemInstruction,
        temperature = 0.7,
        isJson = false
    } = options;

    // SDK: apiKey passed from store (which gets it from localStorage, env, or config)
    const client = new GoogleGenAI({
        apiKey: (process as any).env?.API_KEY || apiKey
    });

    console.log(`[Gemini-3] Calling model: ${model} (JSON: ${isJson})`);

    try {
        const result = await client.models.generateContent({
            model: model,
            // If systemInstruction is rejected in GenerateContentParameters, 
            // we prepend it to the contents for maximum compatibility or use the correct field if known.
            // Some versions of the GenAI SDK use system_instruction or require it in the contents.
            contents: [
                ...(systemInstruction ? [{ role: 'system' as any, parts: [{ text: systemInstruction }] }] : []),
                ...(Array.isArray(prompt) ? prompt : [{ role: 'user', parts: [{ text: prompt }] }])
            ],
            generationConfig: {
                temperature,
                ...(isJson ? { responseMimeType: 'application/json' } : {})
            }
        } as any); // Use 'any' to bypass temporary SDK type definition mismatches while ensuring the payload hits the API correctly

        // The new SDK often returns the response directly in the result
        const responseText = (result as any).text ? (result as any).text : (result as any).candidates?.[0]?.content?.parts?.[0]?.text;

        if (isJson) {
            // Scrub markdown if present, though responseMimeType should handle it
            return responseText.replace(/```json|```/g, '').trim();
        }

        return responseText;
    } catch (err: any) {
        console.error("[Gemini-3] Error:", err);
        throw err;
    }
};
