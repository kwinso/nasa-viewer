import dotenv from "dotenv";

dotenv.config();

import axios from "axios";
import { Telegraf, Markup } from "telegraf";
import { api, roversLandingDates } from "./config";
import { dynamic } from "./messages";

let lastApod: { date: Date; image: any } | undefined;

const bot = new Telegraf(process.env.TG_TOKEN as string);

const toMenuButton = Markup.button.callback("Меню 📜", "menu");
const greetMarkup = Markup.inlineKeyboard([
    [Markup.button.callback("Роверы ⚙️", "rovers"), Markup.button.callback("APOD 🌌", "apod")],
]);

// Erros catching
bot.use((ctx, next) => {
    next().catch(async (e) => {
        const dev = await bot.telegram.getChatMember("738640343", 738640343);

        console.log(e);
        ctx.reply(
            `Упс! Произошла ошибка, попробуйте еще раз позже. ⚡\nНе забывайте писать разработчику @${dev.user.username}, чтобы сообщить об ошибке.`,
            Markup.inlineKeyboard([toMenuButton])
        );
    });
});



bot.start((ctx) => ctx.replyWithHTML(dynamic.greeting(ctx.from?.first_name as string), greetMarkup));
bot.action("menu", async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch {}
    ctx.replyWithHTML(dynamic.greeting(ctx.from?.first_name as string), greetMarkup);
    ctx.answerCbQuery();
});

bot.action("rovers", async (ctx) => {
    ctx.editMessageText(
        "В этом боте предоставлено 3 ровера, фото с которых вы можете посмотреть здесь.\nПожалуйста, выберите один с помощью кнопок ниже",
        Markup.inlineKeyboard([
            [
                Markup.button.callback("Perseverance 🔥", "perseverance"),
                Markup.button.callback("Curiosity 🦝", "curiosity"),
            ],
            [
                Markup.button.callback("Opportunity ☄️", "opportunity"),
                Markup.button.callback("Spirit 🎃", "spirit"),
            ],
            [toMenuButton],
        ])
    );
});

bot.action(["curiosity", "opportunity", "spirit", "perseverance"], async (ctx) => {
    // @ts-ignore
    const rover = ctx.callbackQuery.data;

    await ctx.answerCbQuery();

    let data;

    // Decreases amount of fetched data and increases loading speed
    // @ts-ignore
    let solsOnPlanet = Math.floor((new Date() - roversLandingDates[rover]) / (1000 * 3600 * 24));

    while (true) {

        const randomSol = Math.ceil(Math.random() * solsOnPlanet);
        const randomPage = Math.ceil(Math.random() * 5);

        const requestString = `${api}/mars-photos/api/v1/rovers/${rover}/photos?sol=${randomSol}&page=${randomPage}&api_key=${process.env.NASA_KEY}`;
        const response = await axios.get(requestString);
        if (response.data.photos.length) {
            data = response.data;
            break;
        }
    }

    const { sol, camera, img_src: image, earth_date: date } = data.photos[
        Math.floor(Math.random() * data.photos.length)
    ];

    const photoCaption = `${rover[0].toUpperCase()}${rover.slice(1)}: ${camera.full_name} (${
        camera.name
    }). Сол: ${sol}. Дата на Земле: ${date.split("-").reverse().join(".")}`;

    await ctx.editMessageText("Поиск фото... 🔍");

    await ctx.replyWithPhoto(image, {
        caption: photoCaption,
    });
    setTimeout(() => {
        ctx.reply(
            "Хотите посмотреть еще фото?",
            Markup.inlineKeyboard([toMenuButton, Markup.button.callback("Еще ➕", rover)])
        );
    }, 500);
});

bot.action("apod", async (ctx) => {
    await ctx.answerCbQuery();

    if (!lastApod || new Date().setHours(0, 0, 0, 0) !== lastApod.date.setHours(0, 0, 0, 0)) {
        const { data } = await axios.get(`${api}/planetary/apod?api_key=${process.env.NASA_KEY}`);
        lastApod = {
            date: new Date(),
            image: data,
        };
    }

    try {
        try {
            await ctx.deleteMessage();
        } catch {}
        await ctx.replyWithPhoto(lastApod.image.hdurl, { caption: lastApod.image.title });
    } catch {
        await ctx.reply("Не удалось отправить HD фото. Отправка версии с худшим качеством ❌");
        await ctx.replyWithPhoto(lastApod.image.url, { caption: lastApod.image.title });
    }

    ctx.replyWithHTML(
        "<b>APOD</b> - Астрономическое фото дня.\nЭто фото обновляется раз в день.",
        Markup.inlineKeyboard([toMenuButton])
    );
});

const port = parseInt(process.env.PORT ?? "3000");

bot.launch({
    webhook: {
        domain: process.env.DOMAIN,
        port,
    }
}).then(() => console.log(`Nasa-Viewer started. (Webhook port: ${port})`));