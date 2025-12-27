import { useState, useEffect } from 'react';

/**
 * Hook pour vérifier si une URL (vidéo ou image) est présente dans le cache de la PWA.
 */
export function useCacheStatus(urls: (string | undefined)[]) {
    const [isCached, setIsCached] = useState(false);

    useEffect(() => {
        async function checkCache() {
            if (!('caches' in window)) return;

            try {
                const cacheNames = await caches.keys();
                const validUrls = urls.filter((url): url is string => !!url && (url.startsWith('http') || url.startsWith('https')));

                if (validUrls.length === 0) {
                    setIsCached(false);
                    return;
                }

                let foundAll = true;

                // On vérifie spécifiquement dans nos caches définis dans vite.config.ts
                const myCaches = ['media-cache', 'unsplash-images', 'workbox-precache'];

                for (const url of validUrls) {
                    let found = false;
                    for (const cacheName of cacheNames) {
                        const cache = await caches.open(cacheName);
                        const response = await cache.match(url);
                        if (response) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        foundAll = false;
                        break;
                    }
                }

                setIsCached(foundAll);
            } catch (err) {
                console.warn("Cache check failed:", err);
            }
        }

        checkCache();
        // On re-vérifie périodiquement ou on pourrait écouter des événements de mise en cache
        const interval = setInterval(checkCache, 5000);
        return () => clearInterval(interval);
    }, [urls]);

    return isCached;
}
