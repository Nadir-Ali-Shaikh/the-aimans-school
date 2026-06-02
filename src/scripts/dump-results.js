import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually parse .env file
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.substring(1, val.length - 1);
    }
    envVars[key] = val;
  }
});

const url = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const key = envVars.SUPABASE_PUBLISHABLE_KEY || envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function dump() {
  try {
    const { data, error } = await supabase.from("student_results").select("*");
    if (error) {
      console.error("Error fetching student results:", error);
      return;
    }
    console.log("Found student results in Supabase:", data.length);
    data.forEach(r => {
      console.log(`ID: ${r.id} | Student: ${r.student_name} | Class: ${r.class_level} | Seat: "${r.seat_number}"`);
    });
  } catch (err) {
    console.error("Failed:", err);
  }
}

dump();
