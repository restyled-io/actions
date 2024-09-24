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
remain open. To address this, you can update the above workflow to also run on
the `closed` event:

```diff
 on:
   pull_request:
+    types:
+      - opened
+      - closed
+      - reopened
+      - synchronize
```

When the workflow runs, Restyler will skip (producing no differences) and the
`create-pull-request-action` will delete the Restyled branch (because of
`delete-branch: true`), and that will trigger GitHub closing the PR.

> [!NOTE]
> if you also enable "Automatically delete head branches" on PRs merge, then the
> above will only work if you close the PR as abandoned, not if you merge it.
> When you merge it, and the head branch is automatically deleted, the above
> workflow fails on the checkout step.
>
> In this case, the simplest thing is to avoid it:
>
> ```diff
>  jobs:
>    restyled:
> +    if: ${{ github.event.pull_request.merged != true }}
>      runs-on: ubuntu-latest
> ```
>
> However, this leaves Restyled PRs around in the merged case. We're not sure of
> the best workaround for this case yet. Suggestions welcome.

## License

This software is licensed AGPLv3. See [COPYING](./COPYING).
