const serviceScopes = [
  'ai',
  'appointments',
  'commons',
  'documents',
  'frontend',
  'master-data',
  'users',
];

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [0],
    'scope-enum': [2, 'always', serviceScopes],
  },
};
