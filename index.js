const TelegramBot = require("node-telegram-bot-api");
const Motion = require("./Motion");
const Messages = require("./Messages");

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

let currentMotion = null;
let messages = new Messages();
let interval = null;

bot.onText(/\/test/, msg => response(msg, test));
bot.onText(/\/motion (.+)/, (msg, match) => {
  bot.getChatMembersCount(msg.chat.id).then(amount => {
    response(msg, motion, match, amount - 1);
  });
});
bot.onText(/\/current/, msg => response(msg, current));
bot.onText(/\/yay/, msg => {
  response(msg, vote, "yay");
  if (currentMotion && currentMotion.hasEveryoneVoted()) {
    response(msg, close);
  }
});
bot.onText(/\/nay/, msg => {
  response(msg, vote, "nay");
  if (currentMotion && currentMotion.hasEveryoneVoted()) {
    response(msg, close);
  }
});
bot.onText(/\/close/, msg => response(msg, close));
bot.onText(/\/cleanup/, msg => cleanup(msg));
bot.onText(/\/(.+)isgay/, (msg, match) => {
  interval = setInterval(() => response(msg, annoying, match), 2000);
});
bot.onText(/\/stopthespam/, () => clearInterval(interval));

function response(msg, middleware, ...restArgs) {
  const chatId = msg.chat.id;

  resp = middleware(msg, ...restArgs);

  bot
    .sendMessage(chatId, resp)
    .then(msg => messages.addMessage(msg.message_id));
}

function test(msg) {
  return `I am working correctly, ${msg.from.first_name}.`;
}

function motion(msg, match, totalMembers) {
  let resp = "";

  if (currentMotion instanceof Motion) {
    resp = "A motion has already been opened. Please /close it first.";
  } else {
    currentMotion = new Motion(match[1], msg.from.first_name, totalMembers);
    resp =
      "A new motion has been created by " + currentMotion.getOwner() + ".\n";
    resp +=
      "Please respond with a /yay if you agree or a /nay if you disagree.\n\n";
    resp += "The motion is:\n" + currentMotion.getDescription();
  }

  return resp;
}

function current() {
  let resp = "";
  if (currentMotion instanceof Motion) {
    resp = "The current motion is:\n" + currentMotion.getDescription();
  } else {
    resp =
      "No motion has been set. Please create one by using /motion <description>";
  }

  return resp;
}

function vote(msg, type) {
  let resp = "";
  if (currentMotion.canVote(msg.from.username)) {
    resp = currentMotion.addVote(type, msg.from.username);
  } else {
    resp = "You have already voted.";
  }

  return resp;
}

function close() {
  const date = new Date(Date.now());
  const result =
    currentMotion.countYays() > currentMotion.countNays()
      ? "Agreed to"
      : "Defeated";

  let resp =
    "The motion has been closed.\n\n" +
    "Date: " +
    date.toDateString() +
    "\n" +
    "Motion by: " +
    currentMotion.getOwner() +
    "\n" +
    "Summary of motion: " +
    currentMotion.getDescription() +
    "\n" +
    "Results: " +
    result +
    " " +
    currentMotion.countYays() +
    " to " +
    currentMotion.countNays();

  currentMotion = null;

  return resp;
}

function cleanup(msg) {
  const chatId = msg.chat.id;

  messages.getMessageIds().forEach(id => {
    bot.deleteMessage(chatId, id);
  });

  messages.clearMessages();
}

function annoying(msg, match) {
  if (match[1] === "thijs" || match[1] === "Thijs") {
    return match[1] + " is such an amazing guy!";
  }

  return match[1] + " is so gay";
}
