var Log = require('log');
var log = new Log('debug');
var schedule = require('node-schedule');
var qq = require('../qq');
var chat = function(groupname, msg, from, content) {
  var isAtme = content[1] === '@微蚁小莉';
  log.debug(isAtme);

  if (groupname === '球球大作战') {
    log.debug(msg);
    log.debug(from);
    if (isAtme) {
      switch(msg) {
        case ' 你是谁':
          qq.send(['group', groupname, `@${from.nick} 我是微蚁小莉，你们的篮球宝贝`]);
          break;
        case ' 你能做什么':
          qq.send(['group', groupname, `@${from.nick} 我会在每天17:55提醒大家去打球，更多功能敬请期待`]);
          break;
        default:
          qq.send(['group', groupname, `@${from.nick} 很抱歉，我还不懂你说什么，更多功能敬请期待`]);
          break;
      }
    }
  }
};

schedule.scheduleJob({
  hour: 17,
  minute: 55,
}, function() {
  qq.send(['group', '球球大作战', `当前时间：${new Date().toString()}`]);
  qq.send(['group', '球球大作战', '@全体成员 打球啦！走起～']);
});

module.exports = chat;
