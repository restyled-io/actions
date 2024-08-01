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
  manifest: string;
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
    manifest: core.getInput("manifest", { required: false }),
  };
}
