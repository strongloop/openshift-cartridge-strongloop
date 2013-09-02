# Clustering the sample blog application

Clustering the application means using Node's built-in support for running as a
cluster of identical workers,
all listening on the same port. It's possible to use the
[cluster](http://nodejs.org/docs/latest/api/cluster.html)
module directly, but in keeping with the node core design philosophy of
providing fundamental mechanism, the cluster module has very basic functionality. 
Instead, we will use the strong-cluster-control module to both start a cluster,
and also allow run-time management of the cluster from the command line.

Once you start the cluster controller in your app, it automatically maintains a
set number of workers, and listens on a control port so you can reconfigure your
cluster at run-time.

Functionality of the `clusterctl` utility is straight-forward:

- status: worker cluster IDs and process IDs
- set-size: set the number or workers you want in your cluster
- disconnect: disconnect all the workers, causing the controller to start new
  ones
- fork: fork another worker

If you think your node instance are under-utilized, and it makes sense to have
less workers, you can set the size lower without taking your application down.
Or if your node instances are running as hard as they can, and you still have
free CPU you can increase the number of workers.

The cluster-controller might also help you do live upgrades of your workers. If
you have updated the source, and want to restart all your workers, disconnect
them. As they exit, the controller will fork new ones to replace them, which
will be running the new code.

So, lets get started. We are going to add two small blocks of code to the
sample-blog's app.js, that's all it takes. At the very top, after the

    , setup = require('./app-setup.js');

Add the following code:


    if(cluster.isMaster) {
      control.start({
        size: control.CPUS
      });
    } else {

and at the very end of the file, as the very last line, add a single `}`:

    }

to match the `else {` you added above.

As a last step, you need to install the strong-cluster-control module, and you
will be ready to run the app:

    $ slnode install --save strong-cluster-control
    $ node app

The app.js will now run as the cluster master, maintaining the cluster size. We
chose a cluster size according to the number of CPUs you have. This is a good
default, but you should do performance tuning to confirm that this is the right
choice for your application under load.

If you decide that it is not the right choice, you don't have to restart your
app. Lets look at the other aspect of strong-cluster-control, the `clusterctl`
command line interface. In the sample-app directory, run:

    $ ./node_modules/.bin/clusterctl 
    worker count: 2
    worker id 0: { pid: 7696 }
    worker id 1: { pid: 7703 }

Note that we are running the CLI from your locally installed node modules. It
will always be there, but if you would like to install it globally, you can do
this in the standard node way:

    $ slnode install -g strong-cluster-control

Which should install the `clusterctl` utility into your path.

Now, perhaps you decide you want 4 workers, instead of 2, to get better
utilization of your system, try this:

    $ ./node_modules/.bin/clusterctl set-size 4
    $ ./node_modules/.bin/clusterctl status
    worker count: 4
    worker id 0: { pid: 7696 }
    worker id 1: { pid: 7703 }
    worker id 2: { pid: 7705 }
    worker id 3: { pid: 7707 }


For more information on the strong-cluster-control modules, see the
[[FIXME strong-cluster-control blog]],
or check out the API and CLI documentation on
[github](http://github.com/strongloop/strong-cluster-control).