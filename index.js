require("dotenv").config();

const express = require("express");
const {
    Client,
    GatewayIntentBits,
    ChannelType,
} = require("discord.js");

// =============================
// WEB SERVER CHO RENDER
// =============================

const app = express();

app.get("/", (req, res) => {
    res.send("🤖 Discord Bot đang hoạt động!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌐 Web server đang chạy tại port ${PORT}`);
});

// =============================
// DISCORD BOT
// =============================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const CREATE_ROOM_ID = process.env.CREATE_ROOM_ID;
const CATEGORY_ID = process.env.CATEGORY_ID;


// =============================
// BOT READY
// =============================

client.once("clientReady", () => {
    console.log(`🤖 Bot online: ${client.user.tag}`);
});


// =============================
// VOICE ROOM SYSTEM
// =============================

client.on("voiceStateUpdate", async (oldState, newState) => {

    try {

        // =============================
        // TẠO ROOM
        // =============================

        if (
            newState.channelId === CREATE_ROOM_ID &&
            oldState.channelId !== CREATE_ROOM_ID
        ) {

            const member = newState.member;
            const guild = newState.guild;

            console.log(`🔄 Đang tạo phòng cho ${member.user.tag}`);

            const room = await guild.channels.create({
                name: `📢 Room of ${member.user.username}`,
                type: ChannelType.GuildVoice,
                parent: CATEGORY_ID,
                userLimit: 0
            });

            await member.voice.setChannel(room);

            console.log(`✅ Đã tạo phòng: ${room.name}`);
        }


        // =============================
        // XÓA ROOM KHI TRỐNG
        // =============================

        const oldChannel = oldState.channel;

        if (
            oldChannel &&
            oldChannel.parentId === CATEGORY_ID &&
            oldChannel.id !== CREATE_ROOM_ID &&
            oldChannel.members.size === 0
        ) {

            await oldChannel.delete();

            console.log(`🗑️ Đã xóa phòng: ${oldChannel.name}`);
        }

    } catch (error) {

        console.error(
            "❌ Lỗi Voice System:",
            error
        );

    }

});


// =============================
// LOGIN BOT
// =============================

client.login(process.env.TOKEN);