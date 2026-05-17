# Archived Changes

Folders here are changes that have **already shipped**: their spec deltas have
been folded into `openspec/specs/<capability>/spec.md` and the implementation is
on `main`. They are kept so future readers can see why a capability looks the
way it does — proposal + tasks + the delta as it appeared at the time.

Several of the entries here were backfilled retrospectively on 2026-05-17 — the
work shipped before the change folders existed. They are reconstructions from
the git history, not the original artefacts.

Folder structure mirrors `changes/<id>/`:

```
archived/<id>/
├── proposal.md
├── tasks.md
└── specs/<capability>/spec.md   # delta as it would have appeared pre-merge
```

For new work, open the change under `changes/<id>/` (not `archived/`), and only
move it here after the delta has been folded back into the canonical spec.
