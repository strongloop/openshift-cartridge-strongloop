/**
 * This is a workaround to node-tar which writes in chunks of 512 bytes by monkey-patching the fs api
 */
require('./fstream-patch');

var zlib = require('zlib');
var tar = require('tar');
var fs = require('fs');
var path = require('path');
var url = require('url');
var request = require('request');

var info = require('./detect.js');

/*
 * Get the http/https proxy for the give url string from the npm configuration
 * The npm configuration properties are passed into the script as
 * process.env.npm_config_<npm_property_name>
 */
function getProxyFor(urlStr) {
  var urlObj = url.parse(urlStr);

  if (urlObj.protocol === 'http') {
    // https://www.npmjs.org/doc/misc/npm-config.html#proxy
    return process.env.npm_config_proxy;
  }
  if (urlObj.protocol === 'https') {
    // https://www.npmjs.org/doc/misc/npm-config.html#https-proxy
    return process.env.npm_config_https_proxy || process.env.npm_config_proxy;
  }
  return null;
}

module.exports = function (url, version, dest, cb) {
  var targz = 'loopback-oracle-' + info.platform + '-' + info.arch + '-' + (version || info.version) + '.tar.gz';
  if (!url) {
    url = path.join(__dirname, '../../loopback-oracle-builder/build', info.platform, targz);
  } else {
    url = url + '/' + targz;
  }
  console.log('Downloading/Extracting ' + url);
  if (!dest) {
    dest = './node_modules';
  }
  var gunzip = zlib.createGunzip({chunkSize: 1024 * 1024});
  var src = null;
  if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
    var options = {};
    var proxyUrl = getProxyFor(url);
    if (proxyUrl) {
      console.log('HTTP proxy: ' + proxyUrl);
      options = {
        proxy: proxyUrl
      };
    }
    src = request.get(url, options);
  } else {
    if (fs.existsSync(url)) {
      src = fs.createReadStream(url);
    } else {
      console.error('File doesn\'t exist: ', url);
    }
  }
  if (src) {
    src.on('error', function (error) {
      console.error('Error downloading the tarball from ' + url, error);
      console.log('Please see more information at http://docs.strongloop.com/display/DOC/Installing+the+Oracle+connector');
      cb && cb(error);
    });

    src.pipe(gunzip).pipe(tar.Extract({ path: dest }))
      .on('end',function () {
        console.log(url + ' is now extracted to ' + dest);
        cb && cb();
      }).on('error', function (error) {
        cb && cb(error);
      });
  }
};

if (require.main === module) {
  module.exports(process.argv[2], process.argv[3]);
}
