
var Script = require('sandcastle/lib/script').Script;
Script.prototype.createTimeout = function(methodName) {
    var _this = this;

    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(function() {
        if (_this.exited || _this.sandcastle.sandbox.killed) return;
        _this.exited = true;
        _this.sandcastle.kickOverSandCastle();
        console.log('emitting script timeout');
        _this.emit('timeout', methodName);
    }, this.timeout);

    // PATCH: listen to kill signal and clear timeout if sandbox is being killed
    this.sandcastle.sandbox.removeAllListeners('kill');
    this.sandcastle.sandbox.on('kill', function()
    {
        console.log(methodName, 'clearing timeout on kill');
        clearTimeout(_this.timeoutId);
    });
    // /PATCH
};

var SandCastle = require('sandcastle').SandCastle;

SandCastle.prototype.kill = function() {
    // PATCH: emit kill signal over sandbox
    console.log('EMITTING KILL SIGNAL');
    this.sandbox.emit('kill');
    // /PATCH

    clearInterval(this.heartbeatId);
    this.sandbox.removeAllListeners('exit');
    this.sandbox.kill('SIGHUP');
    process.removeAllListeners('exit');
};
SandCastle.prototype.createScript = function(source, opts) {
    var sourceAPI = this.sourceAPI || '';
    if (opts && opts.extraAPI) sourceAPI += ";\n" + opts.extraAPI

    var script = new Script({
        source: source,
        sourceAPI: sourceAPI,
        timeout: this.timeout,
        socket: this.socket,
        sandcastle: this
    });



    return script;
};
