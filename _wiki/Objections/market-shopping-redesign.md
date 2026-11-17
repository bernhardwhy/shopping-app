---
mode: spec
spec: "_wiki/plans/market-shopping-redesign.md"
slug: market-shopping-redesign
objections:
  - id: O1
    category: failure
    severity: major
    disposition: accepted
    disposition_rationale: "Engineer approved the recommended resolution on 2026-11-17: keep affected rows and count contributions stable until write acknowledgment; retain retryable state on rejection. Incorporated into REQ-007, TASK-011A/017, and TEST-004."
  - id: O2
    category: failure
    severity: major
    disposition: accepted
    disposition_rationale: "Engineer approved the recommended resolution on 2026-11-17: normalize null collections to an empty list and cover zero counts plus the first-item transition. Incorporated into REQ-012, TASK-001/005/011A, and TEST-001/004."
  - id: O3
    category: design
    severity: minor
    disposition: accepted
    disposition_rationale: "Engineer approved the recommended resolution on 2026-11-17: focus the selected market filter after moving its focused row out and announce the destination. Incorporated into REQ-013, TASK-012A/018, and TEST-008; do not steal focus already moved elsewhere."
---

# Spec objections: market shopping redesign

## Summary

Three objections: failure 2 major; design 1 minor. Major objections raised: yes.
All three accepted for incorporation into the plan on 2026-11-17; no pending
dispositions. Acceptance resolves the design decisions, not implementation
verification. Original objection bodies are retained below.
No candidates omitted. Mode: spec. Slug: market-shopping-redesign.
Premise, threat, operational, and cost produced no additional objections meeting
the evidence bar.

## O1 - failure - major

REQ-007 and TASK-017 require an item to remain visible until its write is
confirmed, while deriving visible items from every Firebase value event.
Firebase client value events can reflect a local write before the write promise
resolves. Filtering those events immediately can remove an item and announce
completion before a rejected write returns it to the list.

The existing App callbacks do not track pending operations. The plan asks for
reconciliation but does not choose how locally optimistic snapshots interact
with the visibility requirement, and the test tasks do not explicitly deliver a
local bought snapshot before rejecting its write.

Resolve the visibility contract before C: specify pending-item behavior and add
the local-event-before-acknowledgment/rejection case. Do not equate any value event
with a server acknowledgment.

## O2 - failure - major

TASK-001/011 exercise snapshots of records, but neither explicitly covers a
Firebase snapshot whose value is null. An empty Firebase collection produces
null, and the current `App.fetchData` passes that value to `Object.values`.
The proposed all-zero filters and initial empty-list experience therefore remain
unverified on a genuinely empty database.

Add a null-snapshot fixture and define normalization to an empty collection,
including the transition from empty to the first created item. This is necessary
for AC-02/04/08, not a general database refactor.

## O3 - design - minor

TASK-018 keeps immediate-save editing and filters an item by its newly assigned
market. Changing an item's market while viewing its old market can remove the
focused row from the DOM. The proposal requires keyboard reachability but does
not specify where focus goes after this deliberate move.

Choose a predictable focus destination and movement announcement; test moving
the last item out of a selected market. Keeping the old row until an explicit
save would instead change the agreed immediate-save interaction.

## Consolidation: follow-up spec pass on 2026-11-17

Reviewed the revised plan and story after the engineer approved O1-O3 resolutions.
The plan now distinguishes local value events from server acknowledgment, adds
null/first-item cases, and specifies acknowledgment-dependent focus movement.
Rechecked premise, design, threat, failure, operational, and cost.
No additional objections meeting the evidence bar; no candidates omitted.
O1-O3 retain their original prose and IDs. No O4 was added. Release still requires
external Firebase rule verification. Actual implementation must pass the new
ordering, failure, and focus tests before these behaviors can be called verified.

## Explicitly not objecting to

- Redesigning existing components before adding market behavior.
- Using one optional planned market per shared item and no bulk migration.
- Keeping the fixed four-market catalog in source rather than Firebase.
- Using accessible selected filter buttons rather than introducing ARIA tabs.
- Requiring authorized verification of external Firebase rules before release.
- Preserving a bought item's saved market by default, with explicit override.
