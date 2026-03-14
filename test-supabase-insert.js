const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://feptwbnzgjiuxkopehdi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcHR3Ym56Z2ppdXhrb3BlaGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzIxOTksImV4cCI6MjA4ODMwODE5OX0._8XGeiJix7GTowHw6GwPrFn-rBQ6NO6xKVDxIJvX-8Q');

async function testSupabase() {
    console.log('Inserting dummy product with image...');

    // Create a timeout wrapper
    const withTimeout = (promise, ms) => {
        let timer;
        const fallback = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('Timeout after ' + ms + 'ms')), ms);
        });
        return Promise.race([promise, fallback]).finally(() => clearTimeout(timer));
    };

    try {
        const start = Date.now();
        const { data, error } = await withTimeout(supabase.from('products').insert([
            {
                name: 'Test Network Timeout Product',
                description: 'Dummy',
                line: 'DUMMY',
                status: 'Disponible',
                image_url: 'https://i.ibb.co/ShFSjwF/Furotil.jpeg',
                price: 1000
            }
        ]).select(), 5000);
        console.log('Finished in', Date.now() - start, 'ms');
        console.log('Result:', { data, error });
    } catch (e) {
        console.error('Test Caught Error:', e);
    }
}
testSupabase();
