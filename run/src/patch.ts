import { type ParsedPatchType } from "parse-git-patch";
import parseGitPatch from "parse-git-patch";

const PATCH_BEGIN = /^From /;

export function parsePatches(str: string): ParsedPatchType[] {
  const patches: ParsedPatchType[] = [];

  let patchLines: string[] = [];

  const accumulate = () => {
    if (patchLines.length === 0) {
      return;
    }

    const parsed = parseGitPatch(patchLines.join("\n"));

    if (!parsed) {
      return;
    }

    patches.push(parsed as ParsedPatchType);
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
