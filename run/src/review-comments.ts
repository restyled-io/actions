import * as core from "@actions/core";
import * as github from "@actions/github";

import { type Suggestion } from "./suggestions";
import { type PullRequest } from "./pull-request";

type GitHubClient = ReturnType<typeof github.getOctokit>;

const COMMENT_TOKEN = "<!-- added by Restyled -->";

export async function clearPriorSuggestions(
  client: GitHubClient,
  pullRequest: PullRequest,
) {
  const comments = await client.paginate(client.rest.pulls.listReviewComments, {
    ...github.context.repo,
    pull_number: pullRequest.number,
  });

  core.debug(`Found ${comments.length} existing comment(s)`);

  const ps = comments.map((comment) => {
    if (comment.body.includes(COMMENT_TOKEN)) {
      core.debug(`Will suggestion comment ${comment.id}`);
      return client.rest.pulls.deleteReviewComment({
        ...github.context.repo,
        pull_number: pullRequest.number,
        comment_id: comment.id,
      });
    } else {
      return Promise.resolve();
    }
  });

  core.debug("Deleting comment(s)");
  await Promise.all(ps);
}

export async function commentSuggestions(
  client: GitHubClient,
  pullRequest: PullRequest,
  suggestions: Suggestion[],
): Promise<void> {
  const ps = suggestions.map((suggestion) => {
    return commentSuggestion(client, pullRequest, suggestion);
  });

  core.info(`Leaving ${ps.length} suggestion(s)`);
  Promise.all(ps);
}

async function commentSuggestion(
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