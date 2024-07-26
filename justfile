release release_tag:
  git tag {{release_tag}} -m {{release_tag}} -s
  git push --tags
  gh release create --generate-notes {{release_tag}} --verify-tag

vmajor := ```
  git tag |
    sort -rV |
    head -n 1 |
    sed '/^\(v[0-9]\+\)\..*$/!d; s//\1/'
```

update-major:
  git tag -f "{{vmajor}}" -m "{{vmajor}}" -s
  git push --tags -f
