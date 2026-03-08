import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storageKey: 'gruinfacol-auth-token',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // CRITICAL FIX: Disable web locks to prevent the "Lock broken by another request with the steal option" error in Next.js SSR
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        lock: typeof window === 'undefined' ? (name: string, acquireTimeout: number, acquire: () => Promise<any>) => {
            // Bypass Web Locks API ONLY on the server to prevent SSR deadlocks
            return acquire();
        } : undefined
    },
    global: {
        fetch: (...args) => fetch(...args)
    }
});
