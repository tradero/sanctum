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
        console.log('E', data);
    },
    onTimeout: function(data)
    {
        console.log('T', data);
    },

    workers      : 1,
    timeout      : 4000
});

var rows = [
    { _id: 1 },
    { _id: 2 },
    { _id: 3 },
    { _id: 4 }
];

var scripts = [
    { id: 1, name: 'first script' , code: '$result.foo=$result.foo+1; setTimeout(function(){ exit($result); },2000);' },
    { id: 2, name: 'second script', code: '$result.foo=$result.foo+1; setTimeout(function(){ exit($result); },2000);' }
];

var start = Date.now();

vmm.async.each(rows, function(row, next)
{
    vmm.flush();
    vmm.script(scripts, row, function (err, res)
    {
        console.log(process.pid, 'processed script', err, res);
        //console.log('row', res._.row._id, 'processed by script', res._.script.id, 'in', res._.time, 'ms');

    }, function(err, a, b)
    {
        if (err) return console.log(process.pid, 'ERROR', err);

        console.log(process.pid, 'DONE SCRIPTS', a._, b);
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
        console.log(process.pid + ' VMM stopped\n\n\n\n\n\n');
        //console.log('starting again in 3s');
        //setTimeout(function()
        //{
        //    vmm.start();

        //}, 3000);
    });

}, 500);
