/**
 * Applies every .sql file in migrations/, in filename order, once.
 *
 * Run from CI under a role that has DDL rights — deliberately not the role the
 * Worker uses, which can only select, insert and delete.
 *
 *   DATABASE_URL=... npm run migrate --workspace=@manoj/api
 */

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('  DATABASE_URL is not set.');
    process.exit(1);
  }

  const sql = neon(url);
  const dir = path.join(process.cwd(), 'migrations');

  await sql`
    create table if not exists _migrations (
      name       text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  const applied = new Set(
    ((await sql`select name from _migrations`) as Array<{ name: string }>).map(
      (r) => r.name,
    ),
  );

  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  skip  ${file}`);
      continue;
    }
    const body = readFileSync(path.join(dir, file), 'utf8');
    // neon()'s tagged template does not take a multi-statement string, so the
    // file is sent through the unsafe query path deliberately — the input is a
    // file in this repository, not anything a request can reach.
    await sql.query(body);
    await sql`insert into _migrations (name) values (${file})`;
    console.log(`  apply ${file}`);
  }

  console.log('  migrations up to date');
}

void main().catch((err) => {
  console.error(`  ${String(err)}`);
  process.exit(1);
});
