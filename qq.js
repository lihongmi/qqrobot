#!/usr/bin/env node

'use strict';

var cli_usage = "Syntax:\n" + 
    "qq list [buddy | group | discuss]\n" +
    "qq send [buddy | group | discuss] <msg>\n" +
    "qq quit\n" +
    "";

var http = require('http'),
    querystring = require('querystring');

var config = require('./config');

var qq_cli = {
    api_get: function(path, callback) {
        var url = "http://localhost:" + config.api_port + path;
        return http.get(url, function(resp) {
            var res = resp;
            var body = '';
            resp.on('data', function(chunk) {
                return body += chunk;
            });
            return resp.on('end', function() {
                return callback(null, res, body);
            });
        }).on("error", function(e) {
            return callback(e, null, null);
        });
    },

    api_post: function(path, form, callback) {
        var postData = querystring.stringify(form);
        var options = {
            hostname: 'localhost',
            port: config.api_port,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                'Content-Length': postData.length
            }
        };
        var req = http.request(options, function(resp) {
            var res = resp;
            var body = '';
            resp.on('data', function(chunk) {
                return body += chunk;
            });
            return resp.on('end', function() {
                return callback(null, res, body);
            });
        }).on("error", function(e) {
            return callback(e, null, null);
        });
        req.write(postData);
        return req.end();
    },

    listBuddy: function() {
        return this.api_get("/listbuddy", function(err,resp,body){
            if(! body) return console.log('qqbot not started.\n');
            var i = 0;
            JSON.parse(body).info.forEach(function(inf){
              console.log("  " + (++i) + ', ' + inf.nick + ' ( ' + inf.account + ' )');
            });
            console.log();
        })
    },

    listGroup: function() {
        return this.api_get("/listgroup", function(err,resp,body){
            if(! body) return console.log('qqbot not started.\n');
            var i = 0;
            JSON.parse(body).gnamelist.forEach(function(inf){
              console.log("  " + (++i) + ', ' + inf.name + ' ( ' + inf.account + ' )');
            });
            console.log();
        })
    },

    listDiscuss: function() {
        return this.api_get("/listdiscuss", function(err,resp,body){
            if(! body) return console.log('qqbot not started.\n');
            console.log(err, body);
            var ret = JSON.parse(body);
            var info = ret.dnamelist;
            console.log();
        })
    },

    list: function( args ) {
        if(args.length != 1) return console.log(cli_usage);
        switch(args[0]) {
            case 'buddy':
                this.listBuddy();
                break;
            case 'group':
                this.listGroup();
                break;
            case 'discuss':
                this.listDiscuss();
                break;
            default:
                console.log("Unknown args: " + args[0]);
                break;
        }
    },

    send: function( args ) {
        if(args.length != 3) return console.log(cli_usage);
        return this.api_post("/send", {
            type: args[0],
            to: args[1],
            msg: args[2]
        }, function(err,resp,body){
            if(! body) return console.log('qqbot not started.\n');
            var ret = JSON.parse(body);
            console.log( ret.result.result + "\n" );
        });
    },

    quit: function( args ) {
        return this.api_get("/quit", function(err,resp,body){
            if(! body) return console.log('qqbot not started.\n');
            var ret = JSON.parse(body);
            console.log( ret.msg + "\n" );
        })
    },

    main: function( argv ) {
        var cli = argv[1];
        var args = argv.slice(2);
        
        if(args.length == 0) return console.log(cli_usage);
        
        switch(args[0]) {
            case 'list':
                this.list( args.slice(1) );
                break;
            case 'send':
                this.send( args.slice(1) );
                break;
            case 'quit':
                this.quit( args.slice(1) );
                break;
            default:
                console.log("Unknown args: " + args[0]);
                break;
        }
    }
};

qq_cli.main( process.argv );
