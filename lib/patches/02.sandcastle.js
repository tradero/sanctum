var Script = require('sandcastle/lib/script').Script;
var SandCastle = require('sandcastle').SandCastle;

SandCastle.prototype.kill = function() {
    // PATCH: emit kill signal over sandbox
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

    // PATCH: listen to kill signal and clear timeout if sandbox is being killed
    this.sandbox.on('kill', function()
    {
        clearTimeout(script.timeoutId);
    });
    // /PATCH

    return script;
};
