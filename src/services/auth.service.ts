import { supabase } from '../supabase/client';
import { AccountMetadata } from '../types/Account';

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    
    if (error) {
        throw error;
    }
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw error;
    }
    return true;
};

export const registerWithEmailAndPassword = async (email: string, password: string, metadata: AccountMetadata) => {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: metadata,
        },
    });
    
    if (error) {
        throw error;
    }
    return data;
};

export const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
        throw error;
    }
    return data;
};

export const getUserSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
        throw error;
    }
    return data;
};

export const updateUserMetadata = async (metadata: AccountMetadata) => {
    const { data, error } = await supabase.auth.updateUser({
        data: metadata,
    });
    
    if (error) {
        throw error;
    }
    return data;
};
