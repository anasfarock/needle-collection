import { execSync } from 'node:child_process';

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

// Resolve Postgres URL from Vercel environment variable variants
const candidates = [
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL,
  process.env.DATABASE_URL_POOLED,
  process.env.PRISMA_DATABASE_URL,
]
  .map(v => (v ? v.trim() : ''))
  .filter(Boolean);

const pgUrl = candidates.find(
  u => u.startsWith('postgresql://') || u.startsWith('postgres://')
);

if (pgUrl) {
  process.env.DATABASE_URL = pgUrl;
}

// 1. Always generate Prisma Client
run('npx prisma generate');

// 2. If a PostgreSQL URL is configured, push schema to create tables in production DB
if (pgUrl && !pgUrl.includes('user:password@localhost')) {
  try {
    console.log('Pushing Prisma schema to PostgreSQL database...');
    run('npx prisma db push --skip-generate --accept-data-loss');
  } catch (err) {
    console.warn('Warning: prisma db push skipped during build (tables will be auto-created at runtime):', err?.message || err);
  }
}

// 3. Build Vite frontend
run('npx vite build');

