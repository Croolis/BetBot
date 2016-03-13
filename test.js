var TelegramBot = require('node-telegram-bot-api');
var token = '183411327:AAFbB_hqhew0k_U2wsHmdrIbCV8ben9DFuE';
var yandexMoney = require("yandex-money-sdk");
var opener = require("opener");
var url = require("url")
var http = require("http")
var request = require("request")


var messageChatId = null;
var messageText = null;
var messageDate = null;
var messageUsr = null;
var messageUsrId = null;
var messageUsrLastName = null;


var botOptions = {
    polling: true
};

var clientId = "698B5D63B99F7CD72F0405F045640D408288421914B43D838B3359C70A81228A"
var secret = null
var redirectUri = "http://localhost:8030/"

function authorise(clientId, redirectURI, scope, chatId){
    var url = yandexMoney.Wallet.buildObtainTokenUrl(clientId, redirectURI, scope);
    console.log(url)
    sendMessageByBot(messageChatId, url)
}

function createNewUser(access_token){
    if (access_token == null)
        return;
    console.log("access_token = "+ access_token)
    User.find({id: messageUsrId}, function(err, users){
        if(err){
            return console.error(err)
        }
        if(users.count == 0){
            var new_user = new User({first_name: messageUsr, last_name: messageUsrLastName, id: messageUsrId, chat_id: messageChatId, access_token: access_token});
            new_user.save(function(err, new_account){
                if (err){
                    return console.error(err)
                }else{
                    console.log("new user created succesfully")
                }
            })
        }else{
            for (var user in users){
                user.access_token = access_token
                user.save(function(err, new_account){
                    if (err) console.error(err)
                })
            }
        } 
    })

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
      createNewUser(access_token);

  }

  var url1 = "https://money.yandex.ru/oauth/token/?code="+code+"&client_id="+clientId+"&grant_type=authorization_code&redirect_uri="+ redirectUri
  request.get(url1, tokenComplete)

  console.log("client id = "+ clientId);
  console.log("code = "+ code);
  console.log("secret = "+ secret);
  // yandexMoney.Wallet.getAccessToken(clientId, code, redirectUri, secret, tokenComplete);
}).listen(8000);


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
        access_token: String,
        create_bet: Number,
        cur_bet_state: Number,
        cur_bet_money: Number,
        _cur_bet_op: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        cur_bet_text: String
    });
    var User = mongoose.model('User', userShema);

    var betShema = mongoose.Schema({
        user1: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        user2: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        user1_acc: Number,
        user2_acc: Number,
        money: Number,
        text: String,
        winner: Number,
        condition: Number
    });
    var Bet = mongoose.model('Bet', betShema);
    mongoose.connect('mongodb://localhost/test');
    //mongoose.connect('mongodb://1:1@ds031842.mongolab.com:31842/xoxo');
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
//Bet.remove(function (err, product) {});
// Конец работы с mongo.db

bot.on('text', function(msg)
{
    var messageChatId = msg.chat.id;
    var messageText = msg.text;
    var messageDate = msg.date;
    var messageUsr = msg.from.first_name;
    var messageUsrId = msg.from.id;
    
    User.find({id: messageUsrId}, function(err, users) {
        if (err) return console.error(err);
            for (var user in users){
                if (user.access_token = null){
                    sendMessageByBot(messageChatId, "You seem unauthorised");
                    authorise(clientId, redirectUri, ["account-info"], NaN);
                }
            }
        });

    if (messageText === 'ping') {
        sendMessageByBot(messageChatId, 'pong');
    }

    if (messageText === '/start') {
        
        User.find({id: messageUsrId}, function(err, users) {
            if (err) return console.error(err);
            if (users.length == 0) {
                authorise(clientId, redirectUri, ["account-info"], messageChatId);
            }
        });

        sendMessageByBot(messageChatId, 'Привет, ' + messageUsr + '! Меня зовут Bet bot, и я помогаю людям решать их денежные споры. Так же мы можем поиграть в игру ping-pong. Напиши мне ping.');
    }

    User.findOne({id: messageUsrId}).exec(function(err, user) {
        if (user == null) {
            var new_user = new User({first_name: msg.from.first_name, last_name: msg.from.last_name, 
                    id: msg.from.id, chat_id: msg.chat.id, cur_bet_state: 0, create_bet: 0});
            new_user.save();
            return;
        }
        if (user.create_bet != 0) {
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

            User.findOne({ 'chat_id': messageChatId}).exec(dos);
        } else {
            if (messageText.match(/спор/gi)) {
                User.findOne({ 'chat_id': messageChatId}).exec(function(err, user){
                    user.create_bet = 1;
                    user.save();
                });
                User.findOne({ 'chat_id': user.chat_id}).exec(dos);
            }

            if (messageText === 'Yes') {
                User.findOne({id: messageUsrId}).exec(function(err, user) {
                    Bet.findOne({user1: user._id}).exec(function(err, bet) {
                        console.log("Try")
                        if (bet == null)
                            return;
                        console.log("Still try");
                        bet.user1_acc = 1;
                        bet.save();
                        if ((bet.user1_acc == 1) && (bet.user2_acc == 1)) {
                            console.log("grand profit");
                            User.findOne({_id: bet.user1}).exec(function(err, user) {
                                bot.sendMessage(user.chat_id, 'Поздравляю, сделка была принята!');
                            });
                            User.findOne({_id: bet.user2}).exec(function(err, user) {
                                bot.sendMessage(user.chat_id, 'Поздравляю, сделка была принята!');
                            });
                        }
                    });
                    Bet.findOne({user2: user._id}).exec(function(err, bet) {
                        if (bet == null)
                            return;
                        bet.user2_acc = 1;
                        bet.save();
                        if ((bet.user1_acc == 1) && (bet.user2_acc == 1)) {
                            User.findOne({_id: bet.user1}).exec(function(err, user) {
                                bot.sendMessage(user.chat_id, 'Поздравляю, сделка была принята!');
                            });
                            User.findOne({_id: bet.user2}).exec(function(err, user) {
                                bot.sendMessage(user.chat_id, 'Поздравляю, сделка была принята!');
                            });
                        }
                    });
                });
            }
         
            if (messageText === 'No') {
                bot.sendMessage(messageChatId, ':(', { caption: 'I\'m bot!' });
            }

            if (messageText == "auth") {
                authorise(clientId, redirectUri, ["account-info"], NaN);
            }

            if (messageText === '/keys') {
                var opts = {
                    reply_to_message_id: msg.message_id,
                    reply_markup: JSON.stringify({
                        keyboard: [
                            ['Я согласен на спор.'],
                            ['Я отказываюсь участвовать в споре.'],
                            ['Хочу изменить ставку.'],
                            ['Хочу изменить суть спора.']
                        ],
                        one_time_keyboard: true
                    })
                };
            }
            
            User.findOne({id: messageUsrId}).exec(function(err, user) {
                Bet.findOne({user1: user._id, user1_acc: 0}).exec(function(err, bet) {

                });
            });
            return;            
        }
    });
});    

function dos(err, user) {
    console.log(user);
    console.log(user.cur_bet_state);
    if (Math.floor(user.cur_bet_state) % 2 == 0) {
        sendMessageByBot(user.chat_id, "Поделитесь со мной контактом того, с кем хотите поспорить.");
        return;
    }
    if (Math.floor(user.cur_bet_state / 2) % 2 == 0) {
        sendMessageByBot(user.chat_id, "На какую сумму в рублях Вы хотите поспорить? Достаточно указать просто число.");
        return;
    }
    if (Math.floor(user.cur_bet_state / 4) % 2 == 0) {
        sendMessageByBot(user.chat_id, "Не хотите указать каких-либо комментариев, чтобы не забыть, о чем был спор? Если да, то укажите их после слова 'комментарий'. Если нет, то так и скажите.");
        return;
    }
    if (user.cur_bet_state > 6) {
        user.create_bet = 0;
        user.cur_bet_state = 0;
        user.save();
        var new_bet = new Bet({user1: user._id, user2: user._cur_bet_op, money: user.cur_bet_money,
            text: user.cur_bet_text, condition: -1});
        new_bet.save();
        Bet.findOne({ user1: user._id, user2: user._cur_bet_op }).exec(function(err, bet) {
            User.findOne({_id: bet.user1}).exec(function(err, user) {
                sendMessageByBot(user.chat_id, "мы тут мутим спор на " + bet.money + " рублей. Ты в деле?");
            });
            User.findOne({_id: bet.user2}).exec(function(err, user) {
                sendMessageByBot(user.chat_id, "мы тут мутим спор на " + bet.money + " рублей. Ты в деле?");
            });
        });
    }
}

bot.on('contact', function(msg)
{
    var messageUsrFirstName = msg.from.first_name;
    var messageUsrLastName = msg.from.last_name;
    var messageUsrId = msg.from.id;
    var messageChatId = msg.chat.id;
    var rivalId = msg.contact.user_id;
//    sendMessageByBot(messageChatId, "It's his id: " + msg.contact.user_id);

//поиск по базе данных

    User.find({id: msg.contact.user_id}, function(err, users) {
        console.log(users);
        if (users.length == 0) { 
            sendMessageByBot(messageChatId, "Я не знаю такого пользователя. Пусть он напишет мне.");
        } else {
            sendMessageByBot(users[0].chat_id, messageUsrFirstName + " " + messageUsrLastName + " хочет с вами поспорить.");
            sendMessageByBot(messageChatId, "Отлично, Вы добавили контакт, осталось еще чуть-чуть");
            User.findOne({id: messageChatId}, function(err, user) {
                user.cur_bet_state = user.cur_bet_state + 1;
                user._cur_bet_op = users[0]._id;
                user.save();
                User.findOne({ 'chat_id': user.chat_id}).exec(dos);
            });
        }
    })

    //console.log(msg);
}); 

var stickersList = [
    'BQADAgADIQADyIsGAAG5wgjAzH3ayQI',
    'BQADAgAD0g8AAkKvaQABg2sLLDKRiooC',
    'BQADAgADyg8AAkKvaQAB4OnE1MPuMzwC'
];

bot.on('sticker', function(msg)
{
    var messageChatId = msg.chat.id;
    var messageStickerId = msg.sticker.file_id;
    var messageDate = msg.date;
    var messageUsr = msg.from.username;
 
    sendStickerByBot(messageChatId, stickersList[getRandomInt(0, stickersList.length)]);
 
    console.log(msg);
});
 
 var aMin
function getRandomInt(aMin, aMax)
{
    return Math.floor(Math.random() * (aMax - aMin)) + aMin;
}
 
function sendStickerByBot(aChatId, aStickerId)
{
    bot.sendSticker(aChatId, aStickerId, { caption: 'I\'m a cute bot!' });
}

 
function sendMessageByBot(aChatId, aMessage)
{
    bot.sendMessage(aChatId, aMessage, { caption: 'I\'m a cute bot!' });
}