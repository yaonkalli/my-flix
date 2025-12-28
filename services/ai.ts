
// [AI UPDATE] Service AI Client-Side
// Compatible avec les nouvelles spécifications Google GenAI SDK
// Gère l'envoi mixte (Texte + Images) et le nettoyage JSON

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
        model = 'gemini-2.0-flash',
        systemInstruction,
        temperature = 0.7,
        isJson = false
    } = options;

    // SDK: apiKey passed from store (which gets it from localStorage, env, or config)
    const client = new GoogleGenAI({
        apiKey: apiKey
    });

    console.log(`[Gemini-3] Calling model: ${model} (JSON: ${isJson})`);

    try {
        // Construct valid 'contents' payload.
        // The API expects: contents: [ { role: 'user', parts: [...] }, ... ]

        let userParts: any[] = [];

        if (Array.isArray(prompt)) {
            // Check if prompt is already a list of Content objects (has 'role' or 'parts')
            // or a list of Parts (text or inlineData).
            const looksLikeContent = prompt.some(p => p.role || p.parts);

            if (looksLikeContent) {
                // Assume it's already formatted as Content[]
                // However, we need to be careful. If Studio sends mixed [string, inlineData],
                // that is NOT Content[].
                // Studio sends: [ "text string", { inlineData: ... } ]
                // "text string" does not have .role or .parts. {inlineData} does not have .role or .parts.
                // So looksLikeContent should be false.

                // Let's re-verify Studio output:
                // promptParts.push({ inlineData: ... }) -> this object has { inlineData: ... }
                // promptParts is [ string, { inlineData: ... } ]

                // So we should treat this as a list of parts for a single USER turn.
                userParts = prompt.map(p => {
                    if (typeof p === 'string') return { text: p };
                    // If it's already a part object (has text or inlineData), use it.
                    if (p.inlineData || p.text) return p;
                    // Fallback
                    return { text: JSON.stringify(p) };
                });
            } else {
                // If it really IS Content[] (unlikely given usage), pass it through?
                // But simpler assumption: if it's an array, it's a list of parts for the user message.
                 userParts = prompt.map(p => {
                    if (typeof p === 'string') return { text: p };
                    if (p.inlineData || p.text) return p;
                    // If it has 'role', it IS a Content object, so we shouldn't be here if we check correctly.
                     if (p.role) return p; // This would be invalid inside 'parts'
                     return { text: JSON.stringify(p) };
                });
            }
        } else {
            userParts = [{ text: prompt }];
        }

        // Filter out any full Content objects from userParts if mixed (unlikely)
        // We will construct one User Content block.
        const contents = [
            ...(systemInstruction ? [{ role: 'system' as any, parts: [{ text: systemInstruction }] }] : []),
            { role: 'user', parts: userParts }
        ];

        // Edge case: If the user passed full Content objects in 'prompt' (like history),
        // we should respect that.
        // Let's refine the logic:
        // If the first element of the array has a 'role', assume the WHOLE array is history/Content[].
        if (Array.isArray(prompt) && prompt.length > 0 && (prompt[0] as any).role) {
             // It's a full conversation history.
             // We just prepend system instruction if needed.
             const history = prompt as any[];
             if (systemInstruction) {
                 // Check if system is already there? Assuming we prepend.
                 contents.length = 0; // Clear
                 contents.push({ role: 'system' as any, parts: [{ text: systemInstruction }] });
                 contents.push(...history);
             } else {
                 contents.length = 0;
                 contents.push(...history);
             }
        }

        const result = await client.models.generateContent({
            model: model,
            contents: contents,
            generationConfig: {
                temperature,
                ...(isJson ? { responseMimeType: 'application/json' } : {})
            }
        } as any);

        const responseText = (result as any).text ? (result as any).text : (result as any).candidates?.[0]?.content?.parts?.[0]?.text;

        if (isJson) {
            return responseText.replace(/```json|```/g, '').trim();
        }

        return responseText;
    } catch (err: any) {
        console.error("[Gemini-3] Error:", err);
        throw err;
    }
};
