# Run Restyle

Run the restyle CLI on changed files in a PR

<!-- action-docs-usage source="action.yml" project="restyled-io/actions/run" version="v2" -->

## Usage

```yaml
- uses: restyled-io/actions/run@v2
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

    fail-on-differences:
    # Exit non-zero if differences were created
    #
    # Required: false
    # Default: false

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

    log-level:
    # Set `restyle`'s `LOG_LEVEL`
    #
    # Required: false
    # Default: info

    log-format:
    # Set `restyle`'s `LOG_FORMAT`
    #
    # Required: false
    # Default: tty

    log-breakpoint:
    # Set `restyle`'s `LOG_BREAKPOINT`
    #
    # Required: false
    # Default: 200

    manifest:
    # Path to pass as `--manifest` to `restyle`
    #
    # Required: false
    # Default: ""
```

<!-- action-docs-usage source="action.yml" project="restyled-io/actions/run" version="v2" -->

<!-- action-docs-inputs source="action.yml" -->

## Inputs

| name                  | description                                                                              | required | default               |
| --------------------- | ---------------------------------------------------------------------------------------- | -------- | --------------------- |
| `paths`               | <p>New-line separated paths to restyle, default is paths changed in the PR</p>           | `false`  | `""`                  |
| `github-token`        | <p>Token used to query for PR details</p>                                                | `false`  | `${{ github.token }}` |
| `show-patch`          | <p>Log the patch produced by Restyled with git format-patch</p>                          | `false`  | `true`                |
| `show-patch-command`  | <p>Log a copy/paste-able command to apply the patch produced by Restyled with git-am</p> | `false`  | `true`                |
| `fail-on-differences` | <p>Exit non-zero if differences were created</p>                                         | `false`  | `false`               |
| `committer-email`     | <p>Email used for Restyled commits</p>                                                   | `false`  | `commits@restyled.io` |
| `committer-name`      | <p>Name used for Restyled commits</p>                                                    | `false`  | `Restyled.io`         |
| `log-level`           | <p>Set <code>restyle</code>'s <code>LOG_LEVEL</code></p>                                 | `false`  | `info`                |
| `log-format`          | <p>Set <code>restyle</code>'s <code>LOG_FORMAT</code></p>                                | `false`  | `tty`                 |
| `log-breakpoint`      | <p>Set <code>restyle</code>'s <code>LOG_BREAKPOINT</code></p>                            | `false`  | `200`                 |
| `manifest`            | <p>Path to pass as <code>--manifest</code> to <code>restyle</code></p>                   | `false`  | `""`                  |

<!-- action-docs-inputs source="action.yml" -->

<!-- action-docs-outputs source="action.yml" -->

## Outputs

| name             | description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `differences`    | <p><code>true</code> if differences were created by restyling</p>      |
| `git-patch`      | <p>The restyle commits, formatted for use with <code>git am</code></p> |
| `restyled-base`  | <p>The base branch to use if opening fixes as a new PR</p>             |
| `restyled-head`  | <p>The head branch to use if opening fixes as a new PR </p>            |
| `restyled-title` | <p>The title to use if opening fixes as a new PR</p>                   |
| `restyled-body`  | <p>The body to use if opening fixes as a new PR</p>                    |

<!-- action-docs-outputs source="action.yml" -->
