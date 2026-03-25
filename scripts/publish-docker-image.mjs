import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import process from 'node:process';

const require = createRequire(import.meta.url);
const services = require('../release/services.cjs');

const serviceId = process.argv[2];
const version = process.argv[3];

if (!serviceId || !version) {
  console.error('Usage: node scripts/publish-docker-image.mjs <service-id> <version>');
  process.exit(1);
}

const service = services.find((candidate) => candidate.id === serviceId);
if (!service) {
  console.error(`Unsupported service: ${serviceId}`);
  process.exit(1);
}

if (service.publishDocker === false) {
  console.log(`Skipping Docker publish for ${service.id}.`);
  process.exit(0);
}

if (!service.path || !service.dockerfile || !service.image) {
  console.error(`Incomplete Docker configuration for ${service.id}.`);
  process.exit(1);
}

const repository = process.env.GITHUB_REPOSITORY;
if (!repository) {
  console.error('Missing GITHUB_REPOSITORY environment variable.');
  process.exit(1);
}

const imageBase = `ghcr.io/${repository.toLowerCase()}/${service.image}`;
const tags = [version, 'latest'];

const buildContext = '.';
const buildArgs = [
  'build',
  '-f',
  service.dockerfile,
  ...tags.flatMap((tag) => ['-t', `${imageBase}:${tag}`]),
  buildContext,
];

console.log(
  `Build Docker image ${service.id}: ${tags.map((tag) => `${imageBase}:${tag}`).join(', ')}`
);

let result = spawnSync('docker', buildArgs, { stdio: 'inherit' });
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

for (const tag of tags) {
  const imageWithTag = `${imageBase}:${tag}`;
  console.log(`Push Docker image ${imageWithTag}`);

  result = spawnSync('docker', ['push', imageWithTag], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
