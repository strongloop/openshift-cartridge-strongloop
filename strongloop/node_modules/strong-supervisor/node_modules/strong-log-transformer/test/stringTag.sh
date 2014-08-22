#!/bin/sh

mkdir -p sandbox
node ../bin/t.js --tag SOMETHING_AWESOME < fixtures/basic.in > sandbox/tagged.test

exec diff -u fixtures/tagged.out sandbox/tagged.test >&2
