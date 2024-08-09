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
import * as core from "@actions/core";
import * as github from "@actions/github";

export type Inputs = {
  paths: string[];
  githubToken: string;
  showPatch: boolean;
  showPatchCommand: boolean;
  committerEmail: string;
  committerName: string;
  debug: boolean;
  dryRun: boolean;
  failOnDifferences: boolean;
  imageCleanup: boolean;
  manifest: string;
  noCommit: boolean;
  noPull: boolean;
};

export function getInputs(): Inputs {
  const paths = core.getMultilineInput("paths", { required: false });

  if (github.context.eventName !== "pull_request") {
    core.warning("Running for non-PR event. Weird things may happen.");

    if (paths.length === 0) {
      throw new Error("paths input is required for non-PR events");
    }
  }

  return {
    paths,
    githubToken: core.getInput("github-token", { required: true }),
    showPatch: core.getBooleanInput("show-patch", {
      required: true,
    }),
    showPatchCommand: core.getBooleanInput("show-patch-command", {
      required: true,
    }),
    committerEmail: core.getInput("committer-email", { required: true }),
    committerName: core.getInput("committer-name", { required: true }),
    debug: core.getBooleanInput("debug", { required: true }),
    dryRun: core.getBooleanInput("dry-run", { required: true }),
    failOnDifferences: core.getBooleanInput("fail-on-differences", {
      required: true,
    }),
    imageCleanup: core.getBooleanInput("image-cleanup", { required: true }),
    manifest: core.getInput("manifest", { required: false }),
    noCommit: core.getBooleanInput("no-commit", { required: true }),
    noPull: core.getBooleanInput("no-pull", { required: true }),
  };
}

export function cliArguments(inputs: Inputs): string[] {
  return ([] as string[])
    .concat(inputs.debug ? ["--debug"] : [])
    .concat(inputs.failOnDifferences ? ["--fail-on-differences"] : [])
    .concat(inputs.imageCleanup ? ["--image-cleanup"] : [])
    .concat(inputs.manifest !== "" ? ["--manifest", inputs.manifest] : [])
    .concat(inputs.dryRun ? ["--dry-run"] : [])
    .concat(inputs.noCommit ? ["--no-commit"] : [])
    .concat(inputs.noPull ? ["--no-pull"] : []);
}
