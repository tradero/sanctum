var _      = require('lodash');
var async  = require('async');
var uuid   = require('node-uuid');

var Sanctum  = function ( poolName, options )
{
    options = _.defaults(options,
    {
        api          : __dirname + '/api.js',
        workers      : 1,
        timeout      : 5000,
        autostart    : true,
        memoryLimitMB: 20,
        useStrictMode: false
    });

    this.name    = poolName;
    this.options = options;

    if ( options.autostart === true ) this.start();
};
Sanctum.prototype.async = async;
Sanctum.prototype.start = function ( )
{
    this.uuid = uuid.v4();
    console.log('starting', this.uuid);

    // SandCastle Setup
    //
    var options = this.options;

    var Pool = require('sandcastle').Pool;
    var poolOfSandcastles = new Pool( { numberOfInstances: options.workers }, options );

    poolOfSandcastles.sandcastles.map(function(sc)
    {
        sc.castle.sandbox.stdout.on('data', function(data)
        {
            if ( options.onData )
                options.onData(data.toString().trim());

            if ( options.onStdout )
                options.onStdout(data.toString().trim());
        });

        sc.castle.sandbox.stderr.on('data', function(data)
        {
            if ( options.onData)
                options.onData(data.toString().trim());

            if ( options.onStderr )
                options.onStderr(data.toString().trim());
        });

        sc.castle.sandbox.on('exit', function(code)
        {
            console.log('sandbox quit with code', code);
        });
    });

    this.pool = poolOfSandcastles;

    // @TODO: More suitable queue setup
    // - no queue yet

    this.$result = { _: { pool: this.name, uuid: this.uuid } };
};
Sanctum.prototype.stop = function(cb)
{
    console.log('stopping', this.uuid);
    //this.pool.sandcastles.map(function(sc)
    //{
        //sc.castle.sandbox.kill('SIGHUP');
        //sc.castle.kill();
        //sc.castle.kickOverSandCastle();
    //});

    // it would be nice to have callback triggered after pool.kill
    this.pool.kill();

    process.nextTick(cb);
};

// Reset $result variable
Sanctum.prototype.flush  = function( )
{
    this.$result = { _: { pool: this.name, uuid: this.uuid } };
};

// Fire scripts asynchronously
Sanctum.prototype.script = function( items, row, step, callback )
{
    this._script(async.each, items, row, step, callback);
};

// Fire scripts synchronously
Sanctum.prototype.scriptSeries = function( items, row, step, callback )
{
    this._script(async.eachSeries, items, row, step, callback);
};

// Handle different types of passed params
// ie.
// var vmm = sanctumInstance;
// vmm.script('scriptName', 'exit(true)', function(err, output) {});
//
// ..todo ;-)
Sanctum.prototype._script = function( each, items, row, step, callback )
{
    var _this = this;

    // solo script
    if (_.isString(items) && _.isString(step) && _.isFunction(callback))
    {
        return _this.__script(items, step, row, callback);
    }
    else
    // array of scripts with callback - without step function
    if (_.isArray(items) && _.isFunction(step) && _.isUndefined(callback))
    {
        var start = Date.now();
        each(items, function(item, cb)
        {
            _this.__script(item, row, cb);

        }, function(err)
        {
            //_this.$result._row_time = Date.now()-start;
            step(err, _this.$result, Date.now()-start);
        });
    }
    else
    // array of scripts with step function and callback
    if (_.isArray(items) && _.isFunction(step) && _.isFunction(callback))
    {
        var start = Date.now();
        each(items, function(item, cb)
        {
            _this.__script(item, row, function(err, res)
            {
                step(err, res); cb();
            });

        }, function(err)
        {
            //_this.$result._row_time = ;
            callback(err, _this.$result, Date.now()-start);
        });
    }
};

Sanctum.prototype.__script = function( item, row, callback )
{
    if (!this.pool) return; // remove it later - since __script is executed internally by Sanctum.script it should not run without pool

    var _this  = this;
    var script = this.pool.createScript("\
      exports.main = function() {\
      $result._time = Date.now();\
      " + item.code + "\
      }\
    ");

    script.on('error', function(err)
    {
        if ( _this.options.onError ) _this.options.onError(err);
    });
    script.on('exit', function(err, output)
    {
        if ( ! output) err = 'Aborted!'; // remove or modify after solving Sandcastle restart

        if ( _this.options.onExit ) _this.options.onExit(err, output);

        if ( output )
        {
            _this.$result = output;
            _this.$result._.time   = (Date.now() - _this.$result._time);
            _this.$result._.row    = row;
            _this.$result._.script = item;
            _this.$result._.pool = _this.name;
            _this.$result._.uuid = _this.uuid;
        }

        callback(err, output);
    });
    script.on('timeout', function(err, output)
    {
        if ( _this.options.onExit )
            _this.options.onExit(err, output);

        if ( _this.options.onTimeout ) _this.options.onTimeout();

        callback(err, output);
    });

    script.run({$result: _this.$result, $row: row});

    return script;
};

module.exports = Sanctum;
