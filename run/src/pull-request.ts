/* Copyright (C) 2025 Patrick Brisbin
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
  files: PullRequestFile[];
};

export interface PullRequestFile {
  filename: string;
  patch?: string;
}

export type DiffBase = { tag: "unknown" } | { tag: "known"; sha: string };

export async function getPullRequest(
  client: GitHubClient,
  paths: string[],
): Promise<PullRequest> {
  const base = await getDiffBase();
  const pr = github.context.payload.pull_request;
  core.debug(`repo: ${JSON.stringify(github.context.repo)}`);
  core.debug(`payload.pull_request: ${JSON.stringify(pr)}`);

  if (!pr) {
    return fakePullRequest(base, paths);
  }

  if (base.tag === "known" && base.sha !== pr.head.sha) {
    core.info(
      [
        "The checked out commit does not match the event PR's head.",
        `${base.sha} != ${pr.head.sha}.`,
        "This usually means you've checked out the merge ref,",
        "which is actions/checkout's default behavior.",
        "This is usually fine, but if you have a very busy default branch,",
        "Restyled could pick up changes you don't expect and do weird things.",
        "Consider using `ref: ${{ github.event.pull_request.head.ref }}` instead.",
      ].join(" "),
    );
  }

  // Write PR data for restyle to use. It expects a proper API type so we can't
  // do that with our fakePullRequest. This is also why centralize restyleArgs
  // handling here.
  const pullRequestJson = temp.path({ suffix: ".json" });
  fs.writeFileSync(pullRequestJson, JSON.stringify(pr));

  const files = await client.paginate(client.rest.pulls.listFiles, {
    ...github.context.repo,
    pull_number: pr.number,
  });

  // Respect paths if given, otherwise pull PR changed files
  const restylePaths =
    paths.length === 0 ? files.map((f) => f.filename) : paths;

  return {
    number: pr.number,
    title: pr.title,
    headRef: pr.head.ref,
    headSha: pr.head.sha,
    restyleArgs: ["--pull-request-json", pullRequestJson].concat(restylePaths),
    restyleDiffBase: base,
    files,
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
    files: [],
  };
}

async function getDiffBase(): Promise<DiffBase> {
  try {
    const sha = await readProcess("git", ["rev-parse", "HEAD"]);
    return { tag: "known", sha };
  } catch {
    return { tag: "unknown" };
  }
}
