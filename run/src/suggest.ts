/* Copyright (C) 2025 Patrick Brisbin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { NonEmpty, nonEmpty } from "./non-empty";
import * as NE from "./non-empty";
import { PatchLine, parseGitPatches, parseGitPatch } from "./parse-git-patch";
import { PullRequestFile } from "./pull-request";

export type Suggestion = {
  path: string;
  description: string;
  code: string[];
  startLine: number;
  endLine: number;
  skipReason?: string;
};

export function suggest(
  baseFiles: PullRequestFile[],
  resolved: Suggestion[],
  patch: string,
): Suggestion[] {
  const patches = parseGitPatches(patch);
  const suggestions: Suggestion[] = [];

  patches.forEach((patch) => {
    patch.files.forEach((file) => {
      const groups = NE.groupBy(file.modifiedLines, (a, b) => {
        return a.tag === b.tag || (a.tag === "removed" && b.tag === "added");
      });

      groups.forEach((group) => {
        const removed = getRemoveLineNumbers(group);

        if (!removed) {
          return;
        }

        const suggestion: Suggestion = {
          path: file.afterName,
          description: (patch.message ?? "").replace(/\[PATCH.*] /, ""),
          code: getAddedLines(group),
          startLine: NE.head(removed),
          endLine: NE.last(removed),
        };

        if (!isOnAddedLines(baseFiles, suggestion)) {
          suggestion.skipReason = "suggestions can only be made on added lines";
        }

        if (resolved.some((r) => isSameLocation(r, suggestion))) {
          suggestion.skipReason = "previously marked resolved";
        }

        suggestions.push(suggestion);
      });
    });
  });

  return suggestions;
}

function getRemoveLineNumbers(
  lines: NonEmpty<PatchLine>,
): NonEmpty<number> | null {
  const acc: number[] = [];

  NE.toList(lines).forEach((line) => {
    if (line.tag === "removed") {
      acc.push(line.removedLineNumber);
    }
  });

  return nonEmpty(acc);
}

function getAddedLines(lines: NonEmpty<PatchLine>): string[] {
  const acc: string[] = [];

  NE.toList(lines).forEach((line) => {
    if (line.tag === "added") {
      acc.push(line.line);
    }
  });

  return acc;
}

function isOnAddedLines(
  baseFiles: PullRequestFile[],
  suggestion: Suggestion,
): boolean {
  const matched: PatchLine[] = [];
  const { path, startLine, endLine } = suggestion;
  const suggestionSize = endLine - startLine + 1;
  const lines = getPullRequestDiff(baseFiles, path);

  if (lines.length >= suggestionSize) {
    for (let i = startLine; i <= endLine; i++) {
      const line = lines.find((line) => {
        return line.tag === "added" && line.addedLineNumber === i;
      });

      if (line) {
        matched.push(line);
      }
    }
  }

  return matched.length == suggestionSize;
}

function getPullRequestDiff(
  files: PullRequestFile[],
  name: string,
): PatchLine[] {
  const file = files.find((f) => f.filename === name);

  if (!file) {
    // File not in PR
    return [];
  }

  const diff = [
    `diff --git a/${file.filename} b/${file.filename}`,
    "index 000000000..000000000 100644",
    `--- a/${file.filename}`,
    `+++ b/${file.filename}`,
    file.patch ?? "",
  ].join("\n");

  const patch = parseGitPatch(diff);
  const patchFile = (patch?.files ?? [])[0];

  if (!patchFile) {
    return [];
  }

  return patchFile.modifiedLines;
}

function isSameLocation(a: Suggestion, b: Suggestion): boolean {
  return (
    a.path === b.path && a.startLine == b.startLine && a.endLine == b.endLine
  );
}
