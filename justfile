release release_tag:
  git tag {{release_tag}} -m {{release_tag}} -s
  git push --tags
  prev=$(git tag | \
    grep -Fxv '{{release_tag}}' | \
    sort -rV | \
    head -n 1) && \
  gh release create --generate-notes {{release_tag}} --notes-start-tag "$prev" --verify-tag

update-major:
  vmajor=$(git tag | \
    sort -rV | \
    head -n 1 | \
    sed '/^\(v[0-9]\+\)\..*$/!d; s//\1/') && \
  git tag -f "$vmajor" -m "$vmajor" -s
  git push --tags -f
