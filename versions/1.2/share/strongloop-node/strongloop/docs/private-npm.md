# Private NPM registry

Any team building private source, non-trivial Node.js applications soon
realizes the need for a private NPM registry. Here is short guide on how to
configure one yourself.

## Setup the server

The first step is to setup a Reggie instance which will act as your npm
registry.

1. Prepare a server machine for the registry. The machine should be accessible
by all team members and has node.js installed.

2. Install Reggie as a global application

        $ npm install -g reggie

3. Create a directory where Reggie will store all packages and other run-time
data.

        $ mkdir ~/reggie-data

4. Start the Reggie server (at the default port 8080)

        $ reggie-server -d ~/reggie-data

  You might want to extend your `init.d` scripts so that the Reggie server
  is automatically started after reboots.

  Check [Reggie's manual](https://github.com/mbrevoort/node-reggie/blob/master/README.md#start-up-options)
  on how to change the default port and other settings.

## Publishing packages

First install the reggie CLI client on your development machine:

    $ npm install -g reggie

Then you can publish a package to your private registry using the `publish`
command:

    $ reggie -u http://{reggie-host}:8080/ publish

## Specifying package dependencies

The npm client does not support multiple registries (yet), but fortunatelly
it can download packages from any URL.

Use the following command to install a 1.0.0 version of a private package named
'private-helpers':

    $ npm install --save http://{reggie-host}:8080/package/private-helpers/1.0.0

This will also add a dependency entry into your `package.json` file:

    dependencies: {
      "private-helpers": "http://{reggie-host}:8080/package/private-helpers/1.0.0"
    }

Reggie supports version wildcards too, consult
[the manual](https://github.com/mbrevoort/node-reggie/blob/master/README.md#resolving-packages-from-reggie)
for description of wildcard version URLs.