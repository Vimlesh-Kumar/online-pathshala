# Incremental migrations

Ordered, run-once schema changes for databases that **already exist**.

`schema.sql` creates tables from scratch (`CREATE TABLE IF NOT EXISTS`) and is
enough for a brand-new database. It cannot, however, add a column or index to a
table that is already there. That is what this folder is for.

## How it works

`npm run db:setup` / `npm run db:schema` applies `schema.sql`, then runs every
`*.sql` file in this folder **in filename order**. Each file that succeeds is
recorded in a `schema_migrations` table and is **never run again**. Nothing here
is ever dropped or re-applied, so it is safe on production.

## Adding a migration for a new feature

1. Create the next numbered file, e.g. `002-add-something.sql`.
2. Write only **additive** SQL — `ALTER TABLE ... ADD COLUMN`, `CREATE INDEX`,
   `CREATE TABLE IF NOT EXISTS`. Avoid `DROP`/destructive changes on prod.
3. Also add the final column/table to `schema.sql` so fresh installs get it too.
4. Commit both. The next deploy runs the new file once, automatically.

Keep files idempotent where you can (guard with `information_schema` checks like
`001`) so a hand-run against a partially-migrated database is still safe.
