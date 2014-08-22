var http = require('http');
var server = http.createServer();

server.on('request', echo);
server.on('listening', listening);
server.listen(process.argv[2] || process.env.PORT || 7000);

function echo(req, res) {
  console.log('%j %s %s %s',
              new Date(), req.socket.remoteAddress, req.method, req.url);
  res.write(req.method + ' ' + req.url + '\n\n');
  res.write(JSON.stringify(req.headers, null, 2));
  res.end('\n');
}

function listening() {
  console.log('http-echo listening on http://%s:%d/',
              server.address().address, server.address().port);
}
