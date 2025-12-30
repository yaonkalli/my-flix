
// [AI UPDATE] Service AI Client-Side
// Refonte complète : Google GenAI SDK (Gemini) Uniquement
// Gestion simplifiée et robuste des erreurs et des modèles

import { GoogleGenAI } from '@google/genai';

// --- Constants & Types ---

const MODEL_NAME = 'gemini-1.5-flash'; // Standard stable model
const API_ERROR_KEY_MISSING = "MYFLIX_CONFIG_REQUIRED";

export class AIError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = 'AIError';
    }
}

// --- Service Implementation ---

/**
 * Initializes the Gemini Client
 */
const getClient = (apiKey: string) => {
    if (!apiKey || apiKey.includes('DEMO_KEY') || apiKey.length < 10) {
        throw new AIError("Clé API manquante ou invalide.", API_ERROR_KEY_MISSING);
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Generates simple text completion (Chat)
 */
export const generateCompletion = async (apiKey: string, prompt: string, systemInstruction?: string): Promise<string> => {
    try {
        const client = getClient(apiKey);
        console.log(`[Gemini] Chat Request (${MODEL_NAME})`);

        const result = await client.models.generateContent({
            model: MODEL_NAME,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            },
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        // The SDK structure can be tricky.
        // Usually: result.text() is a helper if available, or access candidates.
        // Let's use 'any' to bypass temporary SDK type definition mismatches while ensuring the payload hits the API correctly.
        const response: any = result;
        const text = response.text ? response.text() : response.response?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("Réponse vide de l'IA");

        return text;
    } catch (err: any) {
        handleError(err);
        return "Erreur IA"; // Should not reach here if handleError throws
    }
};

/**
 * Generates JSON structure (Search/Metadata)
 */
export const generateJSON = async (apiKey: string, prompt: string, schema?: any): Promise<any> => {
    try {
        const client = getClient(apiKey);
        console.log(`[Gemini] JSON Request (${MODEL_NAME})`);

        const result = await client.models.generateContent({
            model: MODEL_NAME,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.3,
            },
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const response: any = result;
        const text = response.text ? response.text() : response.response?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("Réponse JSON vide");

        // Clean markdown code blocks if present (standard Gemini behavior)
        const cleanJson = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (err: any) {
        handleError(err);
        return {};
    }
};

/**
 * Multimodal Analysis (Studio - Text + Images)
 */
export const analyzeMedia = async (apiKey: string, prompt: string, imagesBase64: string[]): Promise<any> => {
    try {
        const client = getClient(apiKey);
        console.log(`[Gemini] Multimodal Request (${MODEL_NAME} - ${imagesBase64.length} images)`);

        // Construct Multimodal Parts
        const parts: any[] = [{ text: prompt }];

        imagesBase64.forEach(b64 => {
            // Remove header if present (data:image/jpeg;base64,) to send raw base64 if SDK expects it,
            // OR keep it. The new SDK usually handles standard inlineData.
            // Let's use the explicit inlineData structure.
            const cleanB64 = b64.includes(',') ? b64.split(',')[1] : b64;
            parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: cleanB64
                }
            });
        });

        const result = await client.models.generateContent({
            model: MODEL_NAME, // 1.5 Flash is multimodal capable
            config: {
                responseMimeType: 'application/json',
                temperature: 0.5
            },
            contents: [{ role: 'user', parts: parts }]
        });

        const response: any = result;
        const text = response.text ? response.text() : response.response?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("Réponse analyse vide");

        const cleanJson = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (err: any) {
        handleError(err);
        return null;
    }
};

/**
 * Standardized Error Handling
 */
const handleError = (err: any) => {
    console.error("[Gemini Service Error]", err);

    // Check for 400 Invalid Key or specific SDK error codes
    const msg = err.message || JSON.stringify(err);
    if (msg.includes("API key not valid") || msg.includes("400") || err instanceof AIError) {
        throw new AIError("Configuration requise", API_ERROR_KEY_MISSING);
    }

    if (msg.includes("429")) {
        throw new Error("Quota dépassé (Trop de requêtes). Réessayez plus tard.");
    }

    throw new Error("Erreur de communication avec l'IA. Vérifiez votre connexion.");
};
