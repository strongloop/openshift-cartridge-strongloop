# SLNode URL Saver Example

This example app is shows how to use `express` routes with the `Request` and `Q` modules packaged with SLNode. The app presents a RESTful API to create and then retrieve content from named URLs.

## Running the Example

    $ npm install
    $ node .
    Listening on port 3000...

Once the example is running, the following resources are available:

## PUT /ID?url=URL

Creates a new document at /ID, based on data from URL.

## GET /ID

Retrieves a previously created document.
