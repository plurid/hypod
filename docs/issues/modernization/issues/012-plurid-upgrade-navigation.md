# Plurid upgrade: keep reopened Imagene planes reachable after resizing

- Status: ready-for-agent

## Outcome

Upgrade Hypod to the published Plurid dependency chain without making an Imagene's
Back to registry control unreachable. Remove the existing dependency patch only
after the browser regression passes on the replacement release.

## Acceptance criteria

- [ ] Open and close an Imagene at 390 × 844, resize to 1440 × 1000, and reopen it.
      After navigation settles, Back to registry remains inside the viewport and
      can be clicked normally, without forced clicks or another navigation command.
- [ ] Reopening reuses the same child plane; closing leaves only registry content.
- [ ] Closed planes remain closed through organization changes and logout.
- [ ] Run the regression against the published packages, not workspace links.
- [ ] Update the coordinated Plurid dependency chain, remove the patch and its
      Docker COPY instruction, then pass `pnpm verify` and the container build.

## Dependencies

The Plurid navigation/geometry lifecycle requires investigation in the sibling
Plurid repository before another consumer upgrade. Related: [ADR 0006](../../../adr/0006-retain-plurid-for-admin-interface.md).

## Evidence

Observed on 2026-09-05 using the same Hypod production UI and Chromium:

- The isolated resize/reopen reproduction passes with the cached, patched
  `@plurid/plurid-react@0.0.0-36` dependency chain.
- It fails with the published `@plurid/plurid-react@0.0.0-37` chain. After reopening,
  the Back button settles at approximately x=1464–1500 in a 1440-pixel viewport;
  a normal click times out. The longer owner workflow reproduced this three times.
- Focus inspection found no outer-canvas scroll offset before or after focusing
  the link. Stale geometry or navigation/layout timing remain hypotheses, not a
  confirmed root cause.
- The old patched renderer also fails the separate, stronger assertion that a
  closed child stays closed after logout. Its existing passing suite did not
  assert that behavior.
- The new dependency chain passes formatting, lint, types, unit, integration and
  OCI tests, and production compilation; the extended browser test blocks adoption.
- Plurid's Helmet 3 cleanup separately passes the affected 37 tests, type checks,
  production builds, lint, `check.modules` and strict-peer `smoke.pack` (32 imports
  across 13 packages). Import compatibility does not establish browser correctness.

The clean local reproduction is preserved under `.artifacts/plurid-upgrade/`:

```sh
pnpm exec playwright test --config .artifacts/plurid-upgrade/playwright.config.mjs
```

That command tests the currently built UI. Rebuild against the dependency chain
under investigation first. Failure traces are in `.artifacts/plurid-upgrade/results/`.
The artifact directory is ignored; the steps and acceptance criteria above are the
durable reproduction. Hypod's prior manifests, lockfile and patch are retained
until this upgrade gate is satisfied. No new package was published.
