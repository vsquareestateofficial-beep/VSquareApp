const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}
loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const TABLES = [
  'employees',
  'leads',
  'projects',
  'notifications',
  'admin_settings',
  'offers',
  'sales_count',
];

async function checkTable(supabase, table) {
  const { data, error, count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    return { table, ok: false, error: `${error.code || 'ERR'}: ${error.message}` };
  }
  return { table, ok: true, rows: count ?? 0 };
}

async function testWriteReadDelete(supabase) {
  const testId = `TEST_${Date.now()}`;
  const row = {
    id: testId,
    name: 'Supabase Check',
    phone: '9999999999',
    role: 'Sales Executive',
    password: 'test',
  };

  const { error: insertErr } = await supabase.from('employees').upsert(row);
  if (insertErr) {
    return { ok: false, step: 'insert', error: insertErr.message };
  }

  const { data: readData, error: readErr } = await supabase
    .from('employees')
    .select('id, name')
    .eq('id', testId)
    .single();
  if (readErr) {
    return { ok: false, step: 'read', error: readErr.message };
  }

  const { error: delErr } = await supabase.from('employees').delete().eq('id', testId);
  if (delErr) {
    return { ok: false, step: 'delete', error: delErr.message };
  }

  return { ok: true, step: 'insert/read/delete', read: readData };
}

async function main() {
  console.log('=== V Square Supabase Health Check ===\n');

  if (!url || !key) {
    console.log('FAIL: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  console.log(`URL: ${url}`);
  console.log(`Key: ${key.slice(0, 20)}... (${key.length} chars)\n`);

  const supabase = createClient(url, key);

  // Auth / REST reachability
  const { error: authErr } = await supabase.auth.getSession();
  if (authErr) {
    console.log(`Auth API: FAIL — ${authErr.message}`);
  } else {
    console.log('Auth API: OK (reachable)');
  }

  console.log('\n--- Table access (SELECT) ---');
  const results = [];
  for (const table of TABLES) {
    const r = await checkTable(supabase, table);
    results.push(r);
    if (r.ok) {
      console.log(`  OK   ${table.padEnd(18)} ${r.rows} row(s)`);
    } else {
      console.log(`  FAIL ${table.padEnd(18)} ${r.error}`);
    }
  }

  console.log('\n--- Write test (employees) ---');
  const writeTest = await testWriteReadDelete(supabase);
  if (writeTest.ok) {
    console.log(`  OK   ${writeTest.step}`);
  } else {
    console.log(`  FAIL ${writeTest.step}: ${writeTest.error}`);
  }

  const tableFails = results.filter((r) => !r.ok);
  const allOk = tableFails.length === 0 && writeTest.ok;

  console.log('\n=== Summary ===');
  if (allOk) {
    console.log('All Supabase checks PASSED.');
  } else {
    console.log(`${tableFails.length} table(s) failed, write test: ${writeTest.ok ? 'OK' : 'FAIL'}`);
    if (tableFails.length) {
      console.log('\nFix hints:');
      tableFails.forEach((f) => console.log(`  - ${f.table}: ${f.error}`));
      console.log('  Run supabase_tables.sql or supabase_fix_all.sql in Supabase SQL Editor.');
    }
  }

  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error('Unexpected error:', e.message);
  process.exit(1);
});
