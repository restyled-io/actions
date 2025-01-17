import { Hunks } from "./hunk";

export interface ChangedFile {
  filename: string;
  additions: Hunks<AddedLine>;
}

export interface AddedLine {
  lineNumber: number;
}

export interface PullRequestFile {
  filename: string;
  patch?: string;
}

const DIGITS_RE = "[1-9][0-9]*";
const DIFF_BEGIN_RE = new RegExp(
  `^@@ -${DIGITS_RE},${DIGITS_RE} +(?<addBegin>${DIGITS_RE}),${DIGITS_RE} @@$`,
);

export function fromPullRequestFile(file: PullRequestFile): ChangedFile {
  const { filename, patch } = file;

  if (!patch) {
    return {
      filename,
      additions: new Hunks([]),
    };
  }

  const addedLines: AddedLine[] = [];

  let cursor = 0;

  patch.split("\n").forEach((line) => {
    const md = line.match(DIFF_BEGIN_RE);
    const addBegin = md?.groups?.addBegin;

    if (addBegin) {
      cursor = parseInt(addBegin, 10); // reset begin
    } else if (line.match(/^\+/)) {
      addedLines.push({ lineNumber: cursor });
      cursor += 1;
    } else if (line.match(/^-/)) {
      // ignore deletions
    } else {
      // increment on context
      cursor += 1;
    }
  });

  return { filename, additions: new Hunks(addedLines) };
}
