import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const createClient = () => {
  return createClientComponentClient();
};

export default createClient;
