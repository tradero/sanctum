var mqueue = require('multi-queue');
var queue = mqueue();
queue.create('scripts', { concurrency: 3 });
queue.stop('scripts');
for ( var x = 0; x < 10; ++ x )
{
    queue.push('scripts', function(done)
    {
        console.log('...');
        done();

    }, { unique: 'key' + x }); // NOTE: it throws "TypeError: Cannot read property 'name' of undefined" without options object
}
setTimeout(function()
{
    console.log('queue start');
    queue.start('scripts');
}, 5000);
