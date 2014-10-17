module.exports.rows = [
    { _id: 1 },
    { _id: 2 },
    { _id: 3 },
    { _id: 4 }
];

module.exports.scripts = [
    { id: 1, name: 'first script' , code: '$result.foo=$result.foo+1; setTimeout(function(){ exit($result); },5000);' },
    { id: 2, name: 'second script', code: '$result.foo=$result.foo+1; setTimeout(function(){ exit($result); },1000);' }
];
