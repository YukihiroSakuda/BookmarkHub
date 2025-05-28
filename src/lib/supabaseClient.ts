// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpwpqovwlcaedqwqfboh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwd3Bxb3Z3bGNhZWRxd3FmYm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTUwNTcsImV4cCI6MjA2MzgzMTA1N30.fqbKrTU7ldu-5LIifN50kyVetNM-xUT-1M_DOH6leyg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);