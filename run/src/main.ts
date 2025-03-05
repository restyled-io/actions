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
import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec";

import { cliArguments, getInputs } from "./inputs";
import { setOutputs } from "./outputs";
import { readProcess } from "./process";
import { getPullRequest } from "./pull-request";
import { clearPriorSuggestions, commentSuggestion } from "./review-comments";
import { suggest } from "./suggest";

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
    const inputs = getInputs();
    const client = github.getOctokit(inputs.githubToken);
    const pr = await getPullRequest(client, inputs.paths);
    const args = pr.restyleArgs
      .concat(process.env["RUNNER_DEBUG"] === "1" ? ["--debug"] : [])
      .concat(cliArguments(inputs));

    const ec = await exec.exec("restyle", args, {
      env: {
        ...process.env,
        GITHUB_TOKEN: inputs.githubToken,
        GIT_AUTHOR_EMAIL: inputs.committerEmail,
        GIT_AUTHOR_NAME: inputs.committerName,
        GIT_COMMITTER_EMAIL: inputs.committerEmail,
        GIT_COMMITTER_NAME: inputs.committerName,
        LOG_BREAKPOINT: "200",
        LOG_COLOR: "always",
        LOG_CONCURRENCY: "1",
      },
      ignoreReturnCode: true,
    });

    let patch = "";

    if (pr.restyleDiffBase.tag === "known") {
      const base = pr.restyleDiffBase.sha;
      patch = await readProcess("git", ["format-patch", "--stdout", base]);
    }

    const success = ec === 0 || (inputs.failOnDifferences && ec === 228);
    const differences = inputs.failOnDifferences
      ? ec === 228
      : ec === 0 && patch !== "";

    if (inputs.showPatch && differences) {
      core.info("Restyled made the following fixes:");
      core.info("  ");
      core.info(patch);
      core.info("  ");
    }

    if (inputs.showPatchCommand && differences) {
      core.info("To apply these commits locally, run the following:");
      core.info("  ");
      core.info("{ base64 -d - | git am; } <<'EOM'");
      core.info(formatBase64(patch));
      core.info("EOM");
      core.info("  ");
    }

    let suggestionsSkipped = false;

    if (inputs.suggestions && success) {
      const resolved = await clearPriorSuggestions(client, pr);

      if (differences) {
        const suggestions = suggest(pr.files, resolved, patch);

        let n = 0;
        const ps = suggestions.map((s) => {
          const limitSkipReason =
            inputs.suggestionsLimit && n >= inputs.suggestionsLimit
              ? "limit reached"
              : null;

          const skipReason = s.skipReason ?? limitSkipReason;

          if (skipReason) {
            const line =
              s.startLine !== s.endLine
                ? `${s.startLine}-${s.endLine}`
                : `${s.startLine}`;
            const location = `${s.path}:${line}`;
            core.warning(`[${location}]: Skipping suggestion: ${skipReason}`);
            suggestionsSkipped = true;
            return Promise.resolve();
          } else {
            n += 1;
            return commentSuggestion(client, pr, s);
          }
        });

        core.info(`Leaving ${n} suggestion(s)`);
        await Promise.all(ps);
      }
    }

    setOutputs({
      success,
      differences,
      gitPatch: patch,
      restyledBase: pr.headRef,
      restyledHead: `restyled/${pr.headRef}`,
      restyledTitle: `Restyled ${pr.title}`,
      restyledBody: pullRequestDescription(pr.number),
      suggestionsSkipped,
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
