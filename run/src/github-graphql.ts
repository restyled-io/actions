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
import * as github from "@actions/github";

type GitHubClient = ReturnType<typeof github.getOctokit>;

export type RepositoryResponse = {
  repository: Repository;
};

export type Repository = {
  pullRequest: PullRequest;
};

export type PullRequest = {
  reviewThreads: HasNodes<ReviewThread>;
};

export type ReviewThread = {
  resolvedBy: User;
  comments: HasNodes<ReviewComment>;
};

export type User = {
  id: string;
};

export type ReviewComment = {
  body: string;
  fullDatabaseId: string;
  isMinimized: boolean;
  line: number;
  minimizedReason: string | null;
  path: string;
  startLine: number | null;
};

export type Response<T> = {
  data: T;
};

export type HasNodes<T> = {
  nodes: T[];
};

export async function queryReviewThreads(
  client: GitHubClient,
  owner: string,
  repo: string,
  number: number,
): Promise<ReviewThread[]> {
  const query = `{
    repository(owner: "${owner}", name: "${repo}") {
      pullRequest(number: ${number}) {
        reviewThreads(last: 100) {
          nodes {
            resolvedBy {
              id
            }
            comments(last: 100) {
              nodes {
                body
                fullDatabaseId
                isMinimized
                line
                minimizedReason
                path
                startLine
              }
            }
          }
        }
      }
    }
  }`;

  const response: RepositoryResponse = await client.graphql(query);
  return response.repository.pullRequest.reviewThreads.nodes;
}
