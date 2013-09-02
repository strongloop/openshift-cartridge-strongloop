# Interacting with StrongLoop Node over the command line (slnode)

`slnode` is a command line tool that ships with StrongLoop Node for building and managing applications. It's a Swiss-Army knife tool that provides commands for scaffolding, testing and running Node.js source code.

**`slnode` offers a list of subcommands:**

 - **create**: initialize a new StrongLoop Node project, and create boilerplate for modules and packages
 - **run**: run a specified script
 - **npm**: run a specified npm command
 - **env**: print node environment information
 - **install**: install a package from the StrongLoop Node npm repository and/or community repository
 - **test**: run tests
 - **version**: print the version of StrongLoop Node
 
## Creating applications

The `create` command supports a few program types. The web type is used by default and when generated includes the following:

 - **package.json** - dependencies and other package configuration
 - **app.js** - app entry point and runtime configuration
 - **public** - for holding static assets (images, css, et al)
 - **routes** - route handler functions
 - **views** - templates for rendering html

You can create a simple web application with just a single command:

    $ slnode create web my-app

Run the newly created app with the following commands.

    $ cd my-app
    $ slnode run app.js

## Creating boilerplate for modules

The create command also makes it easy to create boilerplate code for a new module you can then publish to npm or simply `require` in your application. You can do this by executing:

    $ slnode create module my-module
    
This command also supports automatically generating tests:

    $ slnode create module my-module --test

and allows you to supply a stream type to implement:

    $ slnode create module my-module --stream transform

For more information see the help for each command:

    $ slnode create -h
    $ slnode create module -h

## Running node scripts

You can run node scripts with slnode:

    $ slnode [run] [script] [script-args]

For example,

    $ slnode app.js
    $ slnode run app
    $ slnode app.js -a info

## Running npm commands

For your convenience, slnode also supports npm commands as follows:

    $ slnode [npm] <npm-command> [npm-command-args]

Please note that npm is optional if the npm-command name doesn't conflict with other slnode commands or scripts.

For example,

    $ slnode install -f
    $ slnode ls
    $ slnode npm rm express

The commonly used commands are:

 - **[install](https://npmjs.org/doc/install.html)** Install a package
 - **[link](https://npmjs.org/doc/link.html)** Symlink a package folder
 - **[ls/list](https://npmjs.org/doc/list.html)** List installed packages
 - **[outdated](https://npmjs.org/doc/outdated.html)** Check for outdated packages
 - **[prune](https://npmjs.org/doc/prune.html)** Remove extraneous packages
 - **[rebuild](https://npmjs.org/doc/rebuild.html)** Rebuild a package
 - **[dedupe](https://npmjs.org/doc/dedupe.html)** Reduce duplication
 - **[rm/uninstall](https://npmjs.org/doc/rm.html)** Remove a package
 - **[update](https://npmjs.org/doc/update.html)** Update a package
 - **[shrinkwrap](https://npmjs.org/doc/shrinkwrap.html)** Lock down dependency versions
 - **[run-script](https://npmjs.org/doc/run-script.html)** Run arbitrary package scripts
 - **[start](https://npmjs.org/doc/start.html)** Start a package
 - **[stop](https://npmjs.org/doc/stop.html)** Stop a package
 - **[restart](https://npmjs.org/doc/restart.html)** Start a package
 - **[test](https://npmjs.org/doc/test.html)** Test a package 