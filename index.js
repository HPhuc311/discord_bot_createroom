const {
    Client,
    GatewayIntentBits,
    ChannelType
} = require("discord.js");

require("dotenv").config();


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});


const CREATE_ROOM_ID = process.env.CREATE_ROOM_ID;
const CATEGORY_ID = process.env.CATEGORY_ID;


client.once("ready", () => {
    console.log(`🤖 Bot online: ${client.user.tag}`);
});


client.on("voiceStateUpdate", async (oldState, newState) => {

    try {
        // người dùng vào kênh tạo phòng 
        if (
            newState.channelId === CREATE_ROOM_ID &&
            oldState.channelId !== CREATE_ROOM_ID
        ) {

            const member = newState.member;
            const guild = newState.guild;

            // Tạo phòng mới
            const room = await guild.channels.create({
                name: `📢 Room of ${member.user.username}`,
                type: ChannelType.GuildVoice,
                parent: CATEGORY_ID,

                // Giới hạn mặc định
                userLimit: 0,

                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: ["ViewChannel", "Connect"]
                    }
                ]
            });

            // Chuyển member vào phòng vừa tạo
            await member.voice.setChannel(room);

            console.log(
                `✅ Đã tạo phòng cho ${member.user.tag}`
            );
        }

        // xoá phòng khi không có ai trong phòng

        const oldChannel = oldState.channel;

        if (
            oldChannel &&
            oldChannel.parentId === CATEGORY_ID &&
            oldChannel.id !== CREATE_ROOM_ID &&
            oldChannel.members.size === 0
        ) {

            await oldChannel.delete();

            console.log(
                `🗑️ Đã xóa phòng: ${oldChannel.name}`
            );
        }

    } catch (error) {

        console.error("❌ Lỗi Voice System:", error);

    }

});


// =============================
// ĐĂNG NHẬP BOT
// =============================

client.login(process.env.TOKEN);