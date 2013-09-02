# Debugging node applications

In this guide we are going to debug the sample blog application that comes as
a part of StrongLoop Node distribution. See
[Building a blog engine](http://strongloop.com/products/resources#?t=building-a-blog-engine)
for instructions on setting up the application.

## Running the debugger

The blog application is started by the following command:

    $ node app.js

You can run the application in a debugger as follows:

    $ slnode debug app.js

The command will do three steps under the hood:

  1. Start the application in debug mode.
  2. Start node-inspector - a debugger with HTML-based GUI.
  3. Open node-inspector page in your default browser.

Here is a screenshot of a node-inspector page in Chrome:

<img src="node-inspector-initial.png" width="745px" alt="Initial screenshot"></img>

**NOTE:** node-inspector works only in Chrome browser at the moment. If you
are using a different browser, you will have to reopen node-inspector page
in Chrome.

## Working with node-inspector

Now it's the time to set a breakpoint and inspect what's going on under the
hood of our blog application.

Click on the "Show navigator" icon in the upper-left corner to see a tree-list
of all blog source files. Expand "routes" folder and double-click on
"index.js". Click on line number 29 to set a breakpoint at the
beginning of `postComment` function.

You should get a screen like this:

<img src="node-inspector-breakpoint.png" width="745px" alt="Screenshot of a source file with breakpoint set"></img>

Open the blog application in a new tab and submit a comment. You can see that
the page is waiting for the server to respond. This is because
the server process is paused on our breakpoint.

Switch to node-inspector's tab in the browser to inspect the fields of the
incomming http request. Leave your mouse over a variable or a property
to see it's value.

<img src="node-inspector-value-popup.png" width="745px" alt="Screenshot of a property value displayed in a popup"></img>

You can step through javascript statements by pressing F10. Use F8 to resume
script execution after you are done.

Check out [Chrome Developer Tools Guide](https://developers.google.com/chrome-developer-tools/docs/javascript-debugging)
for a walkthrough of other debugger features. (Remember that node-inspector
is based on Chrome Developer Tools and most features work exactly the same.)