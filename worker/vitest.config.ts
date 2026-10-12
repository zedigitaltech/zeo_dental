import path from 'node:path';
import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig(async () => {
  const migrations = await readD1Migrations(path.join(__dirname, 'migrations'));
  return {
    test: {
      include: ['test/**/*.test.ts'],
      setupFiles: ['./test/apply-migrations.ts'],
      poolOptions: {
        workers: {
          // One workerd process, storage reset per test file: light on the laptop.
          singleWorker: true,
          isolatedStorage: true,
          wrangler: { configPath: './wrangler.test.toml' },
          miniflare: {
            bindings: {
              TEST_MIGRATIONS: migrations,
              ZEO_ENV: 'test',
              ADMIN_TOKEN: 'test-admin-token',
              SHEETS_EXPORT_TOKEN: 'test-export-token',
              RATE_LIMIT_SALT: 'test-salt',
              GEMINI_API_KEY: 'test-gemini-key',
              RESEND_API_KEY: 'test-resend-key',
              MAIL_FROM: 'Zeo Test <test@example.invalid>',
              MAIL_TO: 'clinic@example.invalid',
            },
          },
        },
      },
    },
  };
});
