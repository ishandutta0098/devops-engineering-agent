import type { ConceptDef } from "@/lib/schema";
import { CodeBlock } from "./CodeBlock";

export function ConceptBlock({ concept }: { concept: ConceptDef }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-headline text-headline-sm text-ink">{concept.title}</h3>
        <p className="font-body text-body-md text-gray2 mt-2 leading-relaxed">
          {concept.description}
        </p>
      </div>
      <CodeBlock
        code={concept.code}
        title={concept.title.toLowerCase().replace(/\s+/g, "_")}
        language={concept.language ?? "python"}
      />
    </div>
  );
}
