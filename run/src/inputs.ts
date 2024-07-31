import * as core from "@actions/core";
import * as github from "@actions/github";

export type Inputs = {
  paths: string[];
  githubToken: string;
  showPatch: boolean;
  showPatchCommand: boolean;
  failOnDifferences: boolean;
  committerEmail: string;
  committerName: string;
  logLevel: string;
  logFormat: string;
  logBreakpoint: number;
  manifest: string;
  dryRun: boolean;
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
    failOnDifferences: core.getBooleanInput("fail-on-differences", {
      required: true,
    }),
    committerEmail: core.getInput("committer-email", { required: true }),
    committerName: core.getInput("committer-name", { required: true }),
    logLevel: core.getInput("log-level", { required: true }),
    logFormat: core.getInput("log-format", { required: true }),
    logBreakpoint: parseInt(
      core.getInput("log-breakpoint", { required: true }),
      10,
    ),
    manifest: core.getInput("manifest", { required: false }),
    dryRun: core.getBooleanInput("dry-run", { required: true }),
  };
}
