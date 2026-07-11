/**
 * CMS Domain Events — minimal in-process typed event bus.
 *
 * RELIABILITY DISCLAIMER (documented as required):
 *  • Events are in-process only — no delivery guarantee across serverless instances.
 *  • Subscribers may fail silently (logged, never rethrown).
 *  • Critical persistence (DB writes, audit) must NOT rely solely on event delivery.
 *  • Future migration to a durable queue/outbox is possible — event shape is stable.
 *
 * ARCHITECTURE:
 *  • Resource services emit events AFTER successful mutations.
 *  • Subscribers handle cross-cutting concerns: cache invalidation, notifications (future).
 *  • No business logic in subscribers — they are integration adapters.
 */
import type { CmsRecord } from "./types";
import { logger }         from "@/lib/logger";

// ─── Event shape ──────────────────────────────────────────────────────────────
export interface CmsDomainEvent<T extends CmsRecord = CmsRecord> {
  eventId:    string;         // crypto.randomUUID()
  eventType:  string;         // e.g. "doctor.created", "blog_post.published"
  occurredAt: string;         // ISO timestamp
  actor:      { id: string; role: string };
  resource:   string;         // e.g. "doctor"
  resourceId: string;
  payload?:   Partial<T>;     // changed/created record snapshot
  meta?:      Record<string, unknown>;
  requestId?: string;
}

// ─── Subscriber ───────────────────────────────────────────────────────────────
type EventSubscriber<T extends CmsRecord = CmsRecord> = (
  event: CmsDomainEvent<T>
) => Promise<void>;

// ─── In-process event bus ─────────────────────────────────────────────────────
const subscribers = new Map<string, EventSubscriber[]>();

/** Subscribe to a specific event type. Returns an unsubscribe function. */
export function onCmsEvent<T extends CmsRecord>(
  eventType:  string,
  subscriber: EventSubscriber<T>,
): () => void {
  const list = subscribers.get(eventType) ?? [];
  list.push(subscriber as EventSubscriber);
  subscribers.set(eventType, list);
  return () => {
    const updated = (subscribers.get(eventType) ?? []).filter(s => s !== subscriber);
    subscribers.set(eventType, updated);
  };
}

/**
 * Emit a domain event. Subscribers are called concurrently.
 * Subscriber failures are logged and isolated — never propagated.
 */
export async function emitCmsEvent<T extends CmsRecord>(
  event: CmsDomainEvent<T>,
): Promise<void> {
  const handlers = subscribers.get(event.eventType) ?? [];
  if (handlers.length === 0) return;

  const results = await Promise.allSettled(
    handlers.map(h => h(event as CmsDomainEvent))
  );

  for (const result of results) {
    if (result.status === "rejected") {
      logger.warn("[CmsEvent] Subscriber failed", {
        eventType:  event.eventType,
        resource:   event.resource,
        resourceId: event.resourceId,
        err:        String(result.reason),
      });
    }
  }
}

/** Convenience builder for a CmsDomainEvent. */
export function buildCmsEvent<T extends CmsRecord>(
  eventType:  string,
  resource:   string,
  resourceId: string,
  actor:      { id: string; role: string },
  payload?:   Partial<T>,
  meta?:      Record<string, unknown>,
): CmsDomainEvent<T> {
  return {
    eventId:    crypto.randomUUID(),
    eventType,
    occurredAt: new Date().toISOString(),
    actor,
    resource,
    resourceId,
    payload,
    meta,
  };
}
