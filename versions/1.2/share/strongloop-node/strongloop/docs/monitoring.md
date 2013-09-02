# Monitoring your applications with StrongOps

StrongOps provides real-time monitoring for your Node.js application.  We allow
you to gain detailed, real-time performance monitoring of your Node.js
application services so you can see everything that is happening, as it happens.
This includes understanding system usage at every moment in time to uncover and
resolve issues within the application as they arise.

Adding StrongOps support is easy, visit [nodefly](http://nodefly.com) and
register. Once you've registered, visit the [howto
page](http://nodefly.com/#howto), and copy the API key out of section "2. Code",
its a long hexadecimal string.

Insert the following code at the very top of app.js (it must be the first code
run by your app):

    require('strong-agent').profile(
      'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      ['com.strongloop.example.blog']
    );

where the series of 'xx...xx' will be your key.

As a last step, you need to install the strong-agent module, and you will be
ready to run the app:

    $ slnode install --save strong-agent
    $ node app

That's all it takes! Now go back to the nodefly home page, and wait for the
dashboard to appear with live real-time performance data (the dashboard won't be
visible until the app starts to report performance data).

For more information about StrongOps and nodefly, see [[FIXME]].