import * as core from "@actions/core";

export type Outputs = {
  differences: boolean;
  gitPatch: string;
  restyledBase: string;
  restyledHead: string;
  restyledTitle: string;
  restyledBody: string;
};

export function setOutputs(outputs: Outputs): void {
  core.setOutput("differences", outputs.differences ? "true" : "false");
  core.setOutput("git-patch", outputs.gitPatch);
  core.setOutput("restyled-base", outputs.restyledBase);
  core.setOutput("restyled-head", outputs.restyledHead);
  core.setOutput("restyled-title", outputs.restyledTitle);
  core.setOutput("restyled-body", outputs.restyledBody);
}
