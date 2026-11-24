#!/bin/sh
# Build the release files into dist/ and print the commands to publish them.
# Usage: ./release.sh
set -eu
cd "$(dirname "$0")"
sh build-ipk.sh
v="$(sed -n 's/^ODASH_VERSION=//p' odash/files/usr/bin/odash | head -n 1)"
cd dist
cp "oDash-$v.tar.gz" oDash.tar.gz
for f in "oDash-$v.tar.gz" oDash.tar.gz; do sha256sum "$f" > "$f.sha256"; done
echo "Release files for v$v are in dist/:"; ls -1
echo
echo "Publish with the GitHub CLI:"
echo "  gh release create v$v dist/oDash-$v.tar.gz dist/oDash-$v.tar.gz.sha256 dist/oDash.tar.gz dist/oDash.tar.gz.sha256 dist/*.ipk --title \"oDash $v\" --notes-file RELEASE_NOTES.md"
