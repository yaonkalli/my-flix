
// [AI UPDATE] Configuration globale de l'application
// Modifié pour garantir la connexion AI (Gemini/OpenAI)
// Alternative au fichier .env pour éviter les problèmes de chargement

export const config = {
    // Clé API Gemini
    // Note: Dans une vraie app de production, ceci devrait être sécurisé via un backend proxifié.
    // Pour ce projet local/demo, c'est acceptable.
    geminiApiKey: "AIzaSy-DEMO_KEY_REMOVED",

    // Clé API OpenAI
    openaiApiKey: "sk-proj-DEMO_KEY_REMOVED",

    // Autres configs globales si nécessaire
    maxHistoryItems: 20,
};
