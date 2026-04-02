# Semantic Release setup

This repository uses independent semantic versioning per service.

## Service scopes

Conventional Commits with a service scope are optional but recommended:

- `ai`
- `appointments`
- `documents`
- `frontend`
- `master-data`
- `users`
- `infrastructure`
- `commons` (shared code, no Docker publish)

Examples:

```text
feat(documents): add medical report validator
fix(appointments): validate overlap edge case
```

## Unscoped commits

Unscoped conventional commits are supported and resolved by changed paths.

Examples:

```text
feat: update shared contract used by users and frontend
fix: adjust root CI script
```

Behavior:

- If an unscoped commit changes files under one or more configured service paths, each affected service can release.
- If it changes only non-service paths (for example docs-only changes), no service release is triggered.
- If it changes only `commons/`, only `commons` is considered affected.
- Scope-based commits still take precedence and are always mapped directly to the declared service scope.

## Release behavior

- Release branch: `main`
- Tag format: `<service>-v<semver>` (for example `documents-v1.4.0`)
- Publish targets:
  - Git tags
  - GitHub Releases
  - Docker images on GHCR (`ghcr.io/<owner>/<repo>/<service>:<version>` and `:latest`)
- Changelog file: root `CHANGELOG.md`

## Local usage

Local full publish is blocked.

- Use dry-run locally to validate release behavior.
- Full publish is intended for GitHub Actions on `main` only.

```bash
pnpm release:services:dry
pnpm release:services:dry -- --service users
```

Dry-run mode skips GitHub/Git/Docker publish plugins and is safe for local checks.
