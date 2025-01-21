/* Copyright (C) 2024 Patrick Brisbin
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
import { groupBy } from "./list";
import { NonEmpty, nonEmpty } from "./non-empty";
import * as NE from "./non-empty";
import { Patch, PatchLine } from "./parse-git-patch";

export type Suggestion = {
  path: string;
  description: string;
  code: string[];
  startLine: number;
  endLine: number;
  skipReason?: string;
};

export function getSuggestions(
  bases: Patch[],
  patches: Patch[],
  resolved: Suggestion[],
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  patches.forEach((patch) => {
    patch.files.forEach((file) => {
      const groups = groupBy(file.modifiedLines, (a, b) => {
        return a.tag === b.tag || (a.tag === "removed" && b.tag === "added");
      });

      groups.forEach((group: PatchLine[]) => {
        const removed = getRemoveLineNumbers(group);

        if (removed) {
          const suggestion: Suggestion = {
            path: file.afterName,
            description: (patch.message ?? "").replace(/\[PATCH.*] /, ""),
            code: getAddedLines(group),
            startLine: NE.head(removed),
            endLine: NE.last(removed),
          };

          if (!isAddedInDiff(bases, suggestion)) {
            suggestion.skipReason =
              "suggestions can only be made on added lines";
          } else if (resolved.some((r) => isSameLocation(r, suggestion))) {
            suggestion.skipReason = "previously marked resolved";
          }

          suggestions.push(suggestion);
        }
      });
    });
  });

  return suggestions;
}

function getRemoveLineNumbers(lines: PatchLine[]): NonEmpty<number> | null {
  const acc: number[] = [];

  lines.forEach((line) => {
    if (line.tag === "removed") {
      acc.push(line.removedLineNumber);
    }
  });

  return nonEmpty(acc);
}

function getAddedLines(lines: PatchLine[]): string[] {
  const acc: string[] = [];

  lines.forEach((line) => {
    if (line.tag === "added") {
      acc.push(line.line);
    }
  });

  return acc;
}

function isAddedInDiff(bases: Patch[], _s: Suggestion): boolean {
  return true; // TODO
}

function isSameLocation(a: Suggestion, b: Suggestion): boolean {
  return (
    a.path === b.path && a.startLine == b.startLine && a.endLine == b.endLine
  );
}
