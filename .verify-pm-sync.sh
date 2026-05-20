#!/usr/bin/env bash
# Compare each repo's origin/<ref>:docs/project-management/* blob hashes
# against documents working tree files via git hash-object.

set -uo pipefail

WORKSPACE="D:/workspace/final-project-syn"
DOC="$WORKSPACE/documents"

# repo -> ref
declare -A REF=(
  [synapse-knowledge-svc]=dev
  [synapse-gitops]=main
  [synapse-shared]=main
  [synapse-platform-svc]=dev
  [synapse-frontend]=dev
  [synapse-learning-svc]=dev
  [synapse-engagement-svc]=dev
)

mismatch=0
match=0
missing=0

for repo in "${!REF[@]}"; do
  ref="${REF[$repo]}"
  cd "$WORKSPACE/$repo" || { echo "ERR cd $repo"; continue; }

  while IFS=$'\t' read -r meta path; do
    [ -z "$path" ] && continue
    src_hash=$(echo "$meta" | awk '{print $3}')
    doc_file="$DOC/$path"
    if [ ! -f "$doc_file" ]; then
      echo "MISSING_IN_DOC | $repo:$ref | $path"
      missing=$((missing+1))
      continue
    fi
    doc_hash=$(git -C "$DOC" hash-object "$doc_file")
    if [ "$src_hash" = "$doc_hash" ]; then
      match=$((match+1))
    else
      echo "MISMATCH       | $repo:$ref | $path | src=${src_hash:0:8} doc=${doc_hash:0:8}"
      mismatch=$((mismatch+1))
    fi
  done < <(git ls-tree -r "origin/$ref" docs/project-management/)
done

echo
echo "---- SUMMARY ----"
echo "match    : $match"
echo "mismatch : $mismatch"
echo "missing  : $missing"
