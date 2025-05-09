# Run Restyle

Run the restyle CLI on changed files in a PR

<!-- action-docs-usage source="action.yml" project="restyled-io/actions/run" version="v4" -->

## Usage

```yaml
- uses: restyled-io/actions/run@v4
  with:
    paths:
    # New-line separated paths to restyle, default is paths changed in the PR
    #
    # Required: false
    # Default: ""

    github-token:
    # Token used to query for PR details
    #
    # Required: false
    # Default: ${{ github.token }}

    suggestions:
    # Add suggestion comments of restyled changes
    #
    # Required: false
    # Default: false

    suggestion-limit:
    # Limit the number of suggestion comments left
    #
    # Required: false
    # Default: ""

    show-patch:
    # Log the patch produced by Restyled with git format-patch
    #
    # Required: false
    # Default: true

    show-patch-command:
    # Log a copy/paste-able command to apply the patch produced by Restyled with
    # git-am
    #
    # Required: false
    # Default: true

    committer-email:
    # Email used for Restyled commits
    #
    # Required: false
    # Default: commits@restyled.io

    committer-name:
    # Name used for Restyled commits
    #
    # Required: false
    # Default: Restyled.io

    debug:
    # Past `--debug` to `restyle`
    #
    # Required: false
    # Default: false

    dry-run:
    # Pass `--dry-run` to `restyle`
    #
    # Required: false
    # Default: false

    fail-on-differences:
    # Pass `--fail-on-differences` to `restyle`
    #
    # Required: false
    # Default: false

    image-cleanup:
    # Pass `--image-cleanup` to `restyle`
    #
    # Required: false
    # Default: false

    manifest:
    # Path to pass as `--manifest` to `restyle`
    #
    # Required: false
    # Default: ""

    no-commit:
    # Pass `--no-commit` to `restyle`
    #
    # Required: false
    # Default: false

    no-pull:
    # Pass `--no-pull` to `restyle`
    #
    # Required: false
    # Default: false
```

<!-- action-docs-usage source="action.yml" project="restyled-io/actions/run" version="v4" -->

<!-- action-docs-inputs source="action.yml" -->

## Inputs

| name                  | description                                                                              | required | default               |
| --------------------- | ---------------------------------------------------------------------------------------- | -------- | --------------------- |
| `paths`               | <p>New-line separated paths to restyle, default is paths changed in the PR</p>           | `false`  | `""`                  |
| `github-token`        | <p>Token used to query for PR details</p>                                                | `false`  | `${{ github.token }}` |
| `suggestions`         | <p>Add suggestion comments of restyled changes</p>                                       | `false`  | `false`               |
| `suggestion-limit`    | <p>Limit the number of suggestion comments left</p>                                      | `false`  | `""`                  |
| `show-patch`          | <p>Log the patch produced by Restyled with git format-patch</p>                          | `false`  | `true`                |
| `show-patch-command`  | <p>Log a copy/paste-able command to apply the patch produced by Restyled with git-am</p> | `false`  | `true`                |
| `committer-email`     | <p>Email used for Restyled commits</p>                                                   | `false`  | `commits@restyled.io` |
| `committer-name`      | <p>Name used for Restyled commits</p>                                                    | `false`  | `Restyled.io`         |
| `debug`               | <p>Past <code>--debug</code> to <code>restyle</code></p>                                 | `false`  | `false`               |
| `dry-run`             | <p>Pass <code>--dry-run</code> to <code>restyle</code></p>                               | `false`  | `false`               |
| `fail-on-differences` | <p>Pass <code>--fail-on-differences</code> to <code>restyle</code></p>                   | `false`  | `false`               |
| `image-cleanup`       | <p>Pass <code>--image-cleanup</code> to <code>restyle</code></p>                         | `false`  | `false`               |
| `manifest`            | <p>Path to pass as <code>--manifest</code> to <code>restyle</code></p>                   | `false`  | `""`                  |
| `no-commit`           | <p>Pass <code>--no-commit</code> to <code>restyle</code></p>                             | `false`  | `false`               |
| `no-pull`             | <p>Pass <code>--no-pull</code> to <code>restyle</code></p>                               | `false`  | `false`               |

<!-- action-docs-inputs source="action.yml" -->

<!-- action-docs-outputs source="action.yml" -->

## Outputs

| name                  | description                                                                            |
| --------------------- | -------------------------------------------------------------------------------------- |
| `success`             | <p><code>true</code> if <code>restyle</code> ran successfully (differences or not)</p> |
| `differences`         | <p><code>true</code> if differences were created by restyling</p>                      |
| `git-patch`           | <p>The restyle commits, formatted for use with <code>git am</code></p>                 |
| `restyled-base`       | <p>The base branch to use if opening fixes as a new PR</p>                             |
| `restyled-head`       | <p>The head branch to use if opening fixes as a new PR </p>                            |
| `restyled-title`      | <p>The title to use if opening fixes as a new PR</p>                                   |
| `restyled-body`       | <p>The body to use if opening fixes as a new PR</p>                                    |
| `suggestions-skipped` | <p>True if there were suggestions we had to skip</p>                                   |

<!-- action-docs-outputs source="action.yml" -->
