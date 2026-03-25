const services = require('./services.cjs');

const serviceId = process.env.SEMREL_SERVICE;
const isLocalDryRun = process.env.SEMREL_LOCAL_DRY_RUN === '1';
const service = services.find((candidate) => candidate.id === serviceId);

if (!service) {
  const knownServices = services.map((candidate) => candidate.id).join(', ');
  throw new Error(`SEMREL_SERVICE is missing or invalid. Supported values: ${knownServices}`);
}

const plugins = [['./release/scoped-commits-plugin.cjs']];

if (!isLocalDryRun) {
  const publishPlugins = [
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    ['@semantic-release/github'],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md'],
        message: `chore(${service.id}): release \${nextRelease.gitTag} [skip ci]\n\n\${nextRelease.notes}`,
      },
    ],
  ];

  if (service.publishDocker !== false) {
    publishPlugins.splice(1, 0, [
      '@semantic-release/exec',
      {
        publishCmd: `node ./scripts/publish-docker-image.mjs ${service.id} \${nextRelease.version}`,
      },
    ]);
  }

  plugins.push(...publishPlugins);
}

module.exports = {
  branches: isLocalDryRun ? ['main', 'dev'] : ['main'],
  tagFormat: `${service.id}-v\${version}`,
  plugins,
};
