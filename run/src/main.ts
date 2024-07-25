import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec";

type Inputs = {
  logBreakpoint: number;
  logFormat: string;
  logLevel: string;
  githubToken: string;
  committerEmail: string;
  committerName: string;
};

function getInputs(): Inputs {
  return {
    logBreakpoint: parseInt(
      core.getInput("log-breakpoint", { required: true }),
      10,
    ),
    logFormat: core.getInput("log-format", { required: true }),
    logLevel: core.getInput("log-level", { required: true }),
    githubToken: core.getInput("github-token", { required: true }),
    committerEmail: core.getInput("committer-email", { required: true }),
    committerName: core.getInput("committer-name", { required: true }),
  };
}

type Outputs = {
  differences: boolean;
  gitPatch: string;
  restyledBase: string;
  restyledHead: string;
  restyledTitle: string;
  restyledBody: string;
};

function setOutputs(outputs: Outputs): void {
  core.setOutput("differences", outputs.differences);
  core.setOutput("gitPatch", outputs.gitPatch);
  core.setOutput("restyledBase", outputs.restyledBase);
  core.setOutput("restyledHead", outputs.restyledHead);
  core.setOutput("restyledTitle", outputs.restyledTitle);
  core.setOutput("restyledBody", outputs.restyledBody);
}

function pullRequestDescription(number: number): string {
  return `
Automated style fixes for ##${number}, created by [Restyled][].

To see which restylers made changes, view the Commits tab.

To incorporate these changes, merge this Pull Request into the original. We
recommend using the Squash or Rebase strategies.

**NOTE**: As work continues on the original Pull Request, this process will
re-run and update (force-push) this Pull Request with updated style fixes as
necessary. If the style is fixed manually at any point (i.e. this process finds
no fixes to make), this Pull Request will be closed automatically.
`;
}

async function run() {
  try {
    if (github.context.eventName !== "pull_request") {
      throw new Error("This action can only be used with pull_request events");
    }

    const pr = github.context.payload;
    const inputs = getInputs();
    const client = github.getOctokit(inputs.githubToken);
    const files = await client.paginate(client.rest.pulls.listFiles, {
      ...github.context.repo,
      pull_number: pr.number,
    });

    if (files.length === 0) {
      throw new Error("PR has no changes");
    }

    const paths = files.map((f) => f.filename);

    await exec.exec("restyle", paths, {
      env: {
        GITHUB_TOKEN: inputs.githubToken,
        GIT_AUTHOR_EMAIL: inputs.committerEmail,
        GIT_AUTHOR_NAME: inputs.committerName,
        GIT_COMMITTER_EMAIL: inputs.committerEmail,
        GIT_COMMITTER_NAME: inputs.committerName,
        LOG_BREAKPOINT: `${inputs.logBreakpoint}`,
        LOG_FORMAT: inputs.logFormat,
        LOG_LEVEL: inputs.logLevel,
        LOG_COLOR: "always",
        LOG_CONCURRENCY: "1",
      },
    });

    let patch = "";

    await exec.exec("git", ["format-patch", "--stdout"], {
      listeners: {
        stdout: (data: Buffer) => {
          patch += data.toString();
        },
      },
    });

    setOutputs({
      differences: patch !== "",
      gitPatch: patch,
      restyledBase: pr.head.ref,
      restyledHead: `restyled/${pr.head.ref}`,
      restyledTitle: `Restyled ${pr.title}`,
      restyledBody: pullRequestDescription(pr.number),
    });
  } catch (error) {
    if (error instanceof Error) {
      core.error(error);
      core.setFailed(error.message);
    } else if (typeof error === "string") {
      core.error(error);
      core.setFailed(error);
    } else {
      core.error("Non-Error exception");
      core.setFailed("Non-Error exception");
    }
  }
}

run();
