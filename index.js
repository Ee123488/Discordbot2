require('dotenv').config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const VOICE_CHANNEL_ID = "1449026324474892439";
const TARGET_TEXT_CHANNEL_ID = "1372185933008338976";
const IMAGE_URL = "https://i.postimg.cc/RZXgDCW4/Picsart-25-03-01-22-50-48-442.jpg";
const TRIGGER_WORD = "خط";
const OWNER_USER_ID = "1323702047375097898";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error.message);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error.message);
});

client.on('error', error => {
    console.error('Discord client error:', error.message);
});

client.once("ready", async () => {
    console.log(`${client.user.tag} جاهز! البوت يعمل الآن.`);
    client.user.setActivity("خدمتك", { type: 0 });
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const content = message.content.trim();

    if (content.includes(TRIGGER_WORD)) {
        try {
            await message.delete();
            const response = await axios.get(IMAGE_URL, { responseType: "arraybuffer" });
            const buffer = Buffer.from(response.data, "binary");
            await message.channel.send({
                files: [{ attachment: buffer, name: "khatt_image.jpg" }],
            });
        } catch (error) {
            console.error("خطأ في الرد التلقائي/الحذف:", error.message);
        }
    }

    if (content.startsWith("!p ")) {
        if (message.author.id !== OWNER_USER_ID) {
            await message.delete().catch(() => {});
            const msg = await message.channel.send(
                `❌ ${message.author.toString()}, هذا الأمر مخصص لمالك البوت فقط.`
            );
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            return;
        }

        const textToForward = content.substring(3).trim();
        const targetChannel = client.channels.cache.get(TARGET_TEXT_CHANNEL_ID);

        if (targetChannel && targetChannel.type === 0) {
            try {
                await targetChannel.send(textToForward);
                await message.delete();
                await message.author.send(
                    `✅ تم إرسال رسالتك بنجاح! \n\n *محتوى الرسالة:*\n\`${textToForward}\``
                ).catch(() => console.log("تعذر إرسال رسالة خاصة (الخاص مغلق)."));
            } catch (error) {
                console.error("خطأ في تنفيذ أمر !p:", error.message);
                await message.channel.send("❌ حدث خطأ أثناء تنفيذ الأمر. تأكد من صلاحيات البوت.");
            }
        } else {
            message.channel.send("❌ لم يتم العثور على الروم المستهدف.");
        }
    }
});

const BOT_TOKEN = process.env.BOT_TOKEN;

if (BOT_TOKEN) {
    client.login(BOT_TOKEN);
} else {
    console.error("❌ خطأ: لم يتم العثور على متغير BOT_TOKEN في Secrets. يرجى إضافته.");
}
