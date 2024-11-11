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
import { type ParsedPatchType } from "parse-git-patch";
import parseGitPatch from "parse-git-patch";

const PATCH_BEGIN = /^From /;

export function parsePatches(str: string): ParsedPatchType[] {
  const patches: ParsedPatchType[] = [];

  let patchLines: string[] = [];

  // Parse what we have so far and reset lines
  const accumulate = () => {
    if (patchLines.length === 0) {
      return;
    }

    const parsed = parsePatch(patchLines.join("\n"));

    if (!parsed) {
      return;
    }

    patches.push(parsed);
    patchLines = [];
  };

  str.split("\n").forEach((line) => {
    if (line.match(PATCH_BEGIN)) {
      accumulate();
    }

    patchLines.push(line);
  });

  accumulate();

  return patches;
}

function parsePatch(str: string): ParsedPatchType | null {
  // https://github.com/dherault/parse-git-patch/issues/17
  const p = parseGitPatch(str) as ParsedPatchType | null;

  if (p) {
    fixLineNumbers(p);
  }

  return p;
}

// https://github.com/dherault/parse-git-patch/issues/16
function fixLineNumbers(patch: ParsedPatchType): void {
  patch.files.forEach((file) => {
    file.modifiedLines.forEach((mod) => {
      mod.lineNumber = mod.lineNumber - 1;
    });
  });
}
