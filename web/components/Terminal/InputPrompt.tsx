"use client";

import type { FieldDef } from "@/lib/schema";

export function InputPrompt({
  schema,
  values,
  onChange,
  disabled,
  accent = "#FFBF00",
}: {
  schema: FieldDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
  accent?: string;
}) {
  return (
    <div className="space-y-5">
      {schema.map((field) => (
        <div key={field.key} className="space-y-2">
          <label
            className="block font-headline text-[10px] tracking-widest uppercase font-bold"
            style={{ color: accent }}
          >
            <span className="text-gray3 mr-2">{">>>"}</span>
            {field.label}
          </label>

          {field.kind === "textarea" ? (
            <textarea
              className="w-full bg-surface border border-hairline rounded-sm px-3 py-2 font-code text-sm text-ink placeholder-gray3 focus:outline-none focus:border-current resize-none disabled:opacity-60"
              style={{ caretColor: accent }}
              rows={field.rows ?? 4}
              value={values[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(e) => onChange(field.key, e.target.value)}
              disabled={disabled}
            />
          ) : field.kind === "select" ? (
            <select
              className="w-full bg-surface border border-hairline rounded-sm px-3 py-2 font-code text-sm text-ink focus:outline-none focus:border-current disabled:opacity-60"
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              disabled={disabled}
            >
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="w-full bg-surface border border-hairline rounded-sm px-3 py-2 font-code text-sm text-ink placeholder-gray3 focus:outline-none focus:border-current disabled:opacity-60"
              style={{ caretColor: accent }}
              value={values[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(e) => onChange(field.key, e.target.value)}
              disabled={disabled}
            />
          )}
        </div>
      ))}
    </div>
  );
}
