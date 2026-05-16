import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Tenant, StoreSettings } from '../types';
import { authApi } from '../api/auth';
import { settingsApi } from '../api/ingredient';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  enhancedMode: boolean;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enhancedMode, setEnhancedMode] = useState(false);

  useEffect(() => { loadUser(); }, []);

  const loadSettings = async () => {
    try {
      const s: StoreSettings = await settingsApi.get();
      setEnhancedMode(s.enhanced_mode ?? false);
    } catch {
      // settings gagal load — tidak masalah, default false
    }
  };

  const loadUser = async () => {
    try {
      const currentUser = authApi.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const profile = await authApi.getTenantProfile();
        setTenant(profile);
        // Load enhanced mode setelah auth berhasil
        await loadSettings();
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      const profile = await authApi.getTenantProfile();
      setTenant(profile);
      await loadSettings();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setTenant(null);
    setEnhancedMode(false);
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const value = {
    user,
    tenant,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    enhancedMode,
    refreshSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
