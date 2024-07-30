import * as fs from "fs";
import * as temp from "temp";

import * as core from "@actions/core";
import * as github from "@actions/github";

import { readProcess } from "./process";

type GitHubClient = ReturnType<typeof github.getOctokit>;

export type PullRequest = {
  number: number;
  title: string;
  headRef: string;
  headSha: string;
  restyleArgs: string[];
  restyleDiffBase: DiffBase;
};

export type DiffBase = { tag: "unknown" } | { tag: "known"; sha: string };

export async function getPullRequest(
  client: GitHubClient,
  paths: string[],
): Promise<PullRequest> {
  const base = await getDiffBase();
  const pr = github.context.payload.pull_request;
  core.debug(`payload.pull_request: ${JSON.stringify(pr)}`);

  if (!pr) {
    return fakePullRequest(base, paths);
  }

  if (base.tag === "known" && base.sha !== pr.head.sha) {
    core.warning(
      `The checked out commit does not match the event PR's head. ${base.sha} != ${pr.head.sha}. Weird things may happen.`,
    );
  }

  // Write PR data for restyle to use. It expects a proper API type so we can't
  // do that with our fakePullRequest. This is also why centralize restyleArgs
  // handling here.
  const pullRequestJson = temp.path({ suffix: ".json" });
  fs.writeFileSync(pullRequestJson, JSON.stringify(pr));

  // Respect paths if given, otherwise pull PR changed files
  const restylePaths =
    paths.length === 0 ? await getPullRequestPaths(client, pr.number) : paths;

  return {
    number: pr.number,
    title: pr.title,
    headRef: pr.head.ref,
    headSha: pr.head.sha,
    restyleArgs: ["--pull-request-json", pullRequestJson].concat(restylePaths),
    restyleDiffBase: base,
  };
}

function fakePullRequest(base: DiffBase, paths: string[]): PullRequest {
  return {
    number: 0,
    title: "Unknown",
    headRef: "unknown",
    headSha: "unknown",
    restyleArgs: paths,
    restyleDiffBase: base,
  };
}

async function getPullRequestPaths(
  client: GitHubClient,
  number: number,
): Promise<string[]> {
  const files = await client.paginate(client.rest.pulls.listFiles, {
    ...github.context.repo,
    pull_number: number,
  });

  return files.map((f) => f.filename);
}

async function getDiffBase(): Promise<DiffBase> {
  try {
    const sha = await readProcess("git", ["rev-parse", "HEAD"]);
    return { tag: "known", sha };
  } catch {
    return { tag: "unknown" };
  }
}
