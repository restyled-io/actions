const hashRegex = /^From (\S*)/;
const authorRegex = /^From:\s?([^<].*[^>])?\s+(<(.*)>)?/;
const fileNameRegex = /^diff --git "?a\/(.*)"?\s*"?b\/(.*)"?/;
const fileLinesRegex = /^@@ -([0-9]*),?\S* \+([0-9]*),?/;
const similarityIndexRegex = /^similarity index /;
const addedFileModeRegex = /^new file mode /;
const deletedFileModeRegex = /^deleted file mode /;

export type PatchLine =
  | { tag: "added"; addedLineNumber: number; line: string }
  | { tag: "removed"; removedLineNumber: number; line: string }
  | {
      tag: "context";
      addedLineNumber: number;
      removedLineNumber: number;
      line: string;
    };

export type PatchFile = {
  added: boolean;
  deleted: boolean;
  beforeName: string;
  afterName: string;
  modifiedLines: PatchLine[];
};

export type Patch = {
  hash?: string;
  authorName?: string;
  authorEmail?: string;
  date?: string;
  message?: string;
  files: PatchFile[];
};

export function parseGitPatches(patches: string): Patch[] {
  const lines = patches.split("\n");

  return splitIntoParts(lines, "From ")
    .map((xs) => parseGitPatch(xs.join("\n")))
    .filter((x) => {
      return x;
    }) as Patch[];
}

export function parseGitPatch(patch: string) {
  if (typeof patch !== "string") {
    throw new Error("Expected first argument (patch) to be a string");
  }

  const lines = patch.split("\n");

  const gitPatchMetaInfo = splitMetaInfo(patch, lines);

  if (!gitPatchMetaInfo) return null;

  const files = parseGitDiff(lines);

  return {
    ...gitPatchMetaInfo,
    files,
  };
}

export function parseGitDiff(lines: string[]): PatchFile[] {
  const files: PatchFile[] = [];

  splitIntoParts(lines, "diff --git").forEach((diff) => {
    const fileNameLine = diff.shift();

    if (!fileNameLine) return;

    const match3 = fileNameLine.match(fileNameRegex);

    if (!match3) return;

    const [, a, b] = match3;
    const metaLine = diff.shift();

    if (!metaLine) return;

    const fileData: PatchFile = {
      added: false,
      deleted: false,
      beforeName: a.trim(),
      afterName: b.trim(),
      modifiedLines: [],
    };

    files.push(fileData);

    if (addedFileModeRegex.test(metaLine)) {
      fileData.added = true;
    }
    if (deletedFileModeRegex.test(metaLine)) {
      fileData.deleted = true;
    }
    if (similarityIndexRegex.test(metaLine)) {
      return;
    }

    splitIntoParts(diff, "@@ ").forEach((lines) => {
      // console.log(lines);
      const fileLinesLine = lines.shift();
      // console.log(lines);

      if (!fileLinesLine) return;

      const match4 = fileLinesLine.match(fileLinesRegex);

      if (!match4) return;

      const [, a, b] = match4;

      let nA = parseInt(a);
      let nB = parseInt(b);

      lines.forEach((line) => {
        if (line === "-- ") {
          return;
        }

        if (line.startsWith("+")) {
          fileData.modifiedLines.push({
            tag: "added",
            addedLineNumber: nB,
            line: line.substring(1),
          });

          nB++;
        } else if (line.startsWith("-")) {
          fileData.modifiedLines.push({
            tag: "removed",
            removedLineNumber: nA,
            line: line.substring(1),
          });

          nA++;
        } else if (line.startsWith(" ")) {
          fileData.modifiedLines.push({
            tag: "context",
            addedLineNumber: nB,
            removedLineNumber: nA,
            line: line.substring(1),
          });

          nA++;
          nB++;
        }
      });
    });
  });

  return files;
}

function splitMetaInfo(patch: string, lines: string[]) {
  // Compatible with git output
  if (!/^From/g.test(patch)) {
    return {};
  }

  const hashLine = lines.shift();

  if (!hashLine) return null;

  const match1 = hashLine.match(hashRegex);

  if (!match1) return null;

  const [, hash] = match1;

  const authorLine = lines.shift();

  if (!authorLine) return null;

  const match2 = authorLine.match(authorRegex);

  if (!match2) return null;

  const [, authorName, , authorEmail] = match2;

  const dateLine = lines.shift();

  if (!dateLine) return null;

  const [, date] = dateLine.split("Date: ");

  const messageLine = lines.shift();

  if (!messageLine) return null;

  const [, message] = messageLine.split("Subject: ");

  return {
    hash,
    authorName,
    authorEmail,
    date,
    message,
  };
}

function splitIntoParts(lines: string[], separator: string) {
  const parts = [];
  let currentPart: string[] | undefined;

  lines.forEach((line) => {
    if (line.startsWith(separator)) {
      if (currentPart) {
        parts.push(currentPart);
      }

      currentPart = [line];
    } else if (currentPart) {
      currentPart.push(line);
    }
  });

  if (currentPart) {
    parts.push(currentPart);
  }

  return parts;
}
