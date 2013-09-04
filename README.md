openshift-cartridge-strongloop
==============================

## Openshift Cartridge for StrongLoop Suite
This OpenShift Cartridge contains the StrongLoop Distribution in its entirety.  It includes a private mBaaS, certified modules, an operations console and cluster management capabilities. StrongLoop Suite is open source and available on-premise or in the cloud. It leverages the accessibility of JavaScript and the power of the Node.js community, so that mobile developers can easily connect to data in the cloud and behind corporate firewalls.

StrongLoop Suite includes LoopBack, an open source mobile framework for creating RESTful, JSON, XML and other APIs. LoopBack ships with a mobile SDK and can be easily extended via community npm modules. Also included in StrongLoop Suite is StrongOps, an operational console specifically for Node.js applications. StrongOps provides deep performance monitoring including CPU profiling and EventLoop stats. Finally, StrongLoop Suite is built on top of StrongNode, a supported package of Node.js. It contains certified and tested modules for developing, testing and maintaining enterprise Node.js applications. The StrongNode package includes advanced debugging, clustering, support for private npm registries and other enterprise tools.

## Running on OpenShift

Create an account at http://www.openshift.com/

Ensure you have the latest version of the
[client tools](https://www.openshift.com/get-started#cli).

Create a node application with StrongLoop Suite:

    rhc create-app yourapp https://raw.github.com/strongloop/openshift-cartridge-strongloop/master/metadata/manifest.yml

That's it! The first build will take a minute or two, so be patient.

When it's done, you'll get a folder 'yourapp' with sample app in your current path,
and you should see a friendly welcome:

    http://yourapp-$namespace.rhcloud.com

## Using StrongLoop Suite on OpenShift

It's quite easy getting access to all StrongLoop CLI tools. Just ssh into the app you just created:

    rhc ssh yourapp

This will get you into your cloud app.  

Explore the [documentation](http://docs.strongloop.com/) and the Quick Start sections for Loopback,  StrongNode and StrongOps. 
