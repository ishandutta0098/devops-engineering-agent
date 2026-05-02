import { Code2 } from "lucide-react";

const RAW_BLOCK = `>>> type(result.raw)
<class 'str'>  # just a string, no structure`;

const PYDANTIC_BLOCK = `>>> report = result.pydantic
>>> report.primary_issue
'Production deployment failed due to ImagePullBackOff'
>>> len(report.errors)
4
>>> type(report)
<class 'LogAnalysisReport'>  # fully typed!`;

export function TypedAccessSection() {
  return (
    <div>
      <h2 className="font-headline text-headline-md text-ink mb-2">
        Typed access in Python
      </h2>
      <p className="font-body text-sm text-gray2 mb-6">
        Once the task is configured with <span className="font-code text-amber">output_pydantic</span>,
        the result behaves like a normal typed object instead of a string you have to parse.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface-low border border-hairline rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline">
            <Code2 className="w-3.5 h-3.5 text-[#FF5F57]" />
            <span className="font-code text-[10px] tracking-widest uppercase text-[#FF5F57]">
              Without output_pydantic
            </span>
          </div>
          <pre className="p-4 font-code text-[12px] leading-relaxed text-ink whitespace-pre-wrap">
{RAW_BLOCK}
          </pre>
        </div>
        <div className="bg-surface-low border border-amber/40 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-amber/30">
            <Code2 className="w-3.5 h-3.5 text-amber" />
            <span className="font-code text-[10px] tracking-widest uppercase text-amber">
              With output_pydantic = LogAnalysisReport
            </span>
          </div>
          <pre className="p-4 font-code text-[12px] leading-relaxed text-ink whitespace-pre-wrap">
{PYDANTIC_BLOCK}
          </pre>
        </div>
      </div>
    </div>
  );
}
