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

      - uses: restyled-io/restyler/setup@v3
      - id: restyler
        uses: restyled-io/restyler/run@v3
        with:
          fail-on-differences: true

      - if: ${{ !cancelled() && github.event.pull_request.head.repo.full_name == github.repository }}
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
