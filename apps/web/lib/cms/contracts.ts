/**
 * CMS Resource Service Contract.
 *
 * ARCHITECTURE:
 *  • Generic persistence primitives only — no business lifecycle method names.
 *  • Business operations (archive, publish, approve, etc.) are resource-specific.
 *    Resources implement them by calling update() with their own domain fields.
 *  • The base class provides update() and bulkUpdate() — resources compose from these.
 *  • No hardcoded field names ("isActive", "status") anywhere in this file.
 *  • No "as unknown as" casts caused by business assumptions.
 */
import type {
  CmsRecord, CmsListResponse, CmsMutationResult, CmsListQuery,
} from "./types";

export interface CmsResourceService<
  T extends CmsRecord,
  CreateInput extends Record<string, unknown> = Record<string, unknown>,
  UpdateInput extends Record<string, unknown> = Partial<CreateInput>,
> {
  // ─── Read ────────────────────────────────────────────────────────────────
  findMany(query: CmsListQuery):               Promise<CmsListResponse<T>>;
  findOne(id: string):                         Promise<T | null>;
  exists(id: string):                          Promise<boolean>;
  count(query?: Partial<CmsListQuery>):        Promise<number>;

  // ─── Write ───────────────────────────────────────────────────────────────
  create(input: CreateInput):                  Promise<CmsMutationResult<T>>;
  update(id: string, input: UpdateInput):      Promise<CmsMutationResult<T>>;
  delete(id: string):                          Promise<CmsMutationResult<void>>;
  bulkDelete(ids: string[]):                   Promise<CmsMutationResult<void>>;
  bulkUpdate(ids: string[], patch: Partial<UpdateInput>): Promise<CmsMutationResult<void>>;

  // ─── Soft delete — optional; resource must define deletion semantics ──────
  // Renamed from "archive"/"restore" to be persistence-neutral.
  // Resources implement by calling update() with their own domain fields.
  softDelete?(id: string):              Promise<CmsMutationResult<void>>;
  undoSoftDelete?(id: string):          Promise<CmsMutationResult<void>>;
  duplicate?(id: string):               Promise<CmsMutationResult<T>>;
}

/**
 * ApiResourceService — base REST adapter for CmsResourceService.
 *
 * Contains only persistence primitives.
 * Business lifecycle operations (publish, archive, approve, etc.) are NOT here.
 * Resources that need those implement them in their own service subclass
 * by calling update() with the appropriate domain fields.
 *
 * Example resource subclass:
 *
 *   class BlogService extends ApiResourceService<BlogRecord, BlogInput> {
 *     async publish(id: string) {
 *       return this.update(id, { status: "published", publishedAt: new Date().toISOString() });
 *     }
 *     async archive(id: string) {
 *       return this.update(id, { status: "archived" });
 *     }
 *   }
 *
 *   class DoctorService extends ApiResourceService<DoctorRecord, DoctorInput> {
 *     async activate(id: string)   { return this.update(id, { isActive: true  }); }
 *     async deactivate(id: string) { return this.update(id, { isActive: false }); }
 *   }
 */
export abstract class ApiResourceService<
  T extends CmsRecord,
  CreateInput extends Record<string, unknown> = Record<string, unknown>,
  UpdateInput extends Record<string, unknown> = Partial<CreateInput>,
> implements CmsResourceService<T, CreateInput, UpdateInput> {

  constructor(protected readonly apiPath: string) {}

  // ─── Read ────────────────────────────────────────────────────────────────
  async findMany(query: CmsListQuery): Promise<CmsListResponse<T>> {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") {
        params.set(k, String(v));
      }
    }
    const res  = await fetch(`${this.apiPath}?${params}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`GET ${this.apiPath} failed: ${res.status}`);
    const json = await res.json() as { data: T[]; pagination: CmsListResponse<T>["pagination"] };
    return { data: json.data, pagination: json.pagination };
  }

  async findOne(id: string): Promise<T | null> {
    const res  = await fetch(`${this.apiPath}/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GET ${this.apiPath}/${id} failed: ${res.status}`);
    const json = await res.json() as { data: T };
    return json.data;
  }

  async exists(id: string): Promise<boolean> {
    return (await this.findOne(id)) !== null;
  }

  async count(query: Partial<CmsListQuery> = {}): Promise<number> {
    const result = await this.findMany({ ...query, limit: 1 });
    return result.pagination.total;
  }

  // ─── Write ───────────────────────────────────────────────────────────────
  async create(input: CreateInput): Promise<CmsMutationResult<T>> {
    const res = await fetch(this.apiPath, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(input),
    });
    return res.json() as Promise<CmsMutationResult<T>>;
  }

  async update(id: string, input: UpdateInput): Promise<CmsMutationResult<T>> {
    const res = await fetch(`${this.apiPath}/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(input),
    });
    return res.json() as Promise<CmsMutationResult<T>>;
  }

  async delete(id: string): Promise<CmsMutationResult<void>> {
    const res = await fetch(`${this.apiPath}/${id}`, { method: "DELETE" });
    if (res.status === 204) return { success: true };
    return res.json() as Promise<CmsMutationResult<void>>;
  }

  async bulkDelete(ids: string[]): Promise<CmsMutationResult<void>> {
    const results = await Promise.allSettled(ids.map(id => this.delete(id)));
    const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    return failures.length > 0
      ? { success: false, error: `${failures.length} of ${ids.length} deletions failed` }
      : { success: true };
  }

  async bulkUpdate(ids: string[], patch: Partial<UpdateInput>): Promise<CmsMutationResult<void>> {
    const results = await Promise.allSettled(ids.map(id => this.update(id, patch as UpdateInput)));
    const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    return failures.length > 0
      ? { success: false, error: `${failures.length} of ${ids.length} updates failed` }
      : { success: true };
  }

  // ─── Optional persistence-layer soft delete ───────────────────────────────
  // Resources that implement soft delete should override these and PATCH
  // their own deletion-marker field (e.g., { deletedAt: new Date() }).
  // The field name and semantics are resource-defined.
  // Default: throws to signal the resource must implement its own semantics.
  async softDelete(_id: string): Promise<CmsMutationResult<void>> {
    throw new Error("softDelete is not implemented for this resource. Override in your service subclass.");
  }

  async undoSoftDelete(_id: string): Promise<CmsMutationResult<void>> {
    throw new Error("undoSoftDelete is not implemented for this resource. Override in your service subclass.");
  }

  async duplicate(id: string): Promise<CmsMutationResult<T>> {
    const record = await this.findOne(id);
    if (!record) return { success: false, error: "Record not found" };
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = record;
    const input = {
      ...rest,
      ...(typeof rest.name === "string" ? { name: `${rest.name} (copy)` } : {}),
    } as unknown as CreateInput;
    return this.create(input);
  }
}
