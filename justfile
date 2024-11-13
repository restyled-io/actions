release-tag tag:
  git tag {{tag}} -m {{tag}} -s
  git push --tags
  gh release create --generate-notes {{tag}} --verify-tag

update-major:
  vmajor=$(git tag | \
    sort -rV | \
    head -n 1 | \
    sed '/^\(v[0-9]\+\)\..*$/!d; s//\1/') && \
  git tag -f "$vmajor" -m "$vmajor" -s
  git push --tags -f
