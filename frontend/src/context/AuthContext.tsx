import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: number; full_name: string; email: string; aadhaar_number?: string; city_ward?: string; avatar_url?: string; is_verified: boolean; created_at?: string;
}
interface AuthContextType { user: User | null; token: string | null; isAuthenticated: boolean; isAuthModalOpen: boolean; authModalTab: 'login' | 'register'; openAuthModal: (tab?: 'login' | 'register') => void; closeAuthModal: () => void; login: (token: string, user: User) => void; logout: () => void; updateUser: (user: User) => void; }
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const readUser = (): User | null => { try { const value = localStorage.getItem('jansetu_user'); return value ? JSON.parse(value) : null; } catch { localStorage.removeItem('jansetu_user'); return null; } };
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(readUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jansetu_token'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const openAuthModal = (tab: 'login' | 'register' = 'login') => { setAuthModalTab(tab); setIsAuthModalOpen(true); };
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const login = (newToken: string, newUser: User) => { setToken(newToken); setUser(newUser); localStorage.setItem('jansetu_token', newToken); localStorage.setItem('jansetu_user', JSON.stringify(newUser)); closeAuthModal(); };
  const logout = () => { setToken(null); setUser(null); localStorage.removeItem('jansetu_token'); localStorage.removeItem('jansetu_user'); localStorage.removeItem('jansetu_admin_auth'); };
  const updateUser = (updatedUser: User) => { setUser(updatedUser); localStorage.setItem('jansetu_user', JSON.stringify(updatedUser)); };
  return <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(user && token), isAuthModalOpen, authModalTab, openAuthModal, closeAuthModal, login, logout, updateUser }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within an AuthProvider'); return context; };
