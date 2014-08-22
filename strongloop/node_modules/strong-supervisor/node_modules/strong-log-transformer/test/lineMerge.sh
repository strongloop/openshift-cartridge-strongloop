#!/bin/sh

mkdir -p sandbox
node ../bin/t.js --mergeMultiline < fixtures/lineMerge.in \
                                  > sandbox/lineMerge.test

exec diff -u fixtures/lineMerge.out sandbox/lineMerge.test >&2
