# Run Restyle

Run the restyle CLI on changed files in a PR

<!-- action-docs-usage source="action.yml" project="restyled-io/actions/run" version="v2" -->

## Usage

```yaml
- uses: restyled-io/actions/run@v2
  with:
    github-token:
    # Token used to query for PR details
    #
    # Required: false
    # Default: ${{ github.token }}

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
```

<!-- action-docs-usage source="action.yml" project="restyled-io/actions/run" version="v2" -->

<!-- action-docs-inputs source="action.yml" -->

## Inputs

| name              | description                                                   | required | default               |
| ----------------- | ------------------------------------------------------------- | -------- | --------------------- |
| `github-token`    | <p>Token used to query for PR details</p>                     | `false`  | `${{ github.token }}` |
| `committer-email` | <p>Email used for Restyled commits</p>                        | `false`  | `commits@restyled.io` |
| `committer-name`  | <p>Name used for Restyled commits</p>                         | `false`  | `Restyled.io`         |
| `log-level`       | <p>Set <code>restyle</code>'s <code>LOG_LEVEL</code></p>      | `false`  | `info`                |
| `log-format`      | <p>Set <code>restyle</code>'s <code>LOG_FORMAT</code></p>     | `false`  | `tty`                 |
| `log-breakpoint`  | <p>Set <code>restyle</code>'s <code>LOG_BREAKPOINT</code></p> | `false`  | `200`                 |

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