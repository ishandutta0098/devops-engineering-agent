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

export type FixturePair = {
  label: string;
  description: string;
  log: LogLine[];
  output: string;
};

export type DemoOption = {
  key: string;
  label: string;
  description: string;
};

export type DemoDef = {
  id: string;
  question: string;
  controlLabel: string;
  options: DemoOption[];
  defaultLeft: string;
  defaultRight: string;
  variants: Record<string, FixturePair>;
};

export type ChapterDef = {
  slug: string;
  number: number;
  phase: "Notebook 01" | "Notebook 02";
  phaseTitle: string;
  title: string;
  subtitle: string;
  intro: string;
  progression: string;
  takeaway: string;
  demos: DemoDef[];
  agentConfig: {
    role: string;
    goal: string;
    backstory: string;
  };
};
