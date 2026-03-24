const { spawnSync } = require('node:child_process');
const services = require('./services.cjs');

const RELEASE_PRIORITY = {
  patch: 1,
  minor: 2,
  major: 3,
};

const affectedServicesByCommit = new Map();

function getCurrentService() {
  const serviceId = process.env.SEMREL_SERVICE;
  const service = services.find((candidate) => candidate.id === serviceId);

  if (!service) {
    const knownServices = services.map((candidate) => candidate.id).join(', ');
    throw new Error(`SEMREL_SERVICE is missing or invalid. Supported values: ${knownServices}`);
  }

  return service;
}

function parseScopedCommit(message) {
  const [header = ''] = message.split('\n');
  const match = /^(\w+)\(([^)]+)\)(!)?: (.+)$/.exec(header);

  if (!match) {
    return null;
  }

  const [, type, scope, bang, subject] = match;
  const hasBreakingFooter = /(^|\n)BREAKING CHANGES?:\s+/m.test(message);

  return {
    type,
    scope,
    subject,
    isBreaking: Boolean(bang) || hasBreakingFooter,
  };
}

function parseUnscopedCommit(message) {
  const [header = ''] = message.split('\n');
  const match = /^(\w+)(!)?: (.+)$/.exec(header);

  if (!match) {
    return null;
  }

  const [, type, bang, subject] = match;
  const hasBreakingFooter = /(^|\n)BREAKING CHANGES?:\s+/m.test(message);

  return {
    type,
    subject,
    isBreaking: Boolean(bang) || hasBreakingFooter,
  };
}

function releaseTypeForCommit(parsedCommit) {
  if (!parsedCommit) {
    return null;
  }

  if (parsedCommit.isBreaking) {
    return 'major';
  }

  if (parsedCommit.type === 'feat') {
    return 'minor';
  }

  if (parsedCommit.type === 'fix' || parsedCommit.type === 'perf') {
    return 'patch';
  }

  return null;
}

function compareReleaseTypes(current, next) {
  if (!next) {
    return current;
  }

  if (!current) {
    return next;
  }

  return RELEASE_PRIORITY[next] > RELEASE_PRIORITY[current] ? next : current;
}

function loadChangedFilesForCommit(commitHash) {
  const gitResult = spawnSync('git', ['show', '--name-only', '--pretty=format:', commitHash], {
    encoding: 'utf8',
  });

  if (gitResult.status !== 0) {
    return [];
  }

  return gitResult.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function inferAffectedServiceIds(commitHash) {
  if (affectedServicesByCommit.has(commitHash)) {
    return affectedServicesByCommit.get(commitHash);
  }

  const changedFiles = loadChangedFilesForCommit(commitHash);
  const affectedServiceIds = new Set();

  for (const service of services) {
    const releasePaths = service.releasePaths || [];
    if (releasePaths.length === 0) {
      continue;
    }

    const isAffected = changedFiles.some((file) =>
      releasePaths.some((releasePath) => file === releasePath || file.startsWith(releasePath))
    );

    if (isAffected) {
      affectedServiceIds.add(service.id);
    }
  }

  const result = [...affectedServiceIds];
  affectedServicesByCommit.set(commitHash, result);
  return result;
}

function shouldApplyToCurrentService(commit, service) {
  const scopedCommit = parseScopedCommit(commit.message);

  if (scopedCommit) {
    return {
      apply: service.scopes.includes(scopedCommit.scope),
      parsedCommit: scopedCommit,
    };
  }

  const unscopedCommit = parseUnscopedCommit(commit.message);
  if (!unscopedCommit) {
    return {
      apply: false,
      parsedCommit: null,
    };
  }

  const affectedServiceIds = inferAffectedServiceIds(commit.hash);
  return {
    apply: affectedServiceIds.includes(service.id),
    parsedCommit: unscopedCommit,
  };
}

module.exports = {
  analyzeCommits(_pluginConfig, context) {
    const service = getCurrentService();
    let nextReleaseType = null;

    for (const commit of context.commits) {
      const { apply, parsedCommit } = shouldApplyToCurrentService(commit, service);
      if (!apply) {
        continue;
      }

      nextReleaseType = compareReleaseTypes(nextReleaseType, releaseTypeForCommit(parsedCommit));
    }

    if (nextReleaseType) {
      context.logger.log(`Scoped analysis (${service.id}) => release type ${nextReleaseType}`);
    } else {
      context.logger.log(`Scoped analysis (${service.id}) => no release-worthy commits`);
    }

    return nextReleaseType;
  },

  generateNotes(_pluginConfig, context) {
    const service = getCurrentService();
    const buckets = {
      breaking: [],
      feat: [],
      fix: [],
      perf: [],
      other: [],
    };

    for (const commit of context.commits) {
      const { apply, parsedCommit } = shouldApplyToCurrentService(commit, service);
      if (!apply || !parsedCommit) {
        continue;
      }

      const shortHash = commit.hash.slice(0, 7);
      const line = `- ${parsedCommit.subject} (${shortHash})`;

      if (parsedCommit.isBreaking) {
        buckets.breaking.push(line);
      } else if (parsedCommit.type === 'feat') {
        buckets.feat.push(line);
      } else if (parsedCommit.type === 'fix') {
        buckets.fix.push(line);
      } else if (parsedCommit.type === 'perf') {
        buckets.perf.push(line);
      } else {
        buckets.other.push(`- ${parsedCommit.type}: ${parsedCommit.subject} (${shortHash})`);
      }
    }

    if (
      buckets.breaking.length === 0 &&
      buckets.feat.length === 0 &&
      buckets.fix.length === 0 &&
      buckets.perf.length === 0 &&
      buckets.other.length === 0
    ) {
      return `No release notes generated for scope(s): ${service.scopes.join(', ')}.`;
    }

    const sections = [];

    if (buckets.breaking.length > 0) {
      sections.push('### Breaking Changes\n', buckets.breaking.join('\n'));
    }
    if (buckets.feat.length > 0) {
      sections.push('### Features\n', buckets.feat.join('\n'));
    }
    if (buckets.fix.length > 0) {
      sections.push('### Fixes\n', buckets.fix.join('\n'));
    }
    if (buckets.perf.length > 0) {
      sections.push('### Performance\n', buckets.perf.join('\n'));
    }
    if (buckets.other.length > 0) {
      sections.push('### Other\n', buckets.other.join('\n'));
    }

    return sections.join('\n\n');
  },
};
