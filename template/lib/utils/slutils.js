var util = require('util');


/*!  {{{ section: 'API-Functions'  */

/**
 *  Formats and logs the message (to the console).
 *
 *  @param  {String}   Message format ala printf.
 *  @param  {Object*}  Parameters for the formatted message.
 *  @api    public
 */
function _log_message() {
  console.log("%s: %s", Date(Date.now() ),
              util.format.apply(null, arguments) );

}  /*  End of function  _log_message.  */



/**
 *  Registers callback to invoke when the process terminates on exit or
 *  due to a specific signal.
 *
 *  @param  {Function}  Callback to invoke when the process terminates.
 *  @api    public
 */
function _setup_termination_handlers(cb) {
  var sigset   = [ 'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 
                   'SIGABRT', 'SIGFPE', 'SIGBUS', 'SIGSEGV', 'SIGTERM'
                 ];

  /*  Handle process on exit and specific signals.  */
  process.on('exit', cb);

  sigset.forEach(function(sig, idx, array) {
    process.on(sig, function() {
      if (cb)
        return cb(sig);

      return(elem);
    });
  });

}  /*  End of function  _setup_termination_handlers.  */


/*!
 *  }}} // End of section API-Functions.
 *  ---------------------------------------------------------------------
 */



/*!  {{{ section: 'Module-Exports'  */

exports.log_message = _log_message;
exports.onTerminate = _setup_termination_handlers;

/*!
 *  }}} // End of section Module-Exports.
 *  ---------------------------------------------------------------------
 */

