import * as core from "@actions/core";
import parseGitPatch from "parse-git-patch";

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
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const base = parseGitPatch(baseStr);
  const patch = parseGitPatch(patchStr);

  if (!base) {
    core.error("Unable to parse Pull Request patch");
    return [];
  }

  if (!patch) {
    core.error("Unable to parse Restyled patch");
    return [];
  }

  patch.files.forEach((file) => {
    const baseFile = base.files.find((x) => x.afterName === file.afterName);

    if (!baseFile) {
      return;
    }

    const baseAdds = new Hunks(baseFile.modifiedLines.filter((x) => x.added));
    const dels = new Hunks(file.modifiedLines.filter((x) => !x.added));
    const adds = new Hunks(file.modifiedLines.filter((x) => x.added));

    dels.forEach((del) => {
      const add = adds.get(NE.head(del).lineNumber);

      if (baseAdds.contain(del) && add) {
        suggestions.push({
          path: file.afterName,
          description: (patch.message || "").replace(/^\[PATCH] /, ""),
          startLine: NE.head(del).lineNumber - 1, // git-parse-patch bug
          endLine: NE.last(del).lineNumber - 1, // git-parse-patch bug
          code: NE.toList(add).map((x) => x.line),
        });
      }
    });
  });

  return suggestions;
}
