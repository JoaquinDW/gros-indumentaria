#!/usr/bin/env node

/**
 * Script to run SQL migrations on Supabase
 * Usage: node scripts/run-migrations.js [migration-file]
 * Example: node scripts/run-migrations.js scripts/16_add_product_custom_fields.sql
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(filePath) {
  try {
    console.log(`\n📄 Reading migration file: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`\n🚀 Executing migration...\n`);
    console.log('SQL:', sql);
    console.log('\n');

    // Execute the SQL using Supabase's RPC or direct query
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If RPC doesn't exist, try using the postgres client directly
      console.log('RPC method not available, trying alternative approach...');

      // For Supabase, we need to execute migrations through their dashboard or CLI
      // Let's inform the user
      console.error('\n⚠️  Cannot execute raw SQL through Supabase JS client.');
      console.error('\nPlease run this migration manually using one of these methods:');
      console.error('1. Supabase Dashboard: https://app.supabase.com/project/_/sql');
      console.error('2. Supabase CLI: supabase db push');
      console.error('\nMigration SQL:');
      console.log('\n' + sql + '\n');
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    if (data) {
      console.log('Result:', data);
    }
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    process.exit(1);
  }
}

async function runAllPendingMigrations() {
  const scriptsDir = path.join(__dirname);
  const migrationFiles = fs.readdirSync(scriptsDir)
    .filter(file => file.endsWith('.sql') && file.match(/^\d+_/))
    .sort();

  console.log('\n📋 Found migrations:');
  migrationFiles.forEach(file => console.log(`  - ${file}`));

  // Run migrations 16 and 17 (the new ones)
  const newMigrations = ['16_add_product_custom_fields.sql', '17_add_order_items_personalization.sql'];

  for (const file of newMigrations) {
    if (migrationFiles.includes(file)) {
      await runMigration(path.join(scriptsDir, file));
    }
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length > 0) {
  // Run specific migration file
  runMigration(args[0]);
} else {
  // Run all pending migrations
  runAllPendingMigrations();
}
