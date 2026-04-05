const fetch = require('node-fetch');

const SUPABASE_URL = 'https://zcwqvyhwvrucwwwqozcq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjd3F2eWh3dnJ1Y3d3d3FvemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjAzNjEsImV4cCI6MjA5MDY5NjM2MX0.ax508kMeCKun7oAC4KadZ2hpRYCQhjENr-Gc4dYZdTQ';

async function checkTimetable() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/timetables?mode=eq.KBM&day=eq.Ahad&order=start_time`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });

    const data = await response.json();
    console.log('Timetable for Ahad (KBM):');
    console.log(JSON.stringify(data, null, 2));
}

checkTimetable();
