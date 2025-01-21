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

import { Suggestion } from "./suggest";
import { PullRequest } from "./pull-request";
import { queryReviewThreads } from "./github-graphql";

type GitHubClient = ReturnType<typeof github.getOctokit>;

const COMMENT_TOKEN = "<!-- added by Restyled -->";

export async function clearPriorSuggestions(
  client: GitHubClient,
  pullRequest: PullRequest,
): Promise<Suggestion[]> {
  const { owner, repo } = github.context.repo;
  const threads = await queryReviewThreads(
    client,
    owner,
    repo,
    pullRequest.number,
  );

  const ps: Promise<void>[] = [];
  const resolved: Suggestion[] = [];

  threads.forEach((thread) => {
    thread.comments.nodes.forEach((comment) => {
      if (comment.body.includes(COMMENT_TOKEN)) {
        if (comment.isMinimized || thread.resolvedBy) {
          core.info(
            `Found resolved suggestion at ${comment.path}:${comment.line}`,
          );
          resolved.push({
            path: comment.path,
            description: "",
            startLine: comment.startLine ? comment.startLine : comment.line,
            endLine: comment.line,
            code: [],
          });
        } else {
          ps.push(
            client.rest.pulls
              .deleteReviewComment({
                ...github.context.repo,
                pull_number: pullRequest.number,
                comment_id: parseInt(comment.fullDatabaseId, 10),
              })
              .then(() => {
                return;
              }),
          );
        }
      }
    });
  });

  core.debug(`Deleting ${ps.length} old suggestions(s)`);
  await Promise.all(ps);
  return resolved;
}

export async function commentSuggestion(
  client: GitHubClient,
  pullRequest: PullRequest,
  suggestion: Suggestion,
): Promise<void> {
  const path = suggestion.path;
  const line = suggestion.endLine;
  const start_line =
    suggestion.startLine == suggestion.endLine
      ? undefined
      : suggestion.startLine;

  const body = [
    suggestion.description,
    "",
    "```suggestion",
    suggestion.code.join("\n"),
    "```",
    "",
    COMMENT_TOKEN,
  ];

  core.debug(`Leaving review comment on ${path}:${start_line}:${line}`);

  client.rest.pulls.createReviewComment({
    ...github.context.repo,
    pull_number: pullRequest.number,
    body: body.join("\n"),
    commit_id: pullRequest.headSha,
    path,
    start_line,
    line,
    side: "RIGHT",
  });
}
