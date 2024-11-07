# Restyled Actions

> [!IMPORTANT]
> Before using Restyled as a GitHub Action, make sure you prevent any previous
> hosted installation from running. Otherwise, they may fight over the restyled
> branch. This can be done by uninstalling the GitHub App entirely, or
> configuring it for specific repositories and excluding the one where you plan
> to use GitHub Actions.

## Usage Examples

The [`restyle` CLI][restyler] is meant to one thing and do it well: re-format
files according to configuration and commit any changes. The actions in this
repository are for installing the CLI, running it, and exposing its results such
that other, non-restyled actions can be used to do useful things. Below are
example workflows for doing such things.

[restyler]: https://github.com/restyled-io/restyler#readme

In all cases, we recommend creating the workflow as `restyled.yml`, naming it
`Restyled`, and using `concurrency` to cancel redundant jobs:

```yaml
# .github/workflows/restyled.yml

name: Restyled

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Status Check

```yaml
on:
  pull_request:

jobs:
  restyled:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: restyled-io/actions/setup@v4
      - uses: restyled-io/actions/run@v4
        with:
          fail-on-differences: true
```

### Code Suggestion Comments

> [!WARNING]
> This is a relatively new feature. There may be cases where not all fixes
> appear as comments.

```yaml
on:
  pull_request:

jobs:
  restyled:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: restyled-io/actions/setup@v4
      - uses: restyled-io/actions/run@v4
        with:
          suggestions: true
          show-patch: false
          show-patch-command: false
```

### Upload Patch Artifact

> [!WARNING]
> This has not been tested yet, but should work in theory.

```yaml
on:
  pull_request:

jobs:
  restyled:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: restyled-io/actions/setup@v4
      - id: restyler
        uses: restyled-io/actions/run@v4

      - if: ${{ steps.restyler.outputs.patch }}
        run: |
          cat >>/tmp/restyled.diff <<'EOM'
          ${{ steps.restyler.outputs.patch }}
          EOM

      - id: upload
        uses: actions/upload-artifact@v4
        with:
          path: /tmp/restyled.diff
          if-no-files-found: ignore
          overwrite: true

      - if: ${{ steps.upload.outputs.artifact-url }}
        run: |
          cat >>"$GITHUB_STEP_SUMMARY" <<'EOM'
          ## Restyled

          To apply these fixes locally, run:

              curl '${{ steps.upload.outputs.artifact-url }}' | unzip -p - restyled.diff | git am

          EOM
```

### Sibling PRs (no forks, no cleanup)

```yaml
on:
  pull_request:

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

      - if: ${{ !cancelled() && steps.restyler.outputs.success == 'true' }}
        uses: peter-evans/create-pull-request@v7
        with:
          base: ${{ steps.restyler.outputs.restyled-base }}
          branch: ${{ steps.restyler.outputs.restyled-head }}
          title: ${{ steps.restyler.outputs.restyled-title }}
          body: ${{ steps.restyler.outputs.restyled-body }}
          labels: "restyled"
          reviewers: ${{ github.event.pull_request.user.login }}
          delete-branch: true
```

### Sibling PRs (forks, no cleanup)

```yaml
on:
  pull_request:

jobs:
  restyled:
    # Same as above for non-fork PRs
    if: ${{ github.event.pull_request.head.repo.full_name == github.repository }}

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

      - if: ${{ !cancelled() && steps.restyler.outputs.success == 'true' }}
        uses: peter-evans/create-pull-request@v7
        with:
          base: ${{ steps.restyler.outputs.restyled-base }}
          branch: ${{ steps.restyler.outputs.restyled-head }}
          title: ${{ steps.restyler.outputs.restyled-title }}
          body: ${{ steps.restyler.outputs.restyled-body }}
          labels: "restyled"
          reviewers: ${{ github.event.pull_request.user.login }}
          delete-branch: true

  restyled-fork:
    # For forks we don't create the PR or operate on the head ref
    if: ${{ github.event.pull_request.head.repo.full_name != github.repository }}

    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: restyled-io/actions/setup@v4
      - uses: restyled-io/actions/run@v4
        with:
          fail-on-differences: true
```

### Sibling PRs (forks and cleanup)

```yaml
on:
  pull_request:
    types:
      - opened
      - reopened
      - synchronize
      - closed

jobs:
  restyled:
    if: |
      github.event.action != 'closed' &&
      github.event.pull_request.head.repo.full_name == github.repository

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

      - if: ${{ !cancelled() && steps.restyler.outputs.success == 'true' }}
        uses: peter-evans/create-pull-request@v7
        with:
          base: ${{ steps.restyler.outputs.restyled-base }}
          branch: ${{ steps.restyler.outputs.restyled-head }}
          title: ${{ steps.restyler.outputs.restyled-title }}
          body: ${{ steps.restyler.outputs.restyled-body }}
          labels: "restyled"
          reviewers: ${{ github.event.pull_request.user.login }}
          delete-branch: true

  restyled-fork:
    if: |
      github.event.action != 'closed' &&
      github.event.pull_request.head.repo.full_name != github.repository

    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: restyled-io/actions/setup@v4
      - uses: restyled-io/actions/run@v4
        with:
          fail-on-differences: true

  restyled-cleanup:
    if: ${{ github.event.action == 'closed' }}
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

## Workflow Permissions

The Restyled actions themselves require no permissions. However, `contents:read`
is required for `actions/checkout` and `pull-requests:write` is required for
`peter-evans/create-pull-request`, which are both used above.

Default permissions for workflows can be adjusted in your repository settings,
or a `permissions` key can be used in the workflow itself. For more details, see
the [documentation][permissions-docs].

[permissions-docs]: https://docs.github.com/actions/reference/authentication-in-a-workflow#modifying-the-permissions-for-the-github_token

## License

This software is licensed AGPLv3. See [COPYING](./COPYING).
