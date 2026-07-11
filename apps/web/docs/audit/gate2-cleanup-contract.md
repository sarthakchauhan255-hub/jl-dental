# Gate 2 — Upload Cleanup Contract

Architecture and storage contract only. No worker/cron execution — delivered in Phase 7.

## State Machine

```
pending ──────► retrying ──────► cleaned
   │                │
   │                └────────► failed (maxAttempts exhausted)
   │
   └──────────────────────────► cleaned (direct success)

failed ──────► retrying (manual admin-triggered retry only)
```

## Schema

`models/MediaPendingCleanup.ts`

| Field | Type | Purpose |
|---|---|---|
| `status` | `pending \| retrying \| cleaned \| failed` | State machine position |
| `retryCount` | `number` | Attempts made so far |
| `maxAttempts` | `number` | Default 3 — configurable per-document |
| `lastAttemptAt` | `Date \| null` | Last deletion attempt timestamp |
| `nextRetryAt` | `Date \| null` | Worker query target for retry scheduling |
| `reason` | enum | `abandoned_upload \| entity_save_failed \| image_replaced \| entity_deleted` |
| `lastError` | `string \| null` | Most recent failure message |
| `relatedResource` / `relatedResourceId` | `string \| null` | Debugging context, not enforced |

## Transition Rules

Exported as `CLEANUP_TRANSITIONS` + `isValidCleanupTransition(from, to)` — the future
worker imports these rather than re-deriving the state machine.

## Indexes

- `{ createdAt: 1 }` TTL 7 days — safety net against indefinite growth
- `{ status: 1, nextRetryAt: 1 }` — worker query pattern for retry scheduling
- `{ status: 1, uploadedAt: 1 }` — worker query pattern for initial cleanup pass

## Integration Point

`app/api/uploads/route.ts` creates a `pending` record with `reason: "abandoned_upload"`
immediately after every successful Cloudinary upload. This is the only write path in
Phase 5 — no read/transition logic implemented yet.

## Explicitly Not Implemented (Phase 7 scope)

- Cron job to scan `pending`/`retrying` records
- Actual `deleteFromCloudinary()` invocation against queued records
- Transition execution logic
- Admin UI for manually retrying `failed` records
