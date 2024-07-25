# Restyled Actions

This repository contains two actions, to be used together:

1. [actions/setup](./setup/README.md).
1. [actions/run](./run/README.md).

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
      - uses: restyled-io/actions/setup@v2
      - uses: restyled-io/actions/run@v2
```
