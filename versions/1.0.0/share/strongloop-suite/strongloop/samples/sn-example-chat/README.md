# SLNode Chat Examples

A pair of examples to showcase how to use `socket.io` with a static `express` server and `async` for control flow.

The cluster example also showcases using strongloop cluster modules:

- [strong-agent](https://npmjs.org/package/strong-agent)
- [strong-mq](https://npmjs.org/package/strong-mq), for message pub/sub across
  clusters
- [strong-cluster-socket.io-store](https://npmjs.org/package/strong-cluster-socket.io-store),
  implementation of socket.io store allowing socket.io to work across clusters

See [strongloop/resources](http://strongloop.com/products/resources) for more
information, particularly about the strong-agent.

## Setup

    $ npm install

## Running the Simple Example

    $ node bin/simple 3000
       info  - socket.io started
    Listening on port 3000...

Once the example is running, open `http://localhost:3000` in a browser. As you enter your name, watch the Users list
(on the left) update. Once you press Enter or Send, the message is shared with all connected clients.

## Running the Cluster Example

    $ node bin/cluster 3000
       info  - socket.io started
    Worker 1838 listening on port 3000...
       info  - socket.io started
    Worker 1839 listening on port 3001...

Once the example is running, point one browser to `http://localhost:3000` and another to `http://localhost:3001`. Now,
messages sent to one server process will be shared with the other process.

## Running with strong-agent monitoring

Once you have an API key for nodefly, run the chat samples like:

    $ NODEFLY_KEY=XXXXXX node bin/cluster 3000

And login to the console at http://nodefly.com to see run-time performance
monitoring.
