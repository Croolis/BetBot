var TelegramBot = require('node-telegram-bot-api');
var token = '183411327:AAFbB_hqhew0k_U2wsHmdrIbCV8ben9DFuE';
var yandexMoney = require("yandex-money-sdk");
var opener = require("opener");
var url = require("url")
var http = require("http")
var request = require("request")
var botOptions = {
    polling: true
};


var clientId = "698B5D63B99F7CD72F0405F045640D408288421914B43D838B3359C70A81228A"
var secret = null
var redirectUri = "http://localhost:8030/"



function getToken(code){
  function tokenComplete(err, data) {
    console.log(err)
      if(err) {
          // process error
          console.log("EGOG")
      }
      //var access_token = data.access_token;
      console.log(data);
  }
  console.log("client id = "+ clientId);
  console.log("code = "+ code);
  console.log("secret = "+ secret);
  yandexMoney.Wallet.getAccessToken(clientId, code, redirectUri, secret, tokenComplete);

}

function authorise(clientId, redirectURI, scope, chatId){
    var url = yandexMoney.Wallet.buildObtainTokenUrl(clientId, redirectURI, scope);
    console.log(url)
    opener(url);
}

http.createServer(function(req, res) {
    var parsedUrl = url.parse(req.url, true); // true to get query as object
    var queryAsObject = parsedUrl.query;

    console.log(JSON.stringify(queryAsObject));

    var code = queryAsObject["code"];
    console.log("code = "+code)
    
    
    //getToken(code);
    function tokenComplete(err, data) {
    console.log(err)
      if(err) {
          // process error
          console.log("EGOG")
      }
      //var access_token = data.access_token;
      var access_token = JSON.parse(data.body).access_token;
  }
  var url1 = "https://money.yandex.ru/oauth/token/?code="+code+"&client_id="+clientId+"&grant_type=authorization_code&redirect_uri="+ redirectUri
  request.get(url1, tokenComplete);
  console.log("client id = "+ clientId);
  console.log("code = "+ code);
  console.log("secret = "+ secret);
  // yandexMoney.Wallet.getAccessToken(clientId, code, redirectUri, secret, tokenComplete);
}).listen(8030);

var GlobalStackUsers = new Array();

var bot = new TelegramBot(token, botOptions);

bot.getMe().then(function(me)
{
    console.log('Hello! My name is %s!', me.first_name);
    console.log('My id is %s.', me.id);
    console.log('And my username is @%s.', me.username);

});

// Работа с mongo.db
    var mongoose = require('mongoose');

    var userShema = mongoose.Schema({
        first_name: String,
        last_name: String,
        id: Number,
        chat_id: Number,
        cur_bet_state: Number,
        cur_bet_money: Number,
        cur_bet_op: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        cur_bet_text: String
    });
    var User = mongoose.model('User', userShema);

    var betShema = mongoose.Schema({
        user1: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        user2: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        money: Number,
        text: String,
        winner: Number,
        condition: Number
    });
    var Bet = mongoose.model('Bet', betShema);

    mongoose.connect('mongodb://localhost/test');
    //mongoose.connect('mongodb://1:1@ds031842.mongolab.com:31842/xoxo');
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

// Конец работы с mongo.db


bot.on('text', function(msg)
{
    var messageChatId = msg.chat.id;
    var messageText = msg.text;
    var messageDate = msg.date;
    var messageUsr = msg.from.first_name;
    var messageUsrId = msg.from.id;

    var number;
    
    if (messageText === 'ping') {
        sendMessageByBot(messageChatId, 'pong');
    }

    if (messageText === '/start') {

        User.find({id: messageUsrId}, function(err, users) {
            if (err) return console.error(err);
            if (users.length == 0) {
                var new_user = new User({first_name: msg.from.first_name, last_name: msg.from.last_name, id: msg.from.id, chat_id: msg.chat.id, cur_bet_state: 0});
                new_user.save(function(err, new_account) {
                    if (err) return console.error(err);
                });
            }
        });

        sendMessageByBot(messageChatId, 'Привет, ' + messageUsr + '! Меня зовут Bet bot, и я помогаю людям решать их денежные споры. Так же мы можем поиграть в игру ping-pong. Напиши мне ping.');
    }

    if ((messageText == "Хочу поспорить") || (messageText == "xочу поспорить.") || (messageText == "хочу поспорить") || (messageText == "Хочу поспорить.")) {
        sendMessageByBot(messageChatId, "Поделитесь со мной контактом того, с кем хотите поспорить.");
    }

    if (messageText == "auth") {
        authorise(clientId, redirectUri, ["account-info"], NaN);
    }

    if (messageText.match(/^\d+$/)) {
        sendMessageByBot(messageChatId, "Вы будете спорить на " + messageText + " рублей. Потерпите, осталось совсем немного.");
        User.findOne({id: messageChatId}, function(err, user) {
            user.cur_bet_state = user.cur_bet_state + 2;
            user.cur_bet_money = Number(messageText);
            console.log(user.cur_bet_money);
            user.save();
            User.findOne({ 'chat_id': messageChatId}).exec(dos);
        });
        return;

    }

    if ((messageText.split()[0] == "нет") || (messageText.split()[0] == "комментарий")) {
        var arr = messageText.split();
        var str = arr.slice(1, arr.length).join();
        console.log(str);
        User.findOne({id: messageChatId}, function(err, user) {
            user.cur_bet_state = user.cur_bet_state + 4;
            user.cur_bet_text = str;
            console.log(user.cur_bet_text);
            user.save();
            User.findOne({ 'chat_id': messageChatId}).exec(dos);
        });
        return;
    }

    function dos(err, user) {
        console.log(user);
        console.log(user.cur_bet_state);
        if (Math.floor(user.cur_bet_state) % 2 == 0) {
            sendMessageByBot(messageChatId, "Поделитесь со мной контактом того, с кем хотите поспорить.");
        }
        if (Math.floor(user.cur_bet_state / 2) % 2 == 0) {
            sendMessageByBot(messageChatId, "На какую сумму в рублях Вы хотите поспорить? Достаточно указать просто число.");
        }
        if (Math.floor(user.cur_bet_state / 4) % 2 == 0) {
            sendMessageByBot(messageChatId, "Не хотите указать каких-либо комментариев, чтобы не забыть, о чем был спор? Если да, то укажите их после слова 'комментарий'. Если нет, то так и скажите.");
        }
        if (user.cur_bet_state > 6) {
            sendMessageByBot(messageChatId, "WE DID IT");
        }
    }
    User.findOne({ 'chat_id': messageChatId}).exec(function(err, user) {
        user.cur_bet_state = 0;
        user.save();
    });
    User.findOne({ 'chat_id': messageChatId}).exec(dos);

    console.log(msg);
});

bot.on('contact', function(msg)
{
    var messageUsrFirstName = msg.from.first_name;
    var messageUsrLastName = msg.from.last_name;
    var messageUsrId = msg.from.id;
    var messageChatId = msg.chat.id;
    var rivalId = msg.contact.user_id;
//    sendMessageByBot(messageChatId, "It's his id: " + msg.contact.user_id);

//поиск по базе данных

    function dos(err, user) {
        console.log(user);
        console.log(user.cur_bet_state);
        if (Math.floor(user.cur_bet_state) % 2 == 0) {
            sendMessageByBot(messageChatId, "Поделитесь со мной контактом того, с кем хотите поспорить.");
        }
        if (Math.floor(user.cur_bet_state / 2) % 2 == 0) {
            sendMessageByBot(messageChatId, "На какую сумму в рублях Вы хотите поспорить? Достаточно указать просто число.");
        }
        if (Math.floor(user.cur_bet_state / 4) % 2 == 0) {
            sendMessageByBot(messageChatId, "Не хотите указать каких-либо комментариев, чтобы не забыть, о чем был спор? Если да, то укажите их после слова 'комментарий'. Если нет, то так и скажите.");
        }
        if (user.cur_bet_state > 6) {
            sendMessageByBot(messageChatId, "WE DID IT");
        }
    }

    User.find({id: msg.contact.user_id}, function(err, users) {
        console.log(users);
        if (users.length == 0) { 
            sendMessageByBot(messageChatId, "Я не знаю такого пользователя. Пусть он напишет мне.");
        } else {
            sendMessageByBot(users[0].chat_id, messageUsrFirstName + " " + messageUsrLastName + " хочет с вами поспорить.");
            sendMessageByBot(messageChatId, "Отлично, Вы добавили контакт, осталось еще чуть-чуть");
            User.findOne({id: messageChatId}, function(err, user) {
                user.cur_bet_state = user.cur_bet_state + 1;
                user.cur_bet_op = users[0]._id;
                user.save();
                User.findOne({ 'chat_id': messageChatId}).exec(dos);
            });
        }
    })

    console.log(msg);
}); 

 
function sendMessageByBot(aChatId, aMessage)
{
    bot.sendMessage(aChatId, aMessage, { caption: 'I\'m a cute bot!' });
}