var schedule = require('node-schedule');
var qq = require('../qq');
var chat = function(groupname, message) {
  if (groupname === '机器人大作战') {
    switch(message) {
      case 'hi':
        qq.send(['group', groupname, 'helloworld']);
        break;
    }
  }
};

schedule.scheduleJob({
  hour: 16,
  minute: 9,
}, function() {
  qq.send(['group', '机器人大作战', `当前时间：${new Date().toString()}`]);
});

module.exports = chat;
