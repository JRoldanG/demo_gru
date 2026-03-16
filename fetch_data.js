const url = 'https://feptwbnzgjiuxkopehdi.supabase.co/rest/v1/products?select=category,name,image_url&status=eq.Disponible';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcHR3Ym56Z2ppdXhrb3BlaGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzIxOTksImV4cCI6MjA4ODMwODE5OX0._8XGeiJix7GTowHw6GwPrFn-rBQ6NO6xKVDxIJvX-8Q';

fetch(url, { headers: { 'apikey': apikey, 'Authorization': 'Bearer ' + apikey } })
  .then(res => res.json())
  .then(data => {
    let imagesByCategory = {};
    for (let item of data) {
         if (item.image_url && item.image_url !== "") {
            if (!imagesByCategory[item.category]) imagesByCategory[item.category] = [];
            else if(imagesByCategory[item.category].length >= 3) continue; // max 3 images per category scene
            imagesByCategory[item.category].push({ name: item.name, url: item.image_url });
         }
    }
    console.log(JSON.stringify(imagesByCategory, null, 2));
  }).catch(console.error);
