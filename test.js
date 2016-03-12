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
 
bot.on('text', function(msg)
{
    var messageChatId = msg.chat.id;
    var messageText = msg.text;
    var messageDate = msg.date;
    var messageUsr = msg.from.first_name;
    var messageUsrid = msg.from.id;

    var number;
    
    if (messageText === 'ping') {
        sendMessageByBot(messageChatId, 'pong');
    }

    if (messageText === '/start') {
    sendMessageByBot(messageChatId, 'Привет, ' + messageUsr + '! Меня зовут Bet bot, и я помогаю людям решать их денежные споры. Так же мы можем поиграть в игру ping-pong. Напиши мне ping.');
        var MyUserStruct = new Object();
        MyUserStruct.id = msg.from.id;
        MyUserStruct.chat_id = msg.chat.id;
        MyUserStruct.first_name = msg.from.first_name;
        MyUserStruct.second_name =  msg.from.second_name;
        GlobalStackUsers.push(MyUserStruct);
    }

    if ((messageText == "Хочу поспорить") || (messageText == "xочу поспорить.") || (messageText == "хочу поспорить") || (messageText == "Хочу поспорить.")) {
        sendMessageByBot(messageChatId, "Поделитесь со мной контактом того, с кем хотите поспорить.");
    }

    console.log(msg);
});

bot.on('contact', function(msg)
{
    var messageUsrid = msg.from.id;
    var messageUsrFirstName = msg.from.first_name;
    var messageUsrLastName = msg.from.last_name;
    var messageUsrId = msg.from.id;
    var messageChatId = msg.chat.id;
    var rivalId = msg.contact.user_id;
    sendMessageByBot(messageChatId, "It's his id: " + msg.contact.user_id);

//поиск по базе данных
    var stackSize = GlobalStackUsers.length;
    var fl = 0;
    for (var i = 0; i < stackSize; ++i) {
        if (GlobalStackUsers[i].id === rivalId) {
            sendMessageByBot(GlobalStackUsers[i].chat_id, messageUsrFirstName + " " + messageUsrLastName + " хочет с вами поспорить.");
            fl = 1;
        }
    }

    if (fl = 0){
        sendMessageByBot(messageChatId, "I don't know this guy.");
    }

    console.log(msg);
}); 

 
function sendMessageByBot(aChatId, aMessage)
{
    bot.sendMessage(aChatId, aMessage, { caption: 'I\'m a cute bot!' });
}