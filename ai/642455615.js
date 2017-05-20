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

module.exports = chat;
