import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Account, AccountMetadata } from '../types/Account';
import { getCurrentUser, signIn, signOut, registerWithEmailAndPassword, updateUserMetadata } from '../services/auth.service';

interface AuthState {
  user: Account | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, metadata: AccountMetadata) => Promise<void>;
  updateProfile: (metadata: AccountMetadata) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await signIn(email, password);
          if (response.user) {
            set({ 
              user: {
                id: response.user.id,
                email: response.user.email || '',
                metadata: response.user.user_metadata as AccountMetadata,
                created_at: response.user.created_at
              }, 
              isAuthenticated: true 
            });
          }
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await signOut();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      register: async (email: string, password: string, metadata: AccountMetadata) => {
        set({ isLoading: true, error: null });
        try {
          const response = await registerWithEmailAndPassword(email, password, metadata);
          if (response.user) {
            set({ 
              user: {
                id: response.user.id,
                email: response.user.email || '',
                metadata: response.user.user_metadata as AccountMetadata,
                created_at: response.user.created_at
              }, 
              isAuthenticated: true 
            });
          }
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateProfile: async (metadata: AccountMetadata) => {
        set({ isLoading: true, error: null });
        try {
          const response = await updateUserMetadata(metadata);
          if (response.user) {
            set({ 
              user: {
                id: response.user.id,
                email: response.user.email || '',
                metadata: response.user.user_metadata as AccountMetadata,
                created_at: response.user.created_at
              }
            });
          }
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      checkAuth: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await getCurrentUser();
          if (response.user) {
            set({ 
              user: {
                id: response.user.id,
                email: response.user.email || '',
                metadata: response.user.user_metadata as AccountMetadata,
                created_at: response.user.created_at
              }, 
              isAuthenticated: true 
            });
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 