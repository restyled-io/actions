# Setup Restyled Demo

Create the files defined in our Restylers test suites, such that `restyle` can
be run on them as a form of demo or integration test.

## Usage

```yaml
- uses: restyled-io/actions/setup-demo@v4
  with:
    channel: stable
    # restylers.yaml channel to base things on
    #
    # Required: false
    options:
    # Additional options to pass to generation
    #
    # Required: false
```

## Inputs

| name      | description                                     | required | default  |
| --------- | ----------------------------------------------- | -------- | -------- |
| `channel` | <p>restylers.yaml channel to base things on</p> | `false`  | `stable` |
| `options` | <p>Additional options to pass to generation</p> | `false`  |          |

## Outputs

| name       | description                                            |
| ---------- | ------------------------------------------------------ |
| `manifest` | <p>Location the channel manifest was downloaded to</p> |
