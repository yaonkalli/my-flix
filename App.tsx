import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Admin from './pages/Admin';
import Home from './pages/Home';
import Profiles from './pages/Profiles';
import Player from './pages/Player';
import Studio from './pages/Studio';
import SeriesDetail from './pages/SeriesDetail';
import OfflineLibrary from './pages/OfflineLibrary';
import { useStore } from './services/store';

import AIChat from './components/AIChat';
import MiniPlayer from './components/MiniPlayer';

const ConditionalComponents: React.FC = () => {
    const location = useLocation();
    const isWatchPage = location.pathname.startsWith('/watch/');

    if (isWatchPage) return null;

    return (
        <>
            <AIChat />
            <MiniPlayer />
        </>
    );
};

const App: React.FC = () => {
    const { initCustomContent } = useStore();

    React.useEffect(() => {
        initCustomContent();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/profiles" element={<Profiles />} />
                <Route path="/browse" element={<Home />} />
                <Route path="/browse/:category" element={<Home />} />
                <Route path="/watch/:id" element={<Player />} />
                <Route path="/series/:seriesId" element={<SeriesDetail />} />
                <Route path="/offline" element={<OfflineLibrary />} />
                <Route path="/studio" element={<Studio />} />
                <Route path="/admin" element={<Admin />} />

                {/* Defaut Redirects */}
                <Route path="/" element={<Navigate to="/profiles" replace />} />
                <Route path="*" element={<Navigate to="/profiles" replace />} />
            </Routes>
            <ConditionalComponents />
        </BrowserRouter>
    );
};

export default App;
