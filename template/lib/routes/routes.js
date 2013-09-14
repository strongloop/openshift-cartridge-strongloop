
/*!  {{{ section: 'Module-Exports'  */

/**
 *  Returns the routing table entries + route handlers for the application.
 *
 *  Examples:
 *    var routes = require('./lib/routes/routes.js');
 *    var rt = routes.getRoutes();
 *
 *  @return  {Dict}  Dictionary containing app routing information.
 *  @api     public
 */
exports.getRoutes = function() {
  var rt = { 'get': { }, 'post': { } };

  rt.get['/health'] = function(req, res) {
    return res.send('42\n');
  };

  rt.get['/'] = rt.get['/index.html'] = function(req, res) {
    var zvers = '';
    Object.keys(process.versions).forEach(function(k) {
      zvers += k + ': ' + process.versions[k] + '\n';
    });

    var zenv = '';
    Object.keys(process.env).forEach(function(k) {
      zenv += k + ': ' + process.env[k] + '\n';
    });

    var zheading = 'Yo - Welcome to StrongLoop Suite on OpenShift';
    //if (process.env.STRONGLOOP_PLATFORM != 'Local') {
    //  zheading += ' on ' + process.env.STRONGLOOP_PLATFORM;
    //}

    return res.render('index', {
       title:    'Hello StrongLoop',
       heading:  zheading,
       platform: 'OpenShift',
       //versions: zvers,
       env:      zenv
    });
  };

  return rt;

};  /*  End of function  getRoutes.  */


/*!
 * }}} // End of section Module-Exports.
 * ---------------------------------------------------------------------
 */

