import * as fs from "fs";
import * as temp from "temp";

import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec";

type Inputs = {
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
};

function getInputs(): Inputs {
  return {
    paths: core.getMultilineInput("paths", { required: false }),
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
  core.setOutput("differences", outputs.differences ? "true" : "false");
  core.setOutput("git-patch", outputs.gitPatch);
  core.setOutput("restyled-base", outputs.restyledBase);
  core.setOutput("restyled-head", outputs.restyledHead);
  core.setOutput("restyled-title", outputs.restyledTitle);
  core.setOutput("restyled-body", outputs.restyledBody);
}

async function readProcess(cmd: string, args: string[]): Promise<string> {
  let stdout = "";
  let stderr = "";

  try {
    await exec.exec(cmd, args, {
      silent: true,
      listeners: {
        stdout: (data: Buffer) => {
          stdout += data.toString();
        },
        stderr: (data: Buffer) => {
          stderr += data.toString();
        },
      },
    });
  } catch (ex) {
    console.error("Crashing due to exec failure");
    console.error(`Captured stdout: ${stdout}`);
    console.error(`Captured stderr: ${stderr}`);
    throw ex;
  }

  return stdout.replace(/\n$/, "");
}

function pullRequestDescription(number: number): string {
  return `
Automated style fixes for #${number}, created by Restyled.

To see which restylers made changes, view the Commits tab.

To incorporate these changes, merge this Pull Request into the original. We
recommend using the Squash or Rebase strategies.

**NOTE**: As work continues on the original Pull Request, this process will
re-run and update (force-push) this Pull Request with updated style fixes as
necessary. If the style is fixed manually at any point (i.e. this process finds
no fixes to make), this Pull Request will be closed automatically.
`;
}

// Outputs as multiple lines of 76 characters, like `base64`
function formatBase64(x: string): string {
  const b64 = Buffer.from(x).toString("base64");
  const lines = b64.match(/(.{1,76})/g); // https://stackoverflow.com/a/10475071
  return lines ? lines.join("\n") : b64; // as-is
}

async function run() {
  try {
    if (github.context.eventName !== "pull_request") {
      throw new Error("This action can only be used with pull_request events");
    }

    const pr = github.context.payload.pull_request;
    core.debug(`PullRequest: ${JSON.stringify(pr)}`);

    if (!pr) {
      throw new Error("Payloads has no pull_request");
    }

    const inputs = getInputs();
    const client = github.getOctokit(inputs.githubToken);

    let paths = inputs.paths;

    if (paths.length === 0) {
      core.debug("inputs.paths empty, fetching files changed in PR");
      const files = await client.paginate(client.rest.pulls.listFiles, {
        ...github.context.repo,
        pull_number: pr.number,
      });

      paths = files.map((f) => f.filename);
    }

    if (paths.length === 0) {
      throw new Error("inputs.paths empty and PR has no changed files");
    }

    const base = await readProcess("git", ["rev-parse", "HEAD"]);

    if (base !== pr.head.sha) {
      core.warning(
        `The checked out commit does not match the event PR's head. ${base} != ${pr.head.sha}. Weird things may happen.`,
      );
    }

    const pullRequestJson = temp.path({ suffix: ".json" });
    fs.writeFileSync(pullRequestJson, JSON.stringify(pr));

    const args = ["--pull-request-json", pullRequestJson]
      .concat(process.env["RUNNER_DEBUG"] === "1" ? ["--debug"] : [])
      .concat(inputs.failOnDifferences ? ["--fail-on-differences"] : [])
      .concat(paths);

    const ec = await exec.exec("restyle", args, {
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
      ignoreReturnCode: true,
    });

    const patch = await readProcess("git", ["format-patch", "--stdout", base]);

    if (inputs.showPatch) {
      core.info("Restyled made the following fixes:");
      core.info("  ");
      core.info(patch);
      core.info("  ");
    }

    if (inputs.showPatchCommand) {
      core.info("To apply these commits locally, run the following:");
      core.info("  ");
      core.info("{ base64 -d - | git am; } <<'EOM'");
      core.info(formatBase64(patch));
      core.info("EOM");
      core.info("  ");
    }

    setOutputs({
      differences: patch !== "",
      gitPatch: patch,
      restyledBase: pr.head.ref,
      restyledHead: `restyled/${pr.head.ref}`,
      restyledTitle: `Restyled ${pr.title}`,
      restyledBody: pullRequestDescription(pr.number),
    });

    if (ec !== 0) {
      core.setFailed(`Restyler exited non-zero: ${ec}`);
    }
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
