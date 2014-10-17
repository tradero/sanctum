exports.api = {
    process: process,
    console: {
        log: console.log
    },
    setInterval: function(callback, timeout) {
        setInterval(callback, timeout);
    },
    setTimeout: function(callback, timeout) {
        setTimeout(callback, timeout);
    }
}
