# Getting Started with StrongLoop Suite

In this Getting Started guide we are going to start with installing StrongLoop Suite then configure and run a sample application -- a blog engine -- to demonstrate how one can build an application using StrongLoop Suite.

## The What of StrongLoop Suite

StrongLoop Suite is a packaged distribution of Node.js, NPM and a set of StrongLoop utilities (not available in the beta release). All of these are installed in global locations, meaning you can use the "node" and "npm" commands from your terminal once you install StrongLoop Suite.

## The How of StrongLoop Suite

As a packaged distribution of Node.js and NPM, at its core you can consider using StrongLoop Suite as you would use Node.js. Therefore, how StrongLoop Suite works is effectively identical except that the packages have been tested, certified, and you can get support from StrongLoop if you're using StrongLoop Suite.

In this guide we'll get you going with StrongLoop Suite and explore a sample blogging application.

## Installing StrongLoop Suite

First, [download](http://www.strongloop.com/products#downloads) the StrongLoop Suite distribution for your platform.

_For Windows or MacOS X, the installer will guide you through the installation._

_NOTE: On MacOS Mountain Lion, you'll need to right-click or command-click the .pkg file and choose Open or else you'll get a security warning. On Windows, please accept the "Unknown" publisher. The packages will be signed when the 1.0.0 release is out._

**Debian**

For Debian packages, use the following command:

    $ sudo dpkg -i <deb file name>
    
**RPM**

For RPM packages, use the following command:

    $ sudo rpm -i <rpm file name>
    
Once you finish the installation, the `node` command will be available on the `PATH`.

 - **Linux (Deb & RPM)** - /usr/bin
 - **MacOS** - /usr/local/bin
 - **Windows (x64)** - C:\Program Files\StrongLoop Suite
 - **Windows (x86)** - C:\Program Files (x86)\StrongLoop Suite