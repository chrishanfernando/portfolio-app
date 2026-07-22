# Deployment & preview URLs

The app is hosted on **Vercel** (project `folioxtracker`), connected to this GitHub repo
via Vercel's Git integration. Production branch is `main`.

- **Merge to `main` → production** at `folioxtracker.com`. There is no separate deploy
  step; the merge builds and promotes automatically.
- **Push any other branch → a preview deployment** (isolated URL, not public production).
- Because `npm run build` runs `drizzle-kit migrate` first, a merge to `main` also runs
  pending migrations against the **production** Turso DB. Review migration PRs accordingly.

## Preview deployments (per PR / branch)

Every push to a non-`main` branch gets its own preview build. Each preview has two URLs:

1. **Immutable per-deploy URL** — unique to that exact commit, changes on every push:
   `folioxtracker-<random-hash>-folioxtracker.vercel.app`
2. **Stable branch alias** — always points at the *latest* deploy of that branch; this is
   the one to share/bookmark:
   `folioxtracker-git-<sanitized-branch>-folioxtracker.vercel.app`

Long branch names are slugified, truncated, and hashed in the alias
(e.g. `claude/mobile-logout-redirect-bug-6r3kxi` →
`folioxtracker-git-claude-mobile-logout-red-7d794b-folioxtracker.vercel.app`), so you
generally can't hand-type the alias — look it up instead.

### Where to find the exact preview link

In order of convenience:

1. **On the GitHub PR** — Vercel posts a deployment status check and a comment with the
   **Preview** link. Open the PR → click "View deployment" / the preview URL in the Vercel
   bot comment. This is the normal path.
2. **GitHub Checks / Deployments** — the PR's "Checks" tab (and the repo's Environments
   sidebar) list the Vercel deployment with a link to the live preview.
3. **Vercel dashboard** — <https://vercel.com/folioxtracker/folioxtracker> → **Deployments**
   → click the branch's deployment. The **Domains** section lists both the immutable URL
   and the branch alias. The deployment's **Inspector** URL (from the dashboard or the API)
   also links straight to it.
4. **Vercel CLI** (if installed: `npm i -g vercel`) — `vercel ls folioxtracker` lists
   recent deployments with their URLs; `vercel inspect <url>` shows details.

## Notes

- **Preview access**: previews are publicly reachable by URL unless Preview Deployment
  Protection is enabled (Project → Settings → Deployment Protection). Given the app holds
  portfolio data, keep protection on.
- **Preview data**: previews use the project's **Preview** environment variables. Confirm
  whether `TURSO_DATABASE_URL` differs between Preview and Production — if they're the same,
  a preview reads/writes real production data. Check in Project → Settings → Environment
  Variables (filter by Preview), or `vercel env ls`.
- **Rollback**: to undo a bad production deploy, use **Instant Rollback** in the Vercel
  dashboard (Deployments → previous production deploy → Rollback / Promote).
