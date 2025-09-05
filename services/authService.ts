import { supabase } from './supabaseClient';
import { UserRole } from '../types';

/**
 * Signs in a user with their email and password.
 * @param email The user's email.
 * @param password The user's password.
 * @returns The user object on success.
 */
export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data.user;
};

/**
 * Signs up a new user with email, password, and metadata.
 * @param email The new user's email.
 * @param password The new user's password.
 * @param role The user's role.
 * @param schoolId The ID of the user's school.
 * @param county The county of the user's school.
 * @returns The new user object.
 */
export const signUpWithEmail = async (email: string, password: string, role: UserRole, schoolId: string, county: string) => {
    // Validation Rules per specification
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{12,}$/;
    if (!passwordRegex.test(password)) {
        throw new Error('Password must be at least 12 characters long and contain at least one number and one special character.');
    }

    if (role !== UserRole.STUDENT) {
        if (!email.endsWith('@kenya.go.ke') && !email.endsWith('@school.ac.ke')) {
            throw new Error('For this role, email must be a valid @kenya.go.ke or @school.ac.ke address.');
        }
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role,
                school_id: schoolId,
                county,
                full_name: email.split('@')[0] // Default full name
            },
        },
    });
    if (error) throw error;
    return data.user;
};

/**
 * Signs out the current user.
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/**
 * Initiates sign-in with Google OAuth.
 */
export const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) throw error;
};

/**
 * Mocks the sign-in with a crypto wallet.
 */
export const signInWithWallet = async () => {
    // This is a mock function as per the project requirements.
    console.log("signInWithWallet called");
    alert("Sign-in with Wallet is a mock feature. In a real application, this would connect to a Web3 provider like MetaMask.");
    return Promise.resolve();
};

/**
 * Sends a password reset link to the user's email.
 * @param email The user's email address.
 */
export const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Supabase will append the recovery token hash
    });
    if (error) throw error;
};

/**
 * Resets a student's password using a unique code.
 * NOTE: This is a mock implementation. In a real application, this would
 * be a call to a secure Supabase Edge Function that verifies the code
 * and uses the admin client to update the user's password.
 * @param email The student's email.
 * @param code The student's unique reset code.
 * @param newPassword The new password.
 */
export const resetStudentPassword = async (email: string, code: string, newPassword: string) => {
    // Mock implementation for demonstration. A real-world code would be unique.
    if (code.toUpperCase() === 'STUDENT123' && email) {
        console.log(`MOCK: Password for ${email} would be reset to ${newPassword}`);
        // In a real app, you would have something like:
        // const { error } = await supabase.rpc('reset_student_password', {
        //   user_email: email,
        //   reset_code: code,
        //   new_password: newPassword,
        // });
        // if (error) throw error;
        return; // Success
    } else {
        throw new Error('Invalid student code or email.');
    }
};

/**
 * Updates the currently authenticated user's password.
 * This is used after the user follows a password reset link.
 * @param newPassword The new password.
 */
export const updateUserPassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data.user;
};

/**
 * Updates the user's metadata (e.g., full name, avatar URL).
 * @param metadata The metadata object to update.
 */
export const updateUserMetadata = async (metadata: { full_name?: string; avatar_url?: string }) => {
    const { data, error } = await supabase.auth.updateUser({
        data: metadata
    });
    if (error) throw error;
    return data.user;
};

/**
 * Uploads a profile photo to Supabase Storage.
 * @param userId The ID of the user.
 * @param file The file to upload.
 * @returns The public URL of the uploaded file.
 */
export const uploadProfilePhoto = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;
    
    // Assumes bucket 'profile-pictures' exists and is public.
    const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);
        
    return data.publicUrl;
};