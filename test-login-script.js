const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignIn() {
    console.log("Testing signIn...");
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'daroga17@yahoo.es', // that's one of the users
        password: 'wrongpassword'
    });

    if (error) {
        console.error("Sign in error:", error.message);
    } else {
        console.log("Sign in successful!", data.session?.user?.id);
    }
}

testSignIn();
