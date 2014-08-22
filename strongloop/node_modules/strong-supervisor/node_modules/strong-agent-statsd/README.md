# strong-agent-statsd

strong-agent middleware for publishing metrics via statsd protocol.

The statsd protocol is supported by large ecosystem of servers and plugins,
allowing publishing into on-premise or custom infrastructure.

See [strong-agent](https://www.npmjs.org/package/strong-agent).

## Integration points

There are a number of integration points where strong-agent metrics can be
published into hosted or on-premise monitoring and reporting infrastructure.

1. strong-agent metrics can be collected directly using the
   `require('strong-agent').use()` API, the strong-agent-statsd
   [source](https://github.com/strongloop/strong-agent-statsd) may be used as an
   example.
2. strong-agent-statsd can publish metrics using the statsd protocol to any
   of a number of
   [servers](https://github.com/etsy/statsd/wiki#server-implementations)
   1. [statsd](https://github.com/etsy/statsd) is the original server, it has:
       1. a built-in [graphite](http://graphite.wikidot.com/) backend, where
       graphite might be local or [hosted](https://www.hostedgraphite.com/)
       2. other [backends](https://github.com/etsy/statsd/wiki/Backends),
       such as for Zabbix, etc.
       3. support for custom backends, they are easy to write, one of the above
       backends can be used as an example
   2. other metrics consumers, such as
   [datadog](http://docs.datadoghq.com/guides/basic_agent_usage/), have agents
   that support the statsd-protocol
3. strong-agent-statd can publish into a custom server written to support
   existing on-premise infrastructure, the statsd
   [protocol](https://github.com/b/statsd_spec) is quite simple.

Most metrics reported by strong-agent are 'gauges', a measured value, but a few
metrics are best reported as 'counts', values that count events. There are other
[statsd data types](https://github.com/b/statsd_spec#metric-types--formats), but
none are relevant to the metrics currently published by strong-agent.

This publisher uses the [lynx](https://www.npmjs.org/package/lynx) client.

## publisher = require('strong-agent-statsd')([options])

Module returns a constructor for a publisher function. The publisher requires
no options, but the following are allowed:

- `options.host` (String) The host to connect to, the default is localhost,
  as statsd servers usually run on the same host as the client.
- `options.port` (Number) The port to connect to, the default is `8125`, the
  default port used by the original statsd server and by most others.
- `options.scope` (String) A scope to prepend to the metric name before
  publication, default is none.
  
  
Metrics names are hierarchical dot-seperated strings. When reported by statsd,
they will most likely need to fit into a larger hierarchy of all the
applications, or perhaps an entire system or company.

Statsd servers usually have the ability to scope metrics reported to them, but
if there are multiple clients reporting to the same server, or if the scope
should contain information best known to the client (process ID, application
name, cluster worker ID) the scoping can occur at source.

## Example

Example integration with strong-agent:

    require('strong-agent').use(
      require('strong-agent-statsd')()
    );

