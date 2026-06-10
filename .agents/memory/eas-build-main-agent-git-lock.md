---
name: EAS builds from the main agent hit a git index.lock block
description: How to run eas build (esp. production autoIncrement) when the sandbox blocks .git writes
---

# Running `eas build` from the main agent (sandbox blocks .git writes)

The main-agent sandbox blocks ALL writes under `.git/` (even `rm .git/index.lock`).
`eas build` runs `git status`/`git diff` which do an *opportunistic* index
refresh (a write to `.git/index.lock`). That write is blocked → eas-cli aborts
AND leaves a stale 0-byte `.git/index.lock` behind. The `production` profile is
worse than `preview` because `autoIncrement: true` runs more git plumbing.

**Symptom:** `Destructive git operations are not allowed in the main agent: .../.git/index.lock`
right after "Computed project fingerprint", and no build URL is printed.

**Fix — set `GIT_OPTIONAL_LOCKS=0`:** keeps EAS's normal monorepo-aware
git-archive path (uploads the whole pnpm workspace honoring root `.easignore`,
~25 MB for kavach-ai) while telling git to skip the optional index write. Build
queues cleanly. `autoIncrement` still works (version is tracked remotely via
`appVersionSource: "remote"`, not git).

**Do NOT use `EAS_NO_VCS=1` in this monorepo.** It bypasses git but only tars
the app project dir (~1.4 MB) — it drops the workspace packages/assets, so the
build ERRORS. Upload size is the tell: ~25 MB = good, ~1.4 MB = broken.

**Why it matters / how to apply:** for any `eas build` (especially production)
invoked from the main agent, prefix with `GIT_OPTIONAL_LOCKS=0`. A stale
`.git/index.lock` may remain from a prior failed attempt; the platform's
end-of-turn checkpoint clears it (the main agent cannot). The remote versionCode
still increments on each failed attempt, so don't be surprised by gaps.
