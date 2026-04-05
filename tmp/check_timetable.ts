import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTimetable() {
  const { data, error } = await supabase
    .from('timetables')
    .select('*')
    .eq('mode', 'KBM')
    .eq('day', 'Ahad')
    .order('start_time')

  if (error) {
    console.error('Error fetching timetable:', error)
    return
  }

  console.log('Timetable for Ahad (KBM):')
  console.log(JSON.stringify(data, null, 2))
}

checkTimetable()
