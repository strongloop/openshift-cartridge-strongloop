## Release Notes

### 1.1.1

- node: update to v0.10.15

### 1.1.0

- node: update to v0.10.13

Changes to slnode command line:

- debug: new command to start debugger and open web console to it


Changes to existing strongloop modules:

- sl-config-loader: renamed to strong-config-loader
- sl-module-loader: renamed to strong-module-loader
- sl-mq: renamed to strong-mq and now supports ActiveMQ via STOMP
- sl-task-emitter: renamed to strong-task-emitter


New supported strongloop modules:

- strong-agent: monitoring agent for StrongOps/Nodefly, renamed from nodefly
- strong-cluster-connect-store: connect session store using node's native cluster messaging
- strong-cluster-control: extension to node cluster allowing run-time management of workers
- strong-cluster-socket.io-store: socket.io store using node's native cluster messaging
- strong-store-cluster: key-value-store which lets you share data between cluster workers


New supported community modules:

- node-inspector: Web Inspector based nodeJS debugger
- node-reggie: light weight alternative to a full blown npm registry

### 1.0.2

- node: update to v0.10.11


### 1.0.1

- node: update to v0.10.9

New supported strongloop modules:

- sl-config-loader: recursively load config files
- sl-module-loader: separate your app into modules loaded by config files
- sl-mq: MQ API with cluster integration, implemented over various message queues
- sl-task-emitter: perform an unknown number of async tasks recursively

New supported community modules:

- async: v0.2.8
- q: v0.9.3
- request: 2.21.0


### 1.0.0

- node: update to v0.10.7


### 1.0.0-beta2

#### Added `slnode` command

**slnode**

 - Linux (Debian and RPM) - **/usr/lib/node_modules/slnode/bin/slnode**
 - Mac OSX - **/usr/local/lib/node_modules/slnode/bin/slnode**
 - Windows (x64) - **C:\Program Files\StrongLoop Node\slnode.cmd**
 - Windows (x86) - **C:\Program Files (x86)\StrongLoop Node\slnode.exe**

#### Added support for StrongLoop npm repo (registry.strongloop.com)

### 1.0.0-beta

#### Commands / Executables

**node**

 - Linux (Debian and RPM) - **/usr/bin/node**
 - Mac OSX - **/usr/local/bin/node**
 - Windows (x64) - **C:\Program Files\StrongLoop Node\node.exe**
 - Windows (x86) - **C:\Program Files (x86)\StrongLoop Node\node.exe**
 
**npm**

 - Linux (Debian and RPM) - **/usr/bin/npm**
 - Mac OSX - **/usr/local/bin/npm**
 - Windows (x64) - **C:\Program Files\StrongLoop Node\npm.cmd**
 - Windows (x86) - **C:\Program Files (x86)\StrongLoop Node\npm.cmd**

**node-waf**

 - Linux (Debian and RPM) - **/usr/bin/node-waf**
 - Mac OSX - **/usr/local/bin/node-waf**
 
#### Docs / Example App

**Strongloop Docs**

 - Linux (Debian and RPM) - **/usr/share/strongloop-node/docs**
 - Mac OSX - **/usr/local/share/strongloop-node/docs**
 - Windows (x64) - **C:\Program Files\StrongLoop Node\strongloop-docs**
 - Windows (x86) - **C:\Program Files (x86)\StrongLoop Node\strongloop-docs**
 
**Sample App**

 - Linux (Debian and RPM) - **/usr/share/strongloop-node/samples/sample-blog**
 - Mac OSX  - **/usr/local/share/strongloop-node/samples/sample-blog**
 - Windows (x64) - **C:\Program Files\StrongLoop Node\strongloop-samples\sample-blog**
 - Windows (x86) - **C:\Program Files (x86)\StrongLoop Node\strongloop-samples\sample-blog**
 
#### Supported Modules

 - **connect** - v2.7.2
 - **express** - v3.1.0
 - **mongoose** - v3.5.7
 - **passport** - v0.1.16
 
