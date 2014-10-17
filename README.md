sanctum
=======

workers manager - basically sandcastle wrapper at this moment

```javascript
var key = 'myKey-' + y + '-' + item;
vmm.script(key, 'if (!$result.foo) $result.foo=0; $result.foo=$result.foo+1; setTimeout(function(){ exit($result); },500);', function (err, res)
{
    if (err) return console.log('ERROR', err);

    console.log(item, 'i am done:', res._.key, res.foo);
    callback();
});

vmm.flush(); // clear results buffer

var scripts = [
    { id: 1, name: 'first script' , code: 'if (!$result.foo) $result.foo=0; $result.foo=$result.foo+1; setTimeout(function(){ exit($result); },500);' },
    { id: 2, name: 'second script', code: 'if (!$result.foo) $result.foo=0; $result.foo=$result.foo+1; setTimeout(function(){ exit($result); },500);' }
];
```


```javascript
vmm.script(scripts, function (err, res)
{
    console.log(item, 'i am done:', res._.key, res.foo);
}, function(err)
{
    if (err) return console.log('ERROR', err);

    console.log('DONE - with step callback');
    cb();
});
```


```javascript
vmm.scriptSeries(scripts, function (err, res)
{
    console.log(item, 'i am done:', res._.key, res.foo);
}, function(err)
{
    if (err) return console.log('ERROR', err);

    console.log('DONE - with step callback');
    cb();
});
```

TODO
====
* Queue with adapters interface
