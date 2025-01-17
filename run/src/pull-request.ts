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
import * as fs from "fs";
import * as temp from "temp";

import * as core from "@actions/core";
import * as github from "@actions/github";

import { ChangedFile, fromPullRequestFile } from "./diff";
import { readProcess } from "./process";

type GitHubClient = ReturnType<typeof github.getOctokit>;

export type PullRequest = {
  number: number;
  title: string;
  headRef: string;
  headSha: string;
  restyleArgs: string[];
  restyleDiffBase: DiffBase;
  changedFiles: ChangedFile[];
};

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
    core.warning(
      [
        `The checked out commit does not match the event PR's head.`,
        `${base.sha} != ${pr.head.sha}.`,
        `This usually means you are operating on the default merge ref.`,
        `If so, Restyled may pick up changes that have been made to the default`,
        `branch since you created this branch.`,
      ].join(" "),
    );
  }

  // Write PR data for restyle to use. It expects a proper API type so we can't
  // do that with our fakePullRequest. This is also why we centralize
  // restyleArgs handling here.
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
    changedFiles: files.map(fromPullRequestFile),
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
    changedFiles: [],
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
