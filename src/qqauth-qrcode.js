function getUserHome() {
        return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

(function() {
  var fs = require('fs');
  var os = require("os");
  var https = require("https");
  var http = require('http');
  var crypto = require('crypto');
  var querystring = require('querystring');
  var Url = require('url');
  var Path = require('path');
  var Log = require('log');
  var encryptPass = require('./encrypt');

  var all_cookies = [];

  var log = new Log('debug');

  var md5 = function(str) {
    return crypto.createHash('md5').update(str.toString()).digest('hex');
  };

    var get_cookies = function(cookies) {
        if (cookies) {
            all_cookies = cookies;
        }
        return all_cookies;
    };

    var get_cookies_string = function() {
        var str = "";
        for(var i=0; i<all_cookies.length; i++) {
            str += all_cookies[i].split(' ')[0];
        }
        return str;
    };
    
    var url_get = function(http_or_https, url_or_options, callback, pre_callback) {
        if(http_or_https === null) {
            if(typeof url_or_options === 'string') {
                http_or_https = (url_or_options.indexOf('https://') > 0) ? https : http;
            } else {
                http_or_https = http;
            }
        }

        return http_or_https.get(url_or_options, function(resp){
            if(pre_callback !== undefined) pre_callback(resp);

            if(resp.headers['set-cookie'] !== undefined)
                all_cookies = all_cookies.concat(resp.headers['set-cookie']);

            var res = resp;
            var body = '';
            resp.on('data', function(chunk) {
                return body += chunk;
            });
            return resp.on('end', function() {
                return callback(0, res, body);
            });
        }).on("error", function(e) {
            return log.error(e);
        });
    };

    var url_post = function(http_or_https, options, form, callback) {
        var postData = querystring.stringify( form );

        if(typeof options.headers !== 'object') options.headers = {};
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        options.headers['Content-Length'] = postData.length;
        options.headers['Cookie'] = all_cookies;
        options.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:27.0) Gecko/20100101 Firefox/27.0';

        var req = http_or_https.request(options, function(resp) {
            var res = resp;
            var body = '';
            resp.on('data', function(chunk) {
                return body += chunk;
            });
            return resp.on('end', function() {
                return callback(0, res, body);
            });
        }).on("error", function(e) {
            return log.error(e);
        });
        req.write(postData);
        return req.end();
    };

    var prepare_login = function(callback) {
        var url = 'https://ui.ptlogin2.qq.com/cgi-bin/login?daid=164&target=self&style=16&mibao_css=m_webqq&appid=501004106&enable_qlogin=0&no_verifyimg=1&s_url=http%3A%2F%2Fw.qq.com%2Fproxy.html&f_url=loginerroralert&strong_login=1&login_state=10&t=20131024001';

        return url_get(https, url, function(err, resp, body){
            return callback([]);
        });
    };

    var check_qq_verify = function(qq, callback) {
        var options = {
            host: 'ssl.ptlogin2.qq.com',
            path: '/ptqrlogin?webqq_type=10&remember_uin=1&login2qq=1&aid=501004106&u1=http%3A%2F%2Fw.qq.com%2Fproxy.html%3Flogin2qq%3D1%26webqq_type%3D10&ptredirect=0&ptlang=2052&daid=164&from_ui=1&pttype=1&dumy=&fp=loginerroralert&action=0-0-' + (Math.random() * 900000 + 1000000) +'&mibao_css=m_webqq&t=undefined&g=1&js_type=0&js_ver=10138&login_sig=&pt_randsalt=0',
            headers: {
                'Cookie': get_cookies_string() + 'RK=OfeLBai4FB; ptcz=ad3bf14f9da2738e09e498bfeb93dd9da7540dea2b7a71acfb97ed4d3da4e277; pgv_pvi=911366144; ETK=; ptisp=ctc; pgv_info=ssid=s2810019118; pgv_pvid=1051433466; qrsig=hJ9GvNx*oIvLjP5I5dQ19KPa3zwxNI62eALLO*g2JLbKPYsZIRsnbJIxNe74NzQQ',
                'Referer':'https://ui.ptlogin2.qq.com/cgi-bin/login?daid=164&target=self&style=16&mibao_css=m_webqq&appid=501004106&enable_qlogin=0&no_verifyimg=1&s_url=http%3A%2F%2Fw.qq.com%2Fproxy.html&f_url=loginerroralert&strong_login=1&login_state=10&t=20131024001'
            }
        };

        return url_get(https, options, function(err, resp, body){
            var ret = body.match(/\'(.*?)\'/g).map(function(i) {
                var last = i.length - 2;
                return i.substr(1, last);
            });
            return callback(ret);
        });
    };

  var get_qr_code = function(qq, host, port, callback) {
      var url = "https://ssl.ptlogin2.qq.com/ptqrshow?appid=501004106&e=0&l=M&s=5&d=72&v=4&t=" + Math.random();
      
      return url_get(https, url, function(err, resp, body){
          create_img_server(host, port, body, resp.headers);
          return callback();
      }, function(resp){
          resp.setEncoding('binary');
      });
  };

  var finish_verify_code = function() {
    return stop_img_server();
  };

  var img_server = null;

  var create_img_server = function(host, port, body, origin_headers) {
    if (img_server) {
      return;
    }

    var dir_path = Path.join(getUserHome(), ".tmp");
    if(! fs.existsSync(dir_path)) fs.mkdirSync(dir_path);

    var file_path = Path.join(getUserHome(), ".tmp", "qrcode.jpg");
    fs.writeFileSync(file_path, body, 'binary');

    if (process.platform !== 'darwin') {
        img_server = http.createServer(function(req, res) {
          res.writeHead(200, origin_headers);
          return res.end(body, 'binary');
        });
        return img_server.listen(port);
    } else {
        return;
    }
  };

  var stop_img_server = function() {
    if (img_server) {
      img_server.close();
    }
    return img_server = null;
  };

  var check_sig_get_cookies = function(url, callback) {
      return url_get(null, url, function(err, resp, body){
          if(! err)
            return callback(body);
      });
  };

  var login_token = function(client_id, psessionid, callback) {
      if(! client_id) client_id = parseInt(Math.random() * 89999999) + 10000000;
      else client_id = parseInt(client_id);

      if(! psessionid) psessionid = null;

      var ptwebqq = all_cookies.filter(function(item) {
          return item.match(/ptwebqq/);
      }).pop().replace(/ptwebqq\=(.*?);.*/, '$1');

      var form = {
          r: JSON.stringify({
              status: "online",
              ptwebqq: ptwebqq,
              clientid: "" + client_id,
              psessionid: psessionid
          })
      };

      return url_post(http, {
          host: 'd.web2.qq.com',
          path: '/channel/login2',
          method: 'POST',
          headers: {
            'Referer': 'http://d.web2.qq.com/proxy.html?v=20110331002&callback=1&id=3',
          }
      }, form, function(err, resp, body) {
          var ret = JSON.parse(body);
          return callback(ret, client_id, ptwebqq);
      });
  };

  var cli_prompt = function(title, callback) {
    process.stdin.resume();
    process.stdout.write(title);
    process.on("data", function(data) {
        callback(data);
        return process.stdin.pause();
    });
    process.stdin.on("data", function(data) {
      data = data.toString().trim();
        callback(data);
        return process.stdin.pause();
    });
    return process.stdin.on('end', function() {
      process.stdout.write('end');
      return callback();
    });
  };

    var auth_with_qrcode = function(opt, callback) {
        var auth = exports;
        var qq = opt.account;

        log.info("登录 step0.5 获取二维码");
        return get_qr_code(qq, opt.host, opt.port, function(error) {
            if (process.platform === 'darwin') {
                log.notice("请用 手机QQ 扫描该二维码");
                var file_path = Path.join(getUserHome(), ".tmp", "qrcode.jpg");
                require('child_process').exec('open ' + file_path);
            } else {
                log.notice("打开该地址->", "http://" + opt.host + ":" + opt.port);
            }

            return cli_prompt("手机QQ扫描二维码后, 回车继续: ", function(code) {
                log.info("登录 step1 等待二维码校验结果");
                return check_qq_verify(qq, function(ret) {
                    //console.log(ret);
                    if( parseInt(ret[0]) == 0 && ret[2].match(/^http/)) {
                        console.log( ret[5] + ", " + ret[4] );
                        
                        log.info("登录 step2 cookie获取");
                        return check_sig_get_cookies(ret[2], function(ret){
                            
                            log.info("登录 step3 token 获取");
                            return login_token(null, null, function(ret, client_id, ptwebqq) {
                              if (ret.retcode === 0) {
                                log.info('登录 token 获取成功');

                                var auth_options = {
                                  psessionid: ret.result.psessionid,
                                  clientid: client_id,
                                  ptwebqq: ptwebqq,
                                  uin: ret.result.uin,
                                  vfwebqq: ret.result.vfwebqq
                                };
                                return callback(all_cookies, auth_options);

                              } else {
                                log.info("登录失败");
                                return log.error(ret);
                              }
                            });
                        });
                    } else {
                        log.error("登录 step1 failed", ret);
                        return;
                    }
                });
            });
        });
    }

  /*
      全局登录函数，如果有验证码会建立一个 http-server ，同时写入 tmp/*.jpg (osx + open. 操作)
      http-server 的端口和显示地址可配置
      @param options {account,password,port,host}
      @callback( cookies , auth_options ) if login success
   */

    var login = function(options, callback) {
        var opt = options;
        var qq = opt.account, pass = opt.password;
        return prepare_login(function(result) {
            log.info('登录 step0 - 登录方式检测');
            return check_qq_verify(qq, function(ret) {
                //console.log(ret);
                var need_verify = parseInt(ret[0]), verify_code = ret[1], bits = ret[2], verifySession = ret[3];
                if (need_verify == 65 || need_verify == 66) {
                    return auth_with_qrcode(opt, callback);
                } else {
                    console.log(result);
                }
            });
        });
    };

    module.exports = {
        cookies: get_cookies,
        get_cookies_string: get_cookies_string,
        url_get: url_get,
        url_post: url_post,
        prepare_login: prepare_login,
        check_qq_verify: check_qq_verify,
        get_qr_code: get_qr_code,
        check_sig_get_cookies: check_sig_get_cookies,
        login_token: login_token,
        finish_verify_code: finish_verify_code,
        auth_with_qrcode: auth_with_qrcode,
        cli_prompt: cli_prompt,
        login: login,
    };

}).call(this);
