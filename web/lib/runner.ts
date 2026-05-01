import type { LogLine, FixturePair } from "./schema";

export type RunResult = {
  output: string;
  log: LogLine[];
};

export type RunCallbacks = {
  onLog?: (line: LogLine) => void;
  onOutputChunk?: (chunk: string) => void;
  onDone?: (result: RunResult) => void;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runFixture(
  fixture: FixturePair,
  cb: RunCallbacks = {},
): Promise<RunResult> {
  for (const line of fixture.log) {
    await sleep(220);
    cb.onLog?.(line);
  }

  await sleep(180);

  const lines = fixture.output.split("\n");
  let acc = "";
  for (const line of lines) {
    await sleep(35);
    acc += (acc ? "\n" : "") + line;
    cb.onOutputChunk?.(line + "\n");
  }

  const result: RunResult = { output: fixture.output, log: fixture.log };
  cb.onDone?.(result);
  return result;
}
