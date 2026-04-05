const https = require('https');

const SUPABASE_URL = 'zcwqvyhwvrucwwwqozcq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjd3F2eWh3dnJ1Y3d3d3FvemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjAzNjEsImV4cCI6MjA5MDY5NjM2MX0.ax508kMeCKun7oAC4KadZ2hpRYCQhjENr-Gc4dYZdTQ';

const options = {
  hostname: SUPABASE_URL,
  path: '/rest/v1/timetables?mode=eq.KBM&day=eq.Ahad&order=start_time',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Timetable Data:');
    console.log(data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
