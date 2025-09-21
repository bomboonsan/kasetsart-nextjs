import { getSession as nextGetSession, signOut as nextSignOut } from "next-auth/react";

export const getSession = async () => {
    // wrapper around next-auth getSession for convenience
    try {
        const session = await nextGetSession();
        return session;
    } catch (err) {
        console.error("getSession error:", err);
        return null;
    }
};

export const signOut = async ({ redirect = true, callbackUrl = "/login" } = {}) => {
    // Use next-auth signOut to remove session and cookies.
    // By default, redirect back to /login.
    try {
        await nextSignOut({ redirect, callbackUrl });
    } catch (err) {
        console.error("signOut error:", err);
    }
};