var Hades = require('../index');
var vmm   = new Hades('vms-scripts',
{
    workers      : 4,
    timeout      : 1000,
    memoryLimitMB: 20,
    useStrictMode: false,
    //queue : {
    //    concurrency: 2
    //}
    //onData: function(data)
    //{
        //console.log('^', data);
    //},
    onStdout: function(data)
    {
        console.log('-', data);
    },
    onStderr: function(data)
    {
        console.log('*', data);
    },
    onExit: function(err, data)
    {
        //console.log('E', data);
    },
    onTimeout: function(data)
    {
        console.log('T', data);
    }
});

var async = require('async');

async.each([1,2,3,4], function(y, cb)
{
    async.eachSeries(['a','b'], function(item, callback)
    {
        var key = 'myKey-' + y + '-' + item;
        vmm.script(key, 'if (!$result.foo) $result.foo=0; $result.foo=$result.foo+1; setTimeout(function(){ exit($result); },500);', function (err, res)
        {
            if (err) return console.log('ERROR', err);

            console.log(item, 'i am done:', res._.key, res.foo);
            callback();
        });
    },
    function(err)
    {
        //console.log('ROW',y,'DONE');
        cb();
    });
}, function(err)
{
    console.log('');
    console.log('');
    console.log('');

    vmm.flush(); // clear results buffer

    var scripts = [
        { id: 1, name: 'first script' , code: 'if (!$result.foo) $result.foo=0; $result.foo=$result.foo+1; setTimeout(function(){ exit($result); },500);' },
        { id: 2, name: 'second script', code: 'if (!$result.foo) $result.foo=0; $result.foo=$result.foo+1; setTimeout(function(){ exit($result); },500);' }
    ];

    async.each([1,2,3,4], function(y, cb)
    {
        vmm.scriptSeries(scripts, function (err, res)
        {
            console.log(item, 'i am done:', res._.key, res.foo);
        }, function(err)
        {
            if (err) return console.log('ERROR', err);

            console.log('DONE - with step callback');
            cb();
        });
    }, function(err)
    {
        console.log('');
        console.log('');
        console.log('');

        vmm.flush(); // clear results buffer

        async.each([1,2,3,4], function(y, cb)
        {
            vmm.scriptSeries(scripts, function (err, res)
            {
                if (err) return console.log('ERROR', err);

                console.log('DONE - without step callback', res);
                cb();
            });
        }, function(err)
        {
            console.log('DONE');
        });
    });
});

// vmm.start(); // required only when queue == true || Object to fire up queued tasks
