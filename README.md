# Restyled Actions

> [!IMPORTANT]
> Before using Restyled as a GitHub Action, make sure you prevent any previous
> hosted installation from running. Otherwise, they may fight over the restyled
> branch. This can be done by uninstalling the GitHub App entirely, or
> configuring it for specific repositories and excluding the one where you plan
> to use GitHub Actions.

Create the file `.github/workflows/restyled.yml`:

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
      - uses: restyled-io/actions/setup@v2
      - id: restyler
        uses: restyled-io/actions/run@v2

      # See below
```

Then, to determine what happens when style has been corrected, add some of the
things described below, salted to taste.

## Manage a sibling "Restyled PR"

```yaml
      - uses: peter-evans/create-pull-request@v6
        with:
          base: ${{ steps.restyler.outputs.restyled-base }}
          branch: ${{ steps.restyler.outputs.restyled-head }}
          title: ${{ steps.restyler.outputs.restyled-title }}
          body: ${{ steps.restyler.outputs.restyled-body }}
          delete-branch: true
          # If desired:
          # labels: "restyled"
          # reviewers: ${{ github.event.pull_request.user.login }}
          # team-reviewers: "..."
```

Required permissions: `contents:write`, `pull-requests:write`.

Works for forks? **No**.

## Push the changes directly to the original PR

```yaml
      - run: git push
```

Required permissions: `contents:write`.

Works for forks? **No**

## Emit failing status to the original PR

```yaml
      - if: ${{ steps.restyler.outputs.differences == 'true' }}
        run: |
          echo "Restyled found differences" >&2
          exit 1
```

Or, if you don't need additional steps to run after this (or you configure them
to always run), you can change the `run` invocation to:

```yaml
      - id: restyler
        uses: restyled-io/actions/run@v2
        with:
          fail-on-differences: true
```

Required permission: none.

Works for forks? **Yes**

## Record a patch and emit instructions for applying it

```yaml
      - if: ${{ steps.restyler.outputs.differences == 'true' }}
        run: |
          curl  -d@- -o response.json <some pastebin> <<'EOM'
          ${{ steps.restyler.outputs.git-patch }}
          EOM

          read -r url < <(jq '.url' response.json)

          # Alternatively, you could use the build summary, an annotation, or
          # an add-comment action
          cat <<EOM
          To apply these fixes, checkout your branch, run the following, and push:

            % curl "$url" | git am

          EOM
```

See [here](https://github.com/lorien/awesome-pastebins) for a list of pastebin options.

Required permission: none.

Works for forks? **Yes**

## Complete reference example

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
      - uses: restyled-io/restyler/setup@v2
      - id: restyler
        uses: restyled-io/restyler/run@v2
        with:
          fail-on-differences: true

      # Always make the patch available
      - if: ${{ !cancelled() && steps.restyler.outputs.differences == 'true' }}
        run: |
          curl  -d@- -o response.json <some pastebin> <<'EOM'
          ${{ steps.restyler.outputs.git-patch }}
          EOM

          read -r url < <(jq '.url' response.json)

          cat <<EOM
          To apply these fixes, checkout your branch, run the following, and push:

            % curl $url | git -am

          EOM

      # Manage a sibling PR if we're not a fork
      - if: ${{ !cancelled() && github.event.pull_request.head.repo.full_name == github.repository }}
        uses: peter-evans/create-pull-request@v6
        with:
          base: ${{ steps.restyler.outputs.restyled-base }}
          branch: ${{ steps.restyler.outputs.restyled-head }}
          title: ${{ steps.restyler.outputs.restyled-title }}
          body: ${{ steps.restyler.outputs.restyled-body }}
          delete-branch: true
          # If desired:
          # labels: "restyled"
          # reviewers: ${{ github.event.pull_request.user.login }}
          # team-reviewers: "..."
```
