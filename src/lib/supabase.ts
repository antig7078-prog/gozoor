import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zyxelcptbvdqtgttqzof.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGVsY3B0YnZkcXRndHRxem9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MTc2NDYsImV4cCI6MjA5MTk5MzY0Nn0.H5zWdR5d_lYvSpNQ8dRcuIUH3fy95bUm2pePHgwyVdA';

export const supabase = createClient(supabaseUrl, supabaseKey);
