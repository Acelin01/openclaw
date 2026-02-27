import { migrate } from 'drizzle-orm/mysql2/migrator';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function main() {
  const { db, connection } = await import('./index');
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  await connection.end();
}

main().catch((err) => {
  if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.message?.includes("Table") && err.message?.includes("already exists")) {
    console.warn('Migration warning: Tables already exist, skipping migration.');
    process.exit(0);
  }
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.warn('Skipping migration: No DATABASE_URL provided in production environment.');
    process.exit(0);
  }
  console.error('Migration error:', err);
  // During build stage, we might not have DB access
  if (process.env.SKIP_MIGRATION_ERROR === 'true') {
    process.exit(0);
  }
  process.exit(1);
});
