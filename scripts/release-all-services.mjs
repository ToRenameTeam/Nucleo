import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import process from 'node:process';

const require = createRequire(import.meta.url);
const services = require('../release/services.cjs');

const dryRun = process.argv.includes('--dry-run');
const serviceFlagIndex = process.argv.indexOf('--service');
const selectedService = serviceFlagIndex >= 0 ? process.argv[serviceFlagIndex + 1] : undefined;

const isCi = process.env.CI === 'true';

if (!dryRun && !isCi) {
  console.error('Full release is restricted to CI. Use --dry-run locally.');
  process.exit(1);
}

const selectedServices = selectedService
  ? services.filter((service) => service.id === selectedService)
  : services;

if (selectedService && selectedServices.length === 0) {
  console.error(`Invalid service: ${selectedService}`);
  process.exit(1);
}

for (const service of selectedServices) {
  console.log(`\n==> semantic-release: ${service.id}`);

  const args = ['semantic-release', '--extends', './release/release.config.cjs'];
  if (dryRun) {
    args.push('--dry-run', '--no-ci');
  }

  const result = spawnSync('pnpm', args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      SEMREL_LOCAL_DRY_RUN: dryRun ? '1' : '0',
      SEMREL_SERVICE: service.id,
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('\nRelease flow completed for all configured services.');
