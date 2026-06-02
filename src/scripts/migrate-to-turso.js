import fs from 'fs';
import path from 'path';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createTursoClient } from '@libsql/client/web';

// 1. Manually parse .env file to load variables without requiring external dotenv dependency
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found in project root!');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    let value = parts.slice(1).join('=').trim();
    
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    
    process.env[key] = value;
  });
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Supabase environment variables not configured in .env');
  process.exit(1);
}

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('Error: Please configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env first!');
  process.exit(1);
}

console.log('--- Resilient DB Migration Script ---');
console.log('Connecting to Supabase:', SUPABASE_URL);
console.log('Connecting to Turso:', TURSO_DATABASE_URL);

const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const turso = createTursoClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

const TABLES = {
  profiles: `
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT,
      full_name TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  user_roles: `
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  site_content: `
    CREATE TABLE IF NOT EXISTS site_content (
      id TEXT PRIMARY KEY,
      page TEXT NOT NULL,
      section TEXT NOT NULL,
      field_key TEXT NOT NULL,
      field_type TEXT DEFAULT 'text',
      label TEXT NOT NULL,
      value TEXT,
      hint TEXT,
      sort_order INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  teachers: `
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT,
      subject TEXT,
      bio TEXT,
      photo_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  gallery_sections: `
    CREATE TABLE IF NOT EXISTS gallery_sections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  gallery_items: `
    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      image_url TEXT NOT NULL,
      title TEXT,
      category TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  notices: `
    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT,
      important INTEGER DEFAULT 0,
      published INTEGER DEFAULT 0,
      published_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  blogs: `
    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT,
      body TEXT,
      category TEXT,
      image_url TEXT,
      published INTEGER DEFAULT 0,
      published_at TEXT DEFAULT CURRENT_TIMESTAMP,
      author_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  student_results: `
    CREATE TABLE IF NOT EXISTS student_results (
      id TEXT PRIMARY KEY,
      student_name TEXT NOT NULL,
      father_name TEXT,
      seat_number TEXT NOT NULL,
      class_level INTEGER NOT NULL,
      exam_name TEXT NOT NULL,
      subjects TEXT,
      total_marks INTEGER NOT NULL,
      obtained_marks INTEGER NOT NULL,
      percentage REAL,
      grade TEXT,
      status TEXT NOT NULL,
      remarks TEXT,
      session TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  contact_inquiries: `
    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,
  admission_applications: `
    CREATE TABLE IF NOT EXISTS admission_applications (
      id TEXT PRIMARY KEY,
      student_name TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      class_applying TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `
};

async function run() {
  try {
    for (const [tableName, createSql] of Object.entries(TABLES)) {
      console.log(`\nProcessing table: ${tableName}`);
      
      // 1. Create table in Turso
      console.log(`- Creating table in Turso...`);
      await turso.execute(createSql);
      
      // 2. Fetch rows from Supabase
      console.log(`- Fetching data from Supabase...`);
      const { data: rows, error } = await supabase.from(tableName).select('*');
      if (error) {
        console.error(`- Error fetching from Supabase for table ${tableName}:`, error.message);
        continue;
      }
      
      if (!rows || rows.length === 0) {
        console.log(`- Table ${tableName} is empty in Supabase. Skipping data seeding.`);
        continue;
      }
      
      console.log(`- Seeding ${rows.length} rows to Turso...`);
      
      // 3. Seed rows to Turso
      for (const row of rows) {
        const cols = Object.keys(row);
        const placeholders = cols.map(() => '?');
        const vals = cols.map(c => {
          let val = row[c];
          
          // SQLite translations
          if (typeof val === 'boolean') {
            val = val ? 1 : 0; // Boolean to int
          } else if (typeof val === 'object' && val !== null) {
            val = JSON.stringify(val); // Objects (like JSON column) to string
          }
          return val;
        });
        
        // Use INSERT OR REPLACE so script is repeatable/idempotent
        const insertSql = `INSERT OR REPLACE INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders.join(', ')})`;
        
        try {
          await turso.execute({ sql: insertSql, args: vals });
        } catch (insertErr) {
          console.error(`  x Error inserting row ${row.id || JSON.stringify(row)}:`, insertErr.message);
        }
      }
      console.log(`- Table ${tableName} successfully synced!`);
    }
    
    console.log('\n--- Sync Migration Complete! ---');
    console.log('All schemas created and existing Supabase data successfully copied to Turso.');
    process.exit(0);
  } catch (err) {
    console.error('\nFatal migration error:', err);
    process.exit(1);
  }
}

run();
