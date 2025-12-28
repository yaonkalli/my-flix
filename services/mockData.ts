
import { Movie, User } from '../types';

export const MOCK_MOVIES: Movie[] = [];

export const MOCK_USER: User = {
  id: 'user_admin',
  email: 'admin@myflix.com',
  role: 'admin',
  subscriptionStatus: 'active',
  profiles: [
    { id: 'p1', name: 'Profile 1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Profile1', isKid: false },
  ],
};
