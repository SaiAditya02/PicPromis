import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ytxbnbhhkbgatkfshqbl.supabase.co',
  'sb_publishable_-18i3ZfFoovkdTISz-8AGg_8C8wl69b'
);

async function run() {
  console.log('Registering/Signing up admin...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@picpromise.com',
    password: 'M@dhaya318',
  });

  if (error) {
    console.error('Auth Sign Up Error:', error);
    return;
  }

  if (!data.user) {
    console.error('No user returned from signup');
    return;
  }

  console.log('User created:', data.user.id);

  // Now upsert the profile with admin role
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      email: 'admin@picpromise.com',
      full_name: 'System Admin',
      role: 'admin'
    });

  if (profileError) {
    console.error('Profile Upsert Error:', profileError);
  } else {
    console.log('Profile created/updated successfully with admin role!');
  }
}

run();
