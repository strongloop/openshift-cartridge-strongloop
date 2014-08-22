#!/bin/sh

if ! which vagrant; then
  echo "ok # skip vagrant tests, vagrant not found"
  echo "no vagrant" >&2
  exit
fi

if test -n "$SKIP_VAGRANT"; then
  echo "ok # skip vagrant tests, disabled with SKIP_VAGRANT"
  echo "skip vagrant" >&2
  exit
fi

NODE_TGZ="node-v0.10.29-linux-x64.tar.gz"

if ! test -f $NODE_TGZ; then
  wget http://nodejs.org/dist/v0.10.29/$NODE_TGZ
fi

PKG=$(npm pack ..)

PKG_NAME=$PKG NODE_TGZ=$NODE_TGZ vagrant destroy --force
PKG_NAME=$PKG NODE_TGZ=$NODE_TGZ vagrant up --provision

curl -sI 'http://localhost:8888/foo/bar?baz=quux' || exit 1
