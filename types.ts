export interface Profile {
    id: string;
    name: string;
    avatar: string;
    isKid: boolean;
}

export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin';
    subscriptionStatus: 'active' | 'inactive';
    profiles: Profile[];
}

export interface Chapter {
    time: number;
    title: string;
}

export interface Episode {
    id: string;
    number: number;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: string;
    chapters?: Chapter[];
}

export interface Season {
    number: number;
    episodes: Episode[];
}

export interface Movie {
    id: string;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
    backdropUrl?: string;
    type: 'movie' | 'series' | 'music';
    year?: number | string;
    artist?: string;
    composer?: string;
    isCustom?: boolean;
    matchPercentage?: number;
    rating?: string;
    duration?: string;
    description?: string;
    genre?: string[];
    recommendationReason?: string;
    chapters?: Chapter[];
    seasons?: Season[];
}

export type MediaType = 'movie' | 'series' | 'music';
