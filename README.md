openshift-cartridge-strongloop
==============================
# StrongLoop Buildpack for OpenShift 

StrongLoop includes LoopBack, an open source mobile framework for creating RESTful, JSON, and other APIs. LoopBack ships with a mobile SDK and can be easily extended via community npm modules.

Also included in StrongLoop is StrongOps, an operational console specifically for Node.js applications. StrongOps provides deep performance monitoring including CPU profiling, event loop statistics, and more.

Follow the steps in <a href="http://docs.strongloop.com/display/SLC/Getting+started+with+StrongLoop+Controller">Getting started</a> to install Node and the StrongLoop command-line tool, then create a StrongLoop application on your local system using the <a href="http://docs.strongloop.com/display/LB/Create+a+simple+API">slc loopback</a> command.

Then follow the steps below to deploy the app to OpenShift.

## Trying the StrongLoop sample application

Follow these steps to get started using StrongLoop on OpenShift:

1. Login at at http://www.openshift.com/. Create an account if you don't already have one.
2. Ensure you have the latest version of the client tools. As part of this process, you'll run the rhc setup command and choose a unique name (called a namespace) that becomes part of your public application URL.
3. Create an application on OpenShift with the following command:
      
        $ rhc create-app yourapp https://raw.github.com/strongloop/openshift-cartridge-strongloop/master/metadata/manifest.yml

4. Replace "yourapp" with your application name.  You'll see the message: 

        Creating application 'yourapp' ... 

The first build will take a few minutes, so please be patient.

When it's done, you'll get a folder called yourapp (or whatever you chose for your app name) in your current path containing the LoopBack sample app . You'll see a friendly welcome: 

    Your application 'yourapp' is now available.

      URL:        http://yourapp-<namespace>.rhcloud.com/
      SSH to:     527...0069@yourapp-<namespace>.rhcloud.com
      Git remote: ssh://527...0069@yourapp-<namespace>.rhcloud.com/~/git/yourapp.git/
      Cloned to:  <local-path>/yourapp

Where:

  namespace is your OpenShift namespace.
  local-path is the path to your app's source git clone on your local system.

You can now try out the LoopBack sample application running on OpenShift: 
  
  View the LoopBack sample app at the indicated URL that looks like http://yourapp-<namespace>.rhcloud.com/. 
  View the LoopBack API explorer at http://yourapp-<namespace>.rhcloud.com/explorer.

## Deploying your own application to OpenShift

If you created your own LoopBack application, follow these steps to deploy the app on OpenShift.

Add a start command to your package.json and commit it-
        
    "scripts": {
        "start": "slc run"
    }

Add your application to a Git repository.

        $ git init
        $ git add -A
        $ git commit -a -m "Initial Commit"

Get the remote git url of the OpenShift app by running 

    $rhc app show osapp |  grep Git 

This will return something like this: 

    Git URL:    ssh://52a17af15004464d950003bd@openshiftapp-domain.rhcloud.com/~/git/openshiftapp.git/

In your LoopBack app directory, enter this command, where <remote_git_url> is the URL returned above: 

    $ git remote add openshift <remote_git_url>

Deploy as follows:

    $ git push --force openshift master

That's it!  You can now check out your application at the app URL/domain you set for your OpenShift app.  
If you have enabled StrongOps monitoring, log in to strongloop.com and go to the StrongOps dashboard. You should be able to see your app.

