const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('ERROR: Supabase credentials not found in environment variables');
  console.log('Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPostsTable() {
  console.log('Checking posts table...\n');
  
  // Try to query the posts table
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .limit(1);

  if (error) {
    console.log('ERROR:', error.message);
    console.log('\nThe posts table likely does not exist yet.');
    console.log('You need to run the migration in your Supabase project.');
    return false;
  }

  console.log('SUCCESS: Posts table exists!');
  console.log(`Current posts count: ${data.length}`);
  return true;
}

checkPostsTable().then(success => {
  process.exit(success ? 0 : 1);
});
