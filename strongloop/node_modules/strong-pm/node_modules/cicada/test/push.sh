#!/bin/bash
dir=/tmp/cicada-test/$(node -pe 'Math.random().toString(16).slice(2)')
mkdir -p $dir
cd $dir
echo 'beep boop!' > robot.txt
git init
git add robot.txt
git commit -m 'beep boop'
git push "$1" master
