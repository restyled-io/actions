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
import { parsePatches } from "./patch";

import { Hunks } from "./hunk";
import * as NE from "./non-empty";

export type Suggestion = {
  path: string;
  description: string;
  startLine: number;
  endLine: number;
  code: string[];
};

export function getSuggestions(
  baseStr: string,
  patchStr: string,
  resolved: Suggestion[],
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const bases = parsePatches(baseStr);
  const patches = parsePatches(patchStr);
  const baseFiles = bases.flatMap((p) => p.files);

  patches.forEach((patch) => {
    patch.files.forEach((file) => {
      const baseFile = baseFiles.find((x) => x.afterName === file.afterName);

      if (!baseFile) {
        return;
      }

      const baseAdds = new Hunks(baseFile.modifiedLines.filter((x) => x.added));
      const dels = new Hunks(file.modifiedLines.filter((x) => !x.added));
      const adds = new Hunks(file.modifiedLines.filter((x) => x.added));

      dels.forEach((del) => {
        const add = adds.get(NE.head(del).lineNumber);
        if (baseAdds.contain(del) && add) {
          const suggestion = {
            path: file.afterName,
            description: (patch.message || "").replace(/^\[PATCH] /, ""),
            startLine: NE.head(del).lineNumber - 1, // git-parse-patch bug
            endLine: NE.last(del).lineNumber - 1, // git-parse-patch bug
            code: NE.toList(add).map((x) => x.line),
          };

          if (!resolved.some((r) => isSameLocation(r, suggestion))) {
            suggestions.push(suggestion);
          }
        }
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
