const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://feptwbnzgjiuxkopehdi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcHR3Ym56Z2ppdXhrb3BlaGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzIxOTksImV4cCI6MjA4ODMwODE5OX0._8XGeiJix7GTowHw6GwPrFn-rBQ6NO6xKVDxIJvX-8Q');

async function testSupabase() {
    console.log('Fetching a product to test update heartbeat...');

    const withTimeout = (promise, ms) => {
        let timer;
        const fallback = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('Timeout after ' + ms + 'ms')), ms);
        });
        return Promise.race([promise, fallback]).finally(() => clearTimeout(timer));
    };

    try {
        const { data: prods } = await supabase.from('products').select('id').limit(1);
        const targetId = prods[0].id;
        console.log('Updating product:', targetId);

        const start = Date.now();
        const { data, error } = await withTimeout(supabase.from('products').update({
            vademecum: 'Test Vademecum update from console'
        }).eq('id', targetId), 5000);
        console.log('Finished in', Date.now() - start, 'ms');
        console.log('Result:', { data, error });
    } catch (e) {
        console.error('Test Caught Error:', e);
    }
}
testSupabase();
