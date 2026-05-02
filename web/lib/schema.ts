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
  paramSnippet?: string;
};

export type DemoOption = {
  key: string;
  label: string;
  description: string;
};

export type DemoInputFile = {
  filename: string;
  preview: string;
};

export type DemoDef = {
  id: string;
  question: string;
  controlLabel: string;
  options: DemoOption[];
  defaultLeft: string;
  defaultRight: string;
  variants: Record<string, FixturePair>;
  inputFile?: DemoInputFile;
};

export type LogExampleId = "kubernetes" | "database" | "cron";

export type LogExample = {
  id: LogExampleId;
  title: string;
  summary: string;
  file: string;
  logFile: string;
  result: FixturePair;
};

export type IterationStep = {
  label: string;
  detail?: string;
  status: "OK" | "RETRY" | "FAIL" | "INFO";
  duration?: string;
};

export type IterationCycle = {
  label: string;
  status: "OK" | "FAIL" | "CAPPED";
  steps: IterationStep[];
};

export type IterationRun = {
  key: string;
  label: string;
  description: string;
  params: { max_iter: number; max_rpm: number | null; max_execution_time: number | null };
  iterations: IterationCycle[];
  verdict: { status: "SUCCESS" | "FAILED"; summary: string };
};

export type IterationDemo = {
  question: string;
  runs: IterationRun[];
};

export type WebSearchResult = {
  title: string;
  source: string;
  snippet: string;
};

export type WebSearchQuery = {
  query: string;
  results: WebSearchResult[];
};

export type WebSearchDemo = {
  toolInput: string;
  queries: WebSearchQuery[];
  compiledContext: string;
};

export type ContextHandoffDemo = {
  analyzerOutput: string;
  contextPayload: string;
  researcherWithoutContext: string;
  researcherWithContext: string;
};

export type CrewIterationKind = "tool" | "reason" | "retry" | "context";

export type CrewIteration = {
  kind: CrewIterationKind;
  label: string;
  detail?: string;
  status?: "OK" | "FAIL" | "INFO";
};

export type CrewAgentLane = {
  role: string;
  tools: string[];
  iterations: CrewIteration[];
  contextOut: string;
};

export type CrewDemo = {
  agents: CrewAgentLane[];
};

export type GuardrailAttempt = {
  output: string;
  status: "FAIL" | "PASS";
  feedback?: string;
};

export type GuardrailRun = {
  rule: string;
  ruleSummary: string;
  attempt1: GuardrailAttempt;
  attempt2: GuardrailAttempt;
  finalOutput: string;
};

export type GuardrailDemo = {
  trickyLog: string;
  code: GuardrailRun;
  string: GuardrailRun;
};

export type PipelineEventKind =
  | "tool"
  | "iteration"
  | "guardrail"
  | "pydantic"
  | "artifact"
  | "context";

export type PipelineEvent = {
  agent: "Analyzer" | "Researcher" | "PlanWriter";
  kind: PipelineEventKind;
  label: string;
  detail?: string;
  payload?: string;
  status?: "OK" | "FAIL" | "RETRY" | "INFO";
};

export type PipelineTimelineDemo = {
  events: PipelineEvent[];
};

export type ChapterDef = {
  slug: string;
  number: number;
  phase: "Notebook 01" | "Notebook 02";
  title: string;
  subtitle: string;
  intro: string;
  takeaway: string;
  examples?: LogExample[];
  demos: DemoDef[];
  iterationDemo?: IterationDemo;
  webSearchDemo?: WebSearchDemo;
  contextHandoff?: ContextHandoffDemo;
  crewDemo?: CrewDemo;
  guardrailDemo?: GuardrailDemo;
  pipelineTimeline?: PipelineTimelineDemo;
  agentConfig: {
    role: string;
    goal: string;
    backstory: string;
  };
};
