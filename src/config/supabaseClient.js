import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nseykgyfbakvthrymuoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZXlrZ3lmYmFrdnRocnltdW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDU3MjksImV4cCI6MjA5MjQyMTcyOX0.zXkjvZb02qXCPl9nDSl-M64mfpOswhBsKFp_phZcOzA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// List of all areas
export const AREAS = [
  'Dhaka Central Area',
  'Dhaka South Area',
  'Dhaka North Area',
  'Narsingdi Area',
  'Rampura Area',
  'Mirpur Area',
  'Narayanganj Area',
  'Gazipur West Area',
  'Tangail Area',
  'Dhaka West Area',
  'Sirajgonj Area',
  'Jamalpur Area',
  'Gazipur East Area',
  'Mymensingh Area',
  'Kishoreganj Area',
  'Netrokona Area',
  'Brahmanbaria Area',
  'Moulovibazar Area',
  'Sylhet-North Area',
  'Sylhet-South Area',
  'Chandpur Area',
  'Cumilla Area',
  'Noakhali Area',
  "Cox's Bazar Area",
  'CTG West Area',
  'CTG Central Area',
  'CTG East Area',
  'Barisal Area',
  'Faridpur Area',
  'Madaripur Area',
  'Patuakhali Area',
  'Pirojpur Area',
  'Jashore Area',
  'Jhenaidah Area',
  'Khulna Area',
  'Kushtia Area',
  'Satkhira Area',
  'Rangpur Area',
  'Bogura Area',
  'Naogaon Area',
  'Rajshahi Area',
  'Pabna Area',
  'Dinajpur Area',
  'Sayedpur Area',
  'Lalmonirhat Area'
];
