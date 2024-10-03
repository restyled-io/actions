# Restyled Actions

> [!IMPORTANT]
> Before using Restyled as a GitHub Action, make sure you prevent any previous
> hosted installation from running. Otherwise, they may fight over the restyled
> branch. This can be done by uninstalling the GitHub App entirely, or
> configuring it for specific repositories and excluding the one where you plan
> to use GitHub Actions.

## Usage

Features:

1. Restyle a Pull Request
2. Print instructions to apply locally with `git am`
3. Maintain a sibling PR, if the original was not a Fork
4. Apply the `restyled` label and request review from the author
5. Fail the PR if differences were found

```yaml
name: Restyled

on:
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  restyled:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.ref }}

      - uses: restyled-io/actions/setup@v4
      - id: restyler
        uses: restyled-io/actions/run@v4
        with:
          fail-on-differences: true

      - if: |
          !cancelled() &&
          steps.restyler.outputs.success == 'true' &&
          github.event.pull_request.head.repo.full_name == github.repository
        uses: peter-evans/create-pull-request@v6
        with:
          base: ${{ steps.restyler.outputs.restyled-base }}
          branch: ${{ steps.restyler.outputs.restyled-head }}
          title: ${{ steps.restyler.outputs.restyled-title }}
          body: ${{ steps.restyler.outputs.restyled-body }}
          labels: "restyled"
          reviewers: ${{ github.event.pull_request.user.login }}
          delete-branch: true
```

## Workflow Permissions

The Restyled actions themselves require no permissions. However, `contents:read`
is required for `actions/checkout` and `pull-requests:write` is required for
`peter-evans/create-pull-request`, which are both used in the example above.

Default permissions for workflows can be adjusted in your repository settings,
or a `permissions` key can be used in the workflow itself. For more details, see
the [documentation][permissions-docs].

[permissions-docs]: https://docs.github.com/actions/reference/authentication-in-a-workflow#modifying-the-permissions-for-the-github_token

## Cleaning up Closed PRs

If you close a PR without incorporating Restyled's fixes, the Restyled PR will
remain open. To address this, you can do the following:

First, set an explicit `types` key for which events are handled, so you can
include `closed`:

```diff
 on:
   pull_request:
+    types:
+      - opened
+      - closed
+      - reopened
+      - synchronize
```

Second, make your normal `restyled` job _not_ run for that event:

```diff
 jobs:
   restyled:
+    if: ${{ github.event_name != 'closed' }}
     runs-on: ubuntu-latest
```

Finally, add a new job that does.

It sets up and runs the CLI, which will skip the PR because it's closed, but it
will provide the necessary `restyled-head` output, which you can use to close
the PR with `gh`:

```yaml
restyled-cleanup:
  if: ${{ github.event_name == 'closed' }}
  runs-on: ubuntu-latest
  steps:
    - uses: restyled-io/actions/setup@v4
    - id: restyler
      uses: restyled-io/actions/run@v4
    - run: gh pr close "$BRANCH" --delete-branch || true
      env:
        BRANCH: ${{ steps.restyler.outputs.restyled-head }}
        GH_TOKEN: ${{ github.token }}
```

## License

This software is licensed AGPLv3. See [COPYING](./COPYING).
