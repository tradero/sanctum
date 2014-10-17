var net = require('net');
var BufferStream = require('sandcastle/node_modules/bufferstream');

var Script = require('sandcastle/lib/script').Script;
var SandCastle = require('sandcastle').SandCastle;

//Script.setMaxListeners(0);

Script.prototype.createClient = function(methodName, globals) {

  var _this = this;

  this.sandcastle.sandboxReady(function() {

    // PATCH
    if (_this.exited || _this.sandcastle.sandbox.killed) return;
    // /PATCH

    var client = net.createConnection(_this.sandcastle.getSocket(), function() {
      client.write(JSON.stringify({
        source: _this.source,// the untrusted JS.
        sourceAPI: _this.sourceAPI,// the trusted API.
        globals: JSON.stringify(globals), // trusted global variables.
        methodName: methodName
      }) + '\u0000\u0000'); // the chunk separator
    });

    client.on('close', function() {
      // PATCH
      if (!_this.dataReceived && !_this.sandcastle.sandbox.killed) {
      // /PATCH
        setTimeout(function() {
            //console.log('client close');
          _this.createClient(methodName);
        }, 500);
      }
    });

    client.on('error', function(err) {
      setTimeout(function() {
          //console.log('client error');
        _this.createClient(methodName);
      }, 500);
    });


    var stream = new BufferStream({size:'flexible'});
    stream.split('\u0000\u0000', function(chunk) {
      client.end();
      _this.onExit(methodName, chunk);
    });

    stream.split('\u0000', function (chunk) {
      _this.onTask(client, methodName, chunk); // handling the task
    });

    client.on('data', function(chunk) {
      _this.dataReceived = true;
      stream.write(chunk);
    });
  });
};

Script.prototype.createTimeout = function(methodName) {
    var _this = this;

    if (this.timeoutId)
    {
        //console.log('clearing timeout');
        this.sandcastle.sandbox.removeAllListeners('kill');
        clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(function() {
        //console.log('timeouted');
        if (_this.exited || _this.sandcastle.sandbox.killed) return;
        _this.exited = true;
        _this.sandcastle.kickOverSandCastle();
        _this.emit('timeout', methodName);
    }, this.timeout);
    //console.log('cts', this.timeoutId);

    // PATCH: listen to kill signal and clear timeout if sandbox is being killed
    //this.sandcastle.sandbox.removeAllListeners('kill');
    //console.log('creating timeout');
    try
    {
        this.sandcastle.sandbox.on('exit', function ()
        {
            if (!_this.timeoutId) return;

            //console.log('ON KILL');
            clearTimeout(_this.timeoutId);
        });
    } catch (e) {};
    // /PATCH
};

SandCastle.prototype.kill = function() {
    // PATCH: emit kill signal over sandbox
    //console.log('EMITTING KILL SIGNAL');
    //this.sandbox.emit('kill');
    // /PATCH

    clearInterval(this.heartbeatId);
    // PATCH: emit kill signal over sandbox
    //this.sandbox.removeAllListeners('kill');
    // /PATCH
    this.sandbox.removeAllListeners('exit');
    this.sandbox.kill('SIGHUP');
    process.removeAllListeners('exit');
};
