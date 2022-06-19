#!/usr/bin/env bash

set -euo pipefail

SRC_DIR=$1
BUILD_DIR=$SRC_DIR/.build
cd "$SRC_DIR"
rm -rf "$BUILD_DIR"
mkdir "$BUILD_DIR"

functions=$(ls "$SRC_DIR"/custom-resources)

for function in $functions; do
  cd "$SRC_DIR"/custom-resources/"$function"

  go mod tidy
  go mod download
  go clean -testcache
  go test ./...

  name="${function//.go/}"
  zip="$name".zip
  GOOS=linux go build -o "$name"
  zip "$zip" "$name" &> /dev/null
  rm "$name"
  mv "$zip" "$BUILD_DIR"
  echo "$function build successful. Artifact saved to $BUILD_DIR/$zip."
done