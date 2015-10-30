#!/usr/bin/env node

'use strict';

var cli_usage = "Syntax:\n" + 
    "qq list [buddy | group | discuss]\n" +
    "qq send [buddy | group | discuss] <msg>\n" +
    "qq quit\n" +
    "";

var fs = require('fs'),
    os = require('os'),
	path = require('path'),
    request = require('request');

var config = require('./config');

var qq_cli = {
    listBuddy: function() {
        request("http://localhost:" + config.api_port + "/listbuddy", function(err,resp,body){
            var ret = JSON.parse(body);
            var info = ret.info;
            for(var k=0; k<info.length; k++) {
                console.log("    " + (k+1) + ', ' + info[k].nick + ' ( ' + info[k].uin + ' )');
            }
            console.log();
        })
    },
    
    listGroup: function() {
        request("http://localhost:" + config.api_port + "/listgroup", function(err,resp,body){
            var ret = JSON.parse(body);
            var info = ret.gnamelist;
            for(var k=0; k<info.length; k++) {
                console.log("    " + (k+1) + ', ' + info[k].name + ' ( ' + info[k].gid + ' )');
            }
            console.log();
        })
    },
    
    listDiscuss: function() {
        request("http://localhost:" + config.api_port + "/listdiscuss", function(err,resp,body){
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
        request.post({
            url: "http://localhost:" + config.api_port + "/send", 
            form: {
                type: args[0],
                to: args[1],
                msg: args[2]
            }
        }, function(err,resp,body){
            var ret = JSON.parse(body);
            console.log( ret.result.result + "\n" );
        })
    },
    
    quit: function( args ) {
        request("http://localhost:" + config.api_port + "/quit", function(err,resp,body){
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
