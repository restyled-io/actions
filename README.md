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

![](./files/failing-status.png)

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

> [!NOTE]
> If combining `fail-on-differences` with other examples below, make sure you
> update the conditions on later steps that should run when differences are
> found (but not if restyler errors):
>
> ```yaml
> if: ${{ !cancelled && steps.restyler.outputs.success == 'true' }}
> ```

### Code Suggestion Comments

![](./files/suggestion.png)

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
```

### Upload Patch Artifact

![](./files/patch-artifact.png)

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

      - if: ${{ steps.restyler.outputs.git-patch }}
        run: |
          cat >>/tmp/restyled.diff <<'EOM'
          ${{ steps.restyler.outputs.git-patch }}
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

          To apply these fixes locally,

          1. Download [this patch artifact](${{ steps.upload.outputs.artifact-url }})
          2. Unzip it: `unzip artifact.zip`
          3. Apply it: `git am < restyled.diff`

          EOM
```

### Sibling PRs (no forks, no cleanup)

![](./files/pull-request-event.png)

![](./files/pull-request.png)

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

      - uses: peter-evans/create-pull-request@v7
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
    if: ${{ github.event.pull_request.head.repo.full_name == github.repository }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.ref }}

      - uses: restyled-io/actions/setup@v4

      - id: restyler
        uses: restyled-io/actions/run@v4

      - uses: peter-evans/create-pull-request@v7
        with:
          base: ${{ steps.restyler.outputs.restyled-base }}
          branch: ${{ steps.restyler.outputs.restyled-head }}
          title: ${{ steps.restyler.outputs.restyled-title }}
          body: ${{ steps.restyler.outputs.restyled-body }}
          labels: "restyled"
          reviewers: ${{ github.event.pull_request.user.login }}
          delete-branch: true

  restyled-fork:
    if: ${{ github.event.pull_request.head.repo.full_name != github.repository }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: restyled-io/actions/setup@v4
      - uses: restyled-io/actions/run@v4
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
      github.event.action != 'closed' && # <-- same as above besides this
      github.event.pull_request.head.repo.full_name == github.repository

    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.ref }}

      - uses: restyled-io/actions/setup@v4

      - id: restyler
        uses: restyled-io/actions/run@v4

      - uses: peter-evans/create-pull-request@v7
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
      github.event.action != 'closed' && # <-- same as above besides this
      github.event.pull_request.head.repo.full_name != github.repository

    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: restyled-io/actions/setup@v4
      - uses: restyled-io/actions/run@v4

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
