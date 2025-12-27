# Myflix - Le Studio de Cinéma Personnel 🎬

Myflix est une application de streaming premium et un studio de création alimenté par l'IA. Elle permet d'importer son propre contenu (films, séries, musique), de l'analyser intelligemment et de le visionner dans une interface moderne et immersive.

## ✨ Fonctionnalités

- **Streaming Immersif** : Une interface élégante inspirée des meilleurs services de VOD.
- **Studio Master** : Importez vos fichiers locaux (MP4, AVI, MKV, MP3, etc.).
- **Analyse IA (Gemini 3)** : 
  - Extraction automatique de métadonnées (titre, année, genre, synopsis).
  - Génération de pochettes (Smart Covers) via analyse de frames vidéo.
  - Support de `gemini-3-flash-preview` pour la rapidité et `gemini-3-pro-preview` pour la précision.
- **Assistant Concierge** : Un assistant IA intégré pour vous recommander du contenu.
- **Visualiseur Audio** : Un visualiseur réactif pour votre bibliothèque musicale.
- **PWA Ready** : Installez l'application sur votre bureau ou mobile pour un accès hors-ligne.

## 🚀 Installation

1. Clonez le dépôt :
   ```bash
   git clone <votre-repo-url>
   cd myflix
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   Créez un fichier `.env` à la racine :
   ```env
   VITE_GEMINI_API_KEY=votre_cle_gemini
   VITE_OPENAI_API_KEY=votre_cle_openai
   ```

4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## 🛠 Technologies

- **Frontend** : Vite, React, TypeScript, Tailwind CSS.
- **IA** : @google/genai (Gemini 3), OpenAI SDK.
- **Icons** : Lucide React.
- **Stockage** : IndexDB (via idb-keyval).

---
Développé avec ❤️ pour les passionnés de cinéma.
