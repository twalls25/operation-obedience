"use client";

import { useState } from "react";
import { createResource } from "../actions";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS, type ResourceType } from "@/lib/resources/types";

export function NewResourceForm() {
  const [type, setType] = useState<ResourceType>("book");
  const isPlan = type === "plan";

  return (
    <form action={createResource} className="mt-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-offwhite">
        Type
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          className="rounded-md border border-panel bg-charcoal px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
        >
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {RESOURCE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-offwhite">
        Title
        <input
          name="title"
          type="text"
          required
          className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-offwhite">
        Author / Speaker (optional)
        <input
          name="author"
          type="text"
          className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-offwhite">
        Description
        <textarea
          name="description"
          required
          rows={3}
          className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
        />
      </label>

      {isPlan ? (
        <label className="flex flex-col gap-1 text-sm text-offwhite">
          Weekly breakdown
          <textarea
            name="content"
            required
            rows={10}
            placeholder={"Week 1: ...\nWeek 2: ..."}
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite placeholder:text-muted focus:border-ember focus:outline-none"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-sm text-offwhite">
          External link (optional)
          <input
            name="link"
            type="url"
            className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
          />
        </label>
      )}

      <button
        type="submit"
        className="mt-2 rounded-md bg-ember px-4 py-2 font-medium text-charcoal hover:bg-ember/90"
      >
        Add resource
      </button>
    </form>
  );
}
