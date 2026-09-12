# Micro-Rework: BHD-718 round 3 (hygiene-only)

## 1. Remove committed junk
Removed `bhd718-rework.md` from the git cache (`git rm --cached bhd718-rework.md`), keeping it untracked.

## 2. Restore core test file
Restored `src/lib/dsl/roundtrip.test.ts` to `0d3f8cd` content exactly (removed the `console.log(errors)` debug lines) without checking out or clobbering other files.

## 3. Verify
- `git diff 0d3f8cd -- src/lib/dsl/roundtrip.test.ts`: EMPTY
- `git ls-tree HEAD --name-only | grep bhd718`: EMPTY
- SHA: 4ddd20c

## 4. Full suite
- `npm test` counts: `2534 passed | 3 failed | 26 skipped` (135 files).
