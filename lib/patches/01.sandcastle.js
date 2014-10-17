
var Script = require('sandcastle/lib/script').Script;
Script.prototype.createTimeout = function(methodName) {
    var _this = this;

    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(function() {
        if (_this.exited || _this.sandcastle.sandbox.killed) return;
        _this.exited = true;
        _this.sandcastle.kickOverSandCastle();
        _this.emit('timeout', methodName);
    }, this.timeout);
};
