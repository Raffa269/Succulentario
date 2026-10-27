import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

// PostgreSQL temporaneo: nessuna connessione o modifica al progetto online.
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const beta = '00000000-0000-0000-0000-000000000002';
const visitor = '00000000-0000-0000-0000-000000000003';
const stranger = '00000000-0000-0000-0000-000000000004';
await db.exec(`
  create role anon; create role authenticated; create role service_role bypassrls;
  create schema auth; create schema storage;
  create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
  $$;
  grant usage on schema auth,storage to authenticated;
  grant execute on function auth.uid() to authenticated;
  create table storage.buckets(id text primary key,name text,public boolean);
  create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
  alter table storage.objects enable row level security;
  grant select,insert,update,delete on storage.objects to authenticated;
  create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
  insert into auth.users values('${admin}','galano.raffaele@gmail.com',now()),('${beta}','beta@example.test',now());
`);
for (const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort()) {
  await db.exec(await readFile(`supabase/migrations/${file}`,'utf8'));
}
await db.exec(`insert into public.plants(owner,name) select '${beta}','BETA ' || i from generate_series(1,8) i;
  insert into storage.objects(bucket_id,name) values('foto','${beta}/beta.jpg');`);
for (const file of ['001_shared_project.sql','002_notes.sql']) {
  await db.exec(await readFile(`supabase/freemium/${file}`,'utf8'));
}
await db.exec(`insert into auth.users values('${visitor}','visitor@example.test',now()),('${stranger}','stranger@example.test',now());`);
async function asUser(id, fn) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`);
  try { return await fn(); } finally { await db.exec('reset role'); }
}
async function count(table) { return Number((await db.query(`select count(*) as n from ${table}`)).rows[0].n); }
await asUser(beta, async()=>{
  assert.equal(await count('public.plants'),8);
  assert.equal(await count('freemium.plants'),0);
  assert.equal(await count('storage.objects'),1);
  await db.exec(`insert into public.plants(owner,name) values('${beta}','BETA senza limite');`);
});
await asUser(visitor, async()=>{
  await db.exec('select freemium.request_access();');
  assert.equal((await db.query('select status from freemium.access_requests')).rows[0].status,'pending');
  assert.equal(await count('public.plants'),0);
  assert.equal(await count('storage.objects'),0);
  await assert.rejects(db.exec(`insert into public.plants(owner,name) values('${visitor}','Tentativo BETA');`),/row-level security/);
  await assert.rejects(db.exec(`insert into freemium.plants(owner,name) values('${visitor}','Prima di approvazione');`),/row-level security/);
  await assert.rejects(db.exec(`update freemium.access_requests set is_admin=true where user_id='${visitor}';`),/permission denied/);
  await db.exec(`update freemium.access_requests set status='approved' where user_id='${visitor}';`);
  assert.equal((await db.query('select status from freemium.access_requests')).rows[0].status,'pending');
});
await asUser(admin, async()=>{
  assert.equal((await db.query('select freemium.is_access_admin() as admin')).rows[0].admin,true);
  await db.exec(`update freemium.access_requests set status='approved' where user_id='${visitor}';`);
});
await asUser(visitor, async()=>{
  for (let i=0;i<5;i++) await db.exec(`insert into freemium.plants(owner,name,kind,import_id) values('${visitor}','Pianta ${i}','${['collection','wishlist','lost'][i%3]}','backup-${i}');`);
  assert.equal(await count('freemium.plants'),5);
  await assert.rejects(db.exec(`insert into freemium.plants(owner,name) values('${visitor}','Sesta');`),/limite di 5/);
  await db.exec(`insert into freemium.plants(owner,name,import_id) values('${visitor}','Aggiornata','backup-0') on conflict(owner,import_id) do update set name=excluded.name;`);
  await db.exec(`select freemium.aggiungi_nota_pianta(id,'Nota di prova') from freemium.plants limit 1;`);
  await db.exec(`insert into storage.objects(bucket_id,name) values('foto-freemium','${visitor}/ok.jpg');`);
  await assert.rejects(db.exec(`insert into storage.objects(bucket_id,name) values('foto','${visitor}/beta.jpg');`),/row-level security/);
  await db.exec(`delete from freemium.plants where import_id='backup-4'; insert into freemium.plants(owner,name) values('${visitor}','Posto liberato');`);
});
await asUser(stranger, async()=>{
  await db.exec('select freemium.request_access();');
  assert.equal(await count('freemium.plants'),0);
  assert.equal(await count('freemium.access_requests'),1);
  assert.equal(await count('storage.objects'),0);
});
await asUser(admin, ()=> db.exec(`update freemium.access_requests set status='rejected' where user_id='${visitor}';`));
await asUser(visitor, async()=>{
  await db.exec('select freemium.request_access();');
  assert.equal(await count('freemium.plants'),0);
  assert.equal(await count('storage.objects'),0);
  assert.equal((await db.query('select status from freemium.access_requests')).rows[0].status,'rejected');
});
assert.equal(await count('public.plants'),9);
console.log('OK: BETA preservata, isolamento utenti/schema/foto, approvazione e revoca, limite 5 incluse wishlist/cimitero, upsert al limite e note.');
await db.close();
