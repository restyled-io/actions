release release_tag:
  git tag {{release_tag}} -m {{release_tag}} -s
  major="$(echo {{release_tag}} | sed '/^\(v[0-9]\+\)\..*$/!d; s//\1/')"; \
    git tag -f "$major" -m "$major" -s
