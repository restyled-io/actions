# Release a bumped tag, bump=major|minor|patch
release bump:
  t=$(git tag | vbump {{bump}}) && just release-tag "$t" update-major

# Release a specific tag
release-tag tag:
  git tag {{tag}} -m {{tag}} -s
  git push --tags
  gh release create --generate-notes {{tag}} --verify-tag

# Update the major version tag to latest
update-major:
  vmajor=$(git tag | \
    sort -rV | \
    head -n 1 | \
    sed '/^\(v[0-9]\+\)\..*$/!d; s//\1/') && \
  git tag -f "$vmajor" -m "$vmajor" -s
  git push --tags -f
