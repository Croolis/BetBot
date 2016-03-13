var TelegramBot = require('node-telegram-bot-api');

var token = '183411327:AAFbB_hqhew0k_U2wsHmdrIbCV8ben9DFuE';

var botOptions = {
    polling: true
};

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
        chat_id: Number
    })

    var User = mongoose.model('User', userShema);

    var betShema = mongoose.Schema({
        user1: [User],
        user2: [User],
        money: Number,
        text: String,
        winner: [User],
        luser: [User],
        condition: Number
    })

    var Bet = mongoose.model('Bet', betShema)

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
                var new_user = new User({first_name: msg.from.first_name, last_name: msg.from.last_name, id: msg.from.id, chat_id: msg.chat.id});
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

    //dfghjk
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
        bot.sendMessage(messageChatId, 'Вы принимаете условия спора?', opts);
    }
 
    if (messageText === 'Yes') {
        bot.sendMessage(messageChatId, 'I\'m too love you!', { caption: 'I\'m bot!' });
    }
 
    if (messageText === 'No') {
        bot.sendMessage(messageChatId, ':(', { caption: 'I\'m bot!' });
    }
    //fghjk

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

    User.find({id: msg.contact.user_id}, function(err, users) {
        console.log(users);
        if (users.length == 0) { 
            sendMessageByBot(messageChatId, "Я не знаю такого пользователя. Пусть он напишет мне.");
        } else {
            sendMessageByBot(users[0].chat_id, messageUsrFirstName + " " + messageUsrLastName + " хочет с вами поспорить.");
        }
    })

    console.log(msg);
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