const { Telegraf, Markup } = require('telegraf')
require('dotenv').config()
const engQuestions = require('./engQuestions.json')
const plQuestions = require('./plQuestions.json')
const espQuestions = require('./espQuestions.json')
 
const bot = new Telegraf(process.env.BOT_TOKEN)

let i, score, file
const langToQuestionsMap = {
    eng: engQuestions,
    pl: plQuestions,
    esp: espQuestions
}

function upgradeScore(question, chosenOption) {
    if (question.answer === chosenOption) score++
}

function showResult(ctx, score) {
    let message = `Твій результат: ${score}\n`
    const keyboard = [
        [Markup.button.callback('Почати спочатку', 'start')],
        [Markup.button.url(`Зв'язатися з нами`, 'www.instagram.com/futuristschool/')],
    ]
    if (score >= 0 && score < 5)
        message += 'Ти лише на початку шляху, але рухаєшся у правильному напрямку 💪🏼 Твій орієнтовний рівень мови А1. Запрошуємо на пробний урок, аби оцінити його більш детально, враховуючи говоріння та слухання :)'
    if (score >= 5 && score < 15)
        message += 'Молодець, це чудовий результат 💪🏼 Твій орієнтовний рівень мови А2. Запрошуємо на пробний урок, аби оцінити його більш детально, враховуючи говоріння та слухання :)'
    if (score >= 15 && score < 20)
        message += 'Ти справжній молодець 💪🏼 Твій орієнтовний рівень мови В1. Запрошуємо на пробний урок, аби оцінити його більш детально, враховуючи говоріння та слухання :)'
    if (score >= 20 && score < 27)
        message += 'Оце результат! 💪🏼 Твій орієнтовний рівень мови В2. Запрошуємо на пробний урок, аби оцінити його більш детально, враховуючи говоріння та слухання :)'
    if (score >= 27)
        message += 'Ого, ти вже майже як носій мови 💪🏼 Твій орієнтовний рівень - С1. Запрошуємо на пробний урок, аби оцінити його більш детально, враховуючи говоріння та слухання :)'

    ctx.reply(message, Markup.inlineKeyboard(keyboard).resize())
    
    const username = ctx.update.callback_query.from.username
    bot.telegram.sendMessage(process.env.RESPONSE_CHAT_ID, `Test was passed by @${username} with result ${score}`)
}

async function showQuestion(ctx, file) {
    const keyboard = []
    for (const property in file.questions[i]) {
        if (property !== 'question' && property !== 'answer')
            keyboard.push([Markup.button.callback(file.questions[i][property], property)])
    }

    if (i !== 0) await ctx.deleteMessage()
    ctx.reply(file.questions[i].question, Markup.inlineKeyboard(keyboard).resize())
}

async function start(ctx) {
    const langKeyboard = [
        [Markup.button.callback('Англійська', 'eng')],
        [Markup.button.callback('Польська', 'pl')],
        [Markup.button.callback('Іспанська', 'esp')]
    ]

    i = 0
    ctx.reply(`\nВітаємо в мовній онлайн-школі Futurist School 👩‍💻 Цей бот створений для того, аби визначити твій рівень мови.\nОрієнтовна тривалість тесту: 10-15 хвилин.\nБудь ласка, обери мову, яка тебе цікавить 🤍\n
    `, Markup.inlineKeyboard(langKeyboard).resize());
}

bot.start(async (ctx) => await start(ctx))
bot.action('start', async(ctx) => await start(ctx))

bot.action(['eng', 'pl', 'esp'], async (ctx) => {
    score = 0
    file = langToQuestionsMap[ctx.update.callback_query.data]
    await showQuestion(ctx, file)
})

bot.action(['o1', 'o2', 'o3', 'o4', 'o5'], async (ctx) => {
    upgradeScore(engQuestions.questions[i], ctx.update.callback_query.data)
    i++

    if (i === engQuestions.questions.length) showResult(ctx, score)
    else {
        await showQuestion(ctx, file)
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))