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

/**
 * Splits a migration file into single statements.
 *
 * Neon's HTTP driver carries one command per prepared statement, so a file has
 * to arrive split — sending it whole fails with "cannot insert multiple
 * commands into a prepared statement". The scanner tracks the three things a
 * bare `;` split gets wrong: quoted strings, dollar-quoted blocks and comments.
 */
function splitStatements(body: string): string[] {
  const out: string[] = [];
  let buf = '';
  let i = 0;

  while (i < body.length) {
    const ch = body[i];
    const rest = body.slice(i);

    // Comments never reach the server; a line comment keeps its newline so
    // tokens on either side cannot run together.
    if (rest.startsWith('--')) {
      const nl = body.indexOf('\n', i);
      i = nl === -1 ? body.length : nl;
      continue;
    }
    if (rest.startsWith('/*')) {
      const end = body.indexOf('*/', i + 2);
      buf += ' ';
      i = end === -1 ? body.length : end + 2;
      continue;
    }

    // A single-quoted string, in which '' is an escaped quote and a ; is data.
    if (ch === "'") {
      const start = i;
      i += 1;
      while (i < body.length) {
        if (body[i] === "'" && body[i + 1] === "'") {
          i += 2;
          continue;
        }
        if (body[i] === "'") {
          i += 1;
          break;
        }
        i += 1;
      }
      buf += body.slice(start, i);
      continue;
    }

    // A dollar-quoted block — $$ … $$ or $tag$ … $tag$ — is opaque throughout.
    const dollar = ch === '$' ? /^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/.exec(rest) : null;
    if (dollar) {
      const tag = dollar[0];
      const end = body.indexOf(tag, i + tag.length);
      const stop = end === -1 ? body.length : end + tag.length;
      buf += body.slice(i, stop);
      i = stop;
      continue;
    }

    if (ch === ';') {
      if (buf.trim()) out.push(buf.trim());
      buf = '';
      i += 1;
      continue;
    }

    buf += ch;
    i += 1;
  }

  if (buf.trim()) out.push(buf.trim());
  return out;
}

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
    const statements = splitStatements(body);

    // One transaction per file, with the ledger row inside it, so a migration
    // either lands whole or not at all. The statements come from a file in this
    // repository and never from a request, which is why the unsafe query path
    // is the right one here.
    await sql.transaction([
      ...statements.map((s) => sql.query(s)),
      sql.query('insert into _migrations (name) values ($1)', [file]),
    ]);

    console.log(`  apply ${file}  (${statements.length} statements)`);
  }

  console.log('  migrations up to date');
}

void main().catch((err) => {
  console.error(`  ${String(err)}`);
  process.exit(1);
});
