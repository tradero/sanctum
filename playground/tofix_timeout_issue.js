var Sanctum = require('../index');
var vmm     = new Sanctum('vms-scripts',
{
    onStdout: function(data)
    {
        console.log('-', data);
    },
    onStderr: function(data)
    {
        console.log('*', data);
    },
    onError: function(err, data)
    {
        console.log('E', err, data);
    },
    onExit: function(err, data)
    {
        //console.log('E', data);
    },
    onTimeout: function(data)
    {
        //console.log('T', data);
    },

    workers      : 1,
    timeout      : 2000
});

var fixtures = require('../fixtures');
var start = Date.now();

vmm.async.each(fixtures.rows, function(row, next)
{
    vmm.flush();
    vmm.scriptSeries(fixtures.scripts, row, function (err, res)
    {
        console.log(process.pid, 'processed script', err, res);
        //console.log('row', res._.row._id, 'processed by script', res._.script.id, 'in', res._.time, 'ms');

    }, function(err, a, b)
    {
        if (err) return console.log(process.pid, 'ERROR', err);

        //console.log(process.pid, 'DONE SCRIPTS', a._, b);
        next();
    });

}, function(err)
{
    console.log(process.pid, 'DONE PROCESSING in', (Date.now()-start), 'ms');
});

setTimeout(function()
{
    vmm.stop(function()
    {
        console.log(process.pid + ' VMM stopped');
    });

}, 500);
