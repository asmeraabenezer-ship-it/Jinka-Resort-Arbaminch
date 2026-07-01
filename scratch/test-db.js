const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const supabase = require('../backend/config/supabase');

async function test() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('Success! Data retrieved:', data);
    }
  } catch (err) {
    console.error('Exceptions:', err);
  }
}

test();
