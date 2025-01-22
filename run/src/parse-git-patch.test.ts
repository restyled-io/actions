import * as fs from "fs";

import {
  Patch,
  PatchFile,
  PatchLine,
  parseGitPatches,
  parseGitPatch,
} from "./parse-git-patch";

describe("parseGitPatches", () => {
  // works on multi-patch, patch, but not diff-only
  const cases = [
    "test-files/parse-git-patch/many-patches.patch",
    "test-files/parse-git-patch/many-files.patch",
    "test-files/parse-git-patch/rename-file.patch",
    "test-files/parse-git-patch/add-and-delete-file.patch",
    "test-files/parse-git-patch/hlint-yaml.patch",
  ];

  test.each(cases)("%s", (path) => {
    const input = fs.readFileSync(path).toString();
    const patches = parseGitPatches(input);

    expect(render(patches)).toMatchSnapshot();
  });
});

describe("parseGitPatch", () => {
  // works on patch or diff-only, but not multi-patch
  const cases = [
    "test-files/parse-git-patch/many-files.patch",
    "test-files/parse-git-patch/rename-file.patch",
    "test-files/parse-git-patch/add-and-delete-file.patch",
    "test-files/parse-git-patch/hlint-yaml.patch",
    "test-files/parse-git-patch/one-file.diff",
    "test-files/parse-git-patch/two-file.diff",
  ];

  test.each(cases)("%s", (path) => {
    const input = fs.readFileSync(path).toString();
    const patch = parseGitPatch(input);

    expect(render(patch ? [patch] : [])).toMatchSnapshot();
  });
});

function render(patches: Patch[]): string {
  return patches
    .flatMap((patch) => {
      return [
        "***",
        `hash: ${patch.hash}`,
        `message: ${patch.message}`,
        `authorName: ${patch.authorName}`,
        `authorEmail: ${patch.authorEmail}`,
        `date: ${patch.date}`,
        "---",
      ].concat(renderFiles(patch.files));
    })
    .join("\n");
}

function renderFiles(files: PatchFile[]): string[] {
  return files.flatMap((file) => {
    return [
      `added: ${file.added}`,
      `deleted: ${file.deleted}`,
      `beforeName: ${file.beforeName}`,
      `afterName: ${file.afterName}`,
      "@@@",
    ].concat(renderLines(file.modifiedLines));
  });
}

function renderLines(lines: PatchLine[]): string[] {
  const go = (acc: number, line: PatchLine) => {
    switch (line.tag) {
      case "added":
        return Math.max(acc, line.addedLineNumber);
      case "removed":
        return Math.max(acc, line.removedLineNumber);
      case "context":
        return Math.max(acc, line.addedLineNumber, line.removedLineNumber);
    }
  };

  const maxLineWidth = lines.reduce(go, 1).toString().length;

  return lines.flatMap((line) => {
    return [`${renderLine(line, maxLineWidth)}${line.line}`];
  });
}

function renderLine(line: PatchLine, lineNumberWidth: number): string {
  const padString = (x: string): string => {
    return String(x).padStart(lineNumberWidth, " ");
  };

  const padNumber = (x: number): string => {
    return padString(x.toString());
  };

  switch (line.tag) {
    case "added":
      return `| ${padString("")} | ${padNumber(line.addedLineNumber)} |+`;
    case "removed":
      return `| ${padNumber(line.removedLineNumber)} | ${padString("")} |-`;
    case "context":
      return `| ${padNumber(line.removedLineNumber)} | ${padNumber(line.addedLineNumber)} | `;
  }
}
