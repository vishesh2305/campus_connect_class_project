import fs from 'fs';
import { pool } from './pool.js';

const arg = process.argv[2];

if (!arg) {
  console.log('Usage: npm run sql -- "SELECT 1"   (or a .sql file path)');
  process.exit(1);
}

const sql = arg.endsWith('.sql') ? fs.readFileSync(arg, 'utf8') : arg;

try {
  const result = await pool.query(sql);
  const last = Array.isArray(result) ? result[result.length - 1] : result;
  if (last.rows.length > 0 && 'QUERY PLAN' in last.rows[0]) {
    last.rows.forEach((r) => console.log(r['QUERY PLAN']));
  } else if (last.rows.length > 0) {
    console.table(last.rows);
  } else {
    console.log('OK (' + (last.command || 'done') + ')');
  }
} catch (err) {
  console.error('SQL error:', err.message);
} finally {
  await pool.end();
}
 