# Restyled Actions

## Usage

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
      - uses: restyled-io/actions/setup@v1
      - uses: restyled-io/actions/run@v1
```

## Setup

<!-- action-docs-inputs source="setup/action.yml" -->

<!-- action-docs-outputs source="setup/action.yml" -->

## Run

<!-- action-docs-inputs source="run/action.yml" -->

<!-- action-docs-outputs source="run/action.yml" -->
