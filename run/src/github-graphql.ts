import * as core from "@actions/core";
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

  // Useful for adhoc debugging
  // core.info(`QUERY: ${query}`);
  // const raw: any = await client.graphql(query);
  // core.info(`RESPONSE ${JSON.stringify(raw)}`);

  const response: RepositoryResponse = await client.graphql(query);
  return response.repository.pullRequest.reviewThreads.nodes;
}
