export type LogTag =
  | "BOOT"
  | "INFO"
  | "OK"
  | "STREAM"
  | "WARN"
  | "ERROR"
  | "SUCCESS"
  | "PROCESS"
  | "GUARDRAIL"
  | "RETRY";

export type LogLine = {
  tag?: LogTag;
  text: string;
  ts?: string;
};

export type FieldDef = {
  key: string;
  label: string;
  kind: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  rows?: number;
};

export type FixturePair = {
  label: string;
  description: string;
  log: LogLine[];
  output: string;
};

export type ConceptDef = {
  id: string;
  title: string;
  description: string;
  code: string;
  language?: string;
};

export type ChapterDef = {
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  objective: string;
  concepts: ConceptDef[];
  inputSchema: FieldDef[];
  fixtures: {
    baseline: FixturePair;
    enhanced: FixturePair;
  };
  agentConfig: {
    role: string;
    goal: string;
    backstory: string;
  };
  highlightParam?: string;
};
