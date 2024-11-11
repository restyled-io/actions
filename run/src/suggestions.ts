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
import {
  type ParsedPatchType,
  type ParsedPatchFileDataType,
  type ParsedPatchModifiedLineType,
} from "parse-git-patch";

import { Hunks } from "./hunk";
import { type NonEmpty } from "./non-empty";
import * as NE from "./non-empty";

export type Suggestion = {
  path: string;
  description: string;
  startLine: number;
  endLine: number;
  code: string[];
  skipReason?: string;
};

function mkSuggestion(
  file: ParsedPatchFileDataType,
  patch: ParsedPatchType,
  delLine: number,
  add: NonEmpty<ParsedPatchModifiedLineType>,
): Suggestion {
  return {
    path: file.afterName,
    description: (patch.message || "").replace(/^\[PATCH] /, ""),
    startLine: delLine,
    endLine: delLine,
    code: NE.toList(add).map((x) => x.line),
  };
}

function mkSkipped(
  skipReason: string,
  file: ParsedPatchFileDataType,
  patch: ParsedPatchType,
  delLine?: number,
  add?: NonEmpty<ParsedPatchModifiedLineType>,
): Suggestion {
  return {
    path: file.afterName,
    description: (patch.message || "").replace(/^\[PATCH] /, ""),
    startLine: delLine ?? 0,
    endLine: delLine ?? 0,
    code: add ? NE.toList(add).map((x) => x.line) : [],
    skipReason,
  };
}

export function getSuggestions(
  bases: ParsedPatchType[],
  patches: ParsedPatchType[],
  resolved: Suggestion[],
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const baseFiles = bases.flatMap((p) => p.files);

  patches.forEach((patch) => {
    patch.files.forEach((file) => {
      const baseFile = baseFiles.find((x) => x.afterName === file.afterName);

      if (!baseFile) {
        suggestions.push(
          mkSkipped(
            `Changed file ${file.afterName} is not present in base diff`,
            file,
            patch,
          ),
        );
        return;
      }

      const baseAdds = new Hunks(baseFile.modifiedLines.filter((x) => x.added));
      const dels = new Hunks(file.modifiedLines.filter((x) => !x.added));
      const adds = new Hunks(file.modifiedLines.filter((x) => x.added));

      dels.forEach((del) => {
        const delLine = NE.head(del).lineNumber;
        const location = `${file.afterName}:${delLine}`;
        const add = adds.get(delLine);

        if (!add) {
          suggestions.push(
            mkSkipped(
              `Deletion at ${location} has no corresponding addition: ${JSON.stringify(adds.lines())}`,
              file,
              patch,
              delLine,
            ),
          );
          return;
        }

        if (!baseAdds.contain(del)) {
          suggestions.push(
            mkSkipped(
              `Deletion at ${location} was not added in base diff: ${JSON.stringify(baseAdds.lines())}`,
              file,
              patch,
              delLine,
              add,
            ),
          );
          return;
        }

        const suggestion = mkSuggestion(file, patch, delLine, add);

        if (resolved.some((r) => isSameLocation(r, suggestion))) {
          suggestions.push(
            mkSkipped(
              `Suggestion at ${location} already marked resolved`,
              file,
              patch,
              delLine,
              add,
            ),
          );
          return;
        }

        suggestions.push(suggestion);
      });
    });
  });

  return suggestions;
}

function isSameLocation(a: Suggestion, b: Suggestion): boolean {
  return (
    a.path === b.path && a.startLine == b.startLine && a.endLine == b.endLine
  );
}
