# Proposal: a calmer shopping list, then markets

Status: design and objection resolutions approved by the engineer on 2026-11-17.
Implementation starts only after the plan and matching objection record are
committed; review the visual foundation before starting market behavior.

## Story

As a shopper visiting different stores, I want one clear shopping list that I can
filter by my planned market, so I can see what to buy at each stop without losing
the overall list.

## Confirmed direction

- Redesign first; do not add application components in this proposal.
- Calm, compact checklist, warm neutral background, restrained green accent,
  and clear category sections.
- One planned market per item. Buying that item completes it in the shared list.
- Keep unassigned items visible in a dedicated view.
- Fixed starter markets: Hofer, Billa, Lidl, Bauhaus. Market management comes later.
- Split delivery into separately reviewable tasks. No framework upgrade required.

### Approved objection resolutions

- **O1 (market task):** Keep an affected item's displayed purchase state and market
  membership, and their count contributions, unchanged until its Firebase write
  promise resolves. A local value event is not server acknowledgment. Preserve
  retryable state on rejection; do not announce completion or movement on failure.
  Keep receiving updates for other records; do not freeze the whole collection.
- **O2 (visual foundation):** Normalize a null Firebase collection to an empty
  list. Test the transition from an empty collection to the first created item.
  The market task also tests all six zero-count filters on an empty collection.
- **O3 (market task):** After an acknowledged market edit removes the focused row
  from the active view, focus the selected market's filter and politely announce
  the destination. Cover moving the last item out of a market. Do not steal focus
  if the user has already moved focus elsewhere while the write was pending.

## Current experience and constraints

The app renders a tall card per item, a global edit toggle, and a fixed add button.
Categories are colored chips; items are sorted by category identifier.
The add/search dialog fills the screen and reuses previously bought items.
The header exposes a version string rather than useful shopping context.

`src/App.tsx` owns Firebase reads, writes, and list state. `GroceryList` and
`SearchDialog` receive props and callbacks. Records live under `/groceries`.
The existing fields are `id`, `name`, `buyed`, and `area`; there is no market field.
Existing records can lack `area` even though the current interface requires it.
Keep category identifiers and `buyed` unchanged; this is not a data cleanup.

## Recommended design

### Information hierarchy

1. A useful title: **Einkaufsliste**, with the outstanding item count.
2. One horizontal market filter strip, not another app-level navigation bar.
3. Category headings and compact, left-aligned checklist rows.
4. One persistent **Hinzufuegen** action, with content clearance beneath it.
5. A quiet **Bearbeiten** action retaining the existing list-wide edit workflow.

Use proper German accents in the eventual UI; the sketches use ASCII.
Keep the proposal's visuals deliberately independent of new components.
Do not introduce a sidebar, dashboard cards, store logos, or a second bottom bar.

### Mobile sketch: final market experience

```text
+--------------------------------------+
| Einkaufsliste                        |
| 9 offen                  Bearbeiten  |
|                                      |
| [Alle 9] [Ohne Markt 2] [Hofer 4] >   |
|                                      |
| Obst & Gemuese                        |
| [ ] Tomaten                  Hofer   |
| [ ] Aepfel                   Billa   |
|                                      |
| Milchprodukte & Eier                 |
| [ ] Milch                    Hofer   |
|                                      |
| Sonstiges                            |
| [ ] Schrauben                Bauhaus |
|                                      |
|            [+ Hinzufuegen]           |
+--------------------------------------+
```

Counts are illustrative, not a complete fixture. The right edge signals more
filters: Billa, Lidl, Bauhaus. Swipe or use the strip's scroll controls.
Keep filters on one row; allow horizontal scrolling instead of wrapping.
At 320 CSS pixels, only the filter strip may overflow horizontally.

### Selected market

```text
+--------------------------------------+
| Einkaufsliste                        |
| 4 bei Hofer / 9 insgesamt             |
|                                      |
| [Alle 9] [Ohne Markt 2] [HOFER 4] >   |
|                                      |
| Obst & Gemuese                        |
| [ ] Tomaten                          |
|                                      |
| Milchprodukte & Eier                 |
| [ ] Milch                            |
|                                      |
|            [+ Hinzufuegen]           |
+--------------------------------------+
```

The selected market is conveyed by text and selected styling, not color alone.
Hide redundant row-level market labels inside a specific market view.
Show them in **Alle**, including **Ohne Markt** for unassigned items.
Completing the last Hofer item says **Bei Hofer alles erledigt**, not that the
whole shopping list is complete. Keep other filters reachable.

### Desktop adaptation

Keep the same single-column model in a centered container, maximum width 720px.
Show the full strip when space allows. Do not scatter stores across columns:
the main task remains checking items off, not comparing markets.

### Visual system

| Element | Proposal |
| --- | --- |
| Page / surface | Warm neutral `#F7F6F2` / white `#FFFFFF` |
| Text / secondary | `#202923` / `#56635A` |
| Accent | Deep green `#245C3A`; white action text |
| Shape / spacing | 12px surface corners; 4/8/12/16/24px spacing scale |
| Type | Existing system font; 24px title, 16px rows, 14px secondary text |
| Rows | At least 48px tall; 44px minimum interactive targets |
| Category | Quiet heading plus divider; do not rely on colored chips |
| Motion | Respect reduced-motion preference; no blocking success animation |

Use visible keyboard focus, labeled purchase controls, and a polite live status
for count/completion updates. Verify contrast rather than assuming these tokens
are sufficient in every state. At 200% zoom, preserve readable content and actions.

### Add and edit

Retain the existing full-screen add/search dialog for the first visual refresh.
Restyle its header, labels, rows, and empty states consistently; do not replace it
with a new drawer or sheet.

In the market task, add a labeled market selector to that dialog:

- Opening from a specific market defaults to that market.
- Opening from **Alle** or **Ohne Markt** defaults to **Ohne Markt**.
- Search bought history across all markets, displaying each item's saved market.
- Re-adding an existing item preserves its saved market by default; show that
  market on the re-add action, even when it differs from the current view.
- Deliberately changing the selector overrides the saved market when re-adding.
- Explain the destination in the success message when the item lands outside
  the current filter. Do not silently duplicate it or move it to the active market.
- Adding a new item requires a non-blank trimmed name. Always show an explicit
  create action for valid text, including when matches exist.
- Already-active matches are labeled as already on the list, not re-addable.
- In edit mode, assign or change a market alongside the current name/category
  controls. Preserve immediate-save behavior; use **Fertig**, not a fake save step.
- On failed writes, show an actionable error, retain input, and do not claim success.
  Keep the item visible until Firebase confirms its updated state.

These are behavior changes for the market task, not the initial visual refresh.

## Data and interaction decision (ADR)

- **Status:** Accepted on 2026-11-17; implementation pending.
- **Context:** The current shared Firebase collection represents reusable shopping
  entries. The user wants one planned market per entry, not independent store lists.
- **Decision:** Add optional `marketId` with stable values `hofer`, `billa`, `lidl`,
  `bauhaus`. Missing or null means unassigned; write null to clear the field.
  Do not persist a filter value such as `all` or an unassigned sentinel.
  Keep the fixed market catalog in source, not a new Firebase collection.
  Derive the visible list and counts from one subscribed collection.
- **Consequences:** No bulk migration. Older records remain visible. Legacy
  clients preserve the extra field on narrow updates but create unassigned items.
  Unknown market IDs appear in **Ohne Markt** with a repair hint in edit mode;
  never silently hide records or overwrite their stored value on read.
  Buying remains global, and category remains separate from market.
- **Selection:** Start at **Alle** on each app load. Selection is local UI state,
  not a shared database setting. No routing or local-storage requirement.
- **Security boundary:** The new property must be checked against deployed
  Firebase validation rules before release. This repository does not contain
  those rules; do not loosen access or copy production data into tests.

## Acceptance criteria

- **AC-01:** Visual refresh preserves add, re-add, buy, name/category editing,
  loading, retry, and empty-list flows before market behavior is introduced.
- **AC-02:** Final filters are Alle, Ohne Markt, Hofer, Billa, Lidl, Bauhaus in that
  order, with outstanding-item counts, including zero-count markets.
- **AC-03:** Each outstanding item appears once in Alle and once in its market
  view (or Ohne Markt); bought items do not contribute to any outstanding count.
- **AC-04:** Existing records without a market remain usable; no migration or
  mass rewrite runs. Unknown values remain recoverable.
- **AC-05:** Creating, re-adding, editing, and completing follow the explicit
  destination and error rules above, with realtime updates across open clients.
- **AC-06:** Missing/unknown categories render under Sonstiges. Preserve known
  category order by current identifiers and sort a copied array, never props.
- **AC-07:** At 320px, 390px, and 1280px widths and 200% zoom, list content is not
  hidden by the fixed action. Keyboard users can reach every filter and action.
- **AC-08:** A completed store, an empty store, loading, read failure, and write
  failure have distinct feedback. Navigation remains available.
- **AC-09:** No dependency/framework upgrade, custom market management,
  quantities, prices, multi-market membership, independent store lists, or
  new offline-write guarantees are included.

## Delivery split and review gates

| Task | Scope | Dependency / gate |
| --- | --- | --- |
| A: Redesign agreement | Review this proposal and implementation plan | Design and O1-O3 resolutions approved; documents only |
| B: Visual foundation | Refresh existing shell, rows, category sections, dialog, and states; no market controls | A approved; test existing interactions first |
| C: Markets end-to-end | Data field, derived filters/counts, assignment, add/re-add destination, errors | B reviewed; rules compatibility verified before release |

Keep C one coherent task so that a filter-only UI cannot ship without safe add,
edit, and re-add behavior. Tests and documentation belong with B and C, not a
separate later quality task. Review B before starting C.

No application code, dependencies, Firebase records, commits, pushes, or
deployments are changed by this proposal. After approval, commit the temporary
plan and matching objection record before implementation; delete both when the
implementation is complete. Retain the story as the product decision record.

## Recommendations for Implementing

### Existing patterns to carry forward

- **Keep Firebase ownership and data flow in `src/App.tsx`.** `App` subscribes to
  `/groceries`, owns the collection and derived outstanding list, and writes
  purchase/name/category changes with narrow `update(...)` calls; creation uses
  `push(...)`. `GroceryList` and `SearchDialog` receive data and callbacks rather
  than accessing Firebase. Add market assignment and selected-filter state at
  this existing boundary, and pass derived data/actions down. Do not add a
  service layer, router, or state library. Keep the existing `buyed` and
  category identifiers. For Task C, treat absent/null `marketId` as unassigned
  and preserve unknown values; check deployed Firebase rules before release.
- **Preserve component-specific UI conventions.** `GroceryList` uses
  `src/GroceryList/GroceryList.css`, while `SearchDialog` uses MUI 4
  `makeStyles`/`createStyles`; the list currently sorts its input in place.
  Keep the dialog's established styling approach, and sort a copied list in
  the redesign so props and the subscribed collection are not mutated.
  `App`/`GroceryList` are class components and `SearchDialog` is a hooks
  function; the current framework does not require converting them.
- **Extend the existing test style, but cover new behavior rather than only
  rendering.** `src/App.test.tsx` mocks `./shared/config` and checks loading;
  `src/GroceryList/GroceryList.test.tsx` renders a typed fixture with callback
  mocks. Both use `ReactDOM.render` and unmount. Follow that Jest/ReactDOM
  pattern (and `act`/`Simulate` where interaction is needed), with no new test
  dependencies. There is no `SearchDialog` test today. Add focused coverage
  for its changed search/create/re-add behavior and for market selection,
  counts, legacy/unassigned and unknown values, and write failures at the
  owning component boundary.
- **Keep delivery gates aligned with repository configuration.** `package.json`
  and `vercel.json` run tests before the production build; repository wrappers
  are `node scripts\run_tests.js` and `node scripts\run_build.js`. Preserve
  that gate and the current dependency/framework versions. Update
  `_wiki/architecture.md` when the market data flow or ownership changes, and
  keep implementation documentation with Tasks B/C as the delivery plan
  requires. Do not add Firebase rules or copy production data into tests;
  rules are external to this repository.

### Decisions and application to the staged work

The codebase has **mixed styling and test-artifact coverage**: CSS files are
used by the app/list while the dialog styles itself with `makeStyles`; the app
and list have tests while the dialog does not. These are precedents, not a
single repository-wide optional-artifact rule. For this story, the low-risk
choice is to retain each existing component's styling convention and add
dialog tests because its behavior changes. If implementation introduces a new
component, the engineer should decide whether it follows its host's styling
approach; do not create a new styling convention implicitly.

Keep Task A documentation-only. In Task B, refresh the existing shell, list,
and dialog while preserving current add, re-add, buy, edit, loading, retry,
and empty-list flows. In Task C, add the optional market field and local
filtering/counts to the existing shared collection, then implement assignment,
creation, and re-add destination rules together. Verify at each stage using
the configured test/build gate and the story's accessibility, responsive, and
failure-state acceptance criteria.
