const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/hp/OneDrive/Desktop/vsquare/.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const newOffer = {
      id: 'TOP_PERFORMERS',
      title: 'Top Performers of the Month',
      message: JSON.stringify(["VS00101", "", ""]),
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      created_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('offers').upsert([newOffer]);
  console.log('Error:', error);
  console.log('Data:', data);
}
test();
