const config = require("./config.json");

// Command setup

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');

const commands = [{
    name: 'ping',
    description: 'Replies with Pong!'
}, {
    name: 'create',
    description: 'WIP creates a primary voice channel'
}, {
    name: 'private',
    description: 'WIP makes your voice channel private'
}, {
    name: 'public',
    description: 'WIP makes your voice channel public'
}, {
    name: 'limit',
    description: 'WIP limit the amount of users in your channel'
}, {
    name: 'unlimit',
    description: 'WIP removes limit'
},
new SlashCommandBuilder()
    .setName("rename")
    .setDescription("WIP rename voice channel (requires you to be the owner)")
    .addStringOption(option => option
        .setName("name")
        .setDescription("new channel name")
        .setRequired(true)
    )
];

const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(config.client_id, config.guild_id),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();


// Bot

const Discord = require('discord.js');
const fs = require("fs");
const VCManager = require('./VCManager.js');

let manager = new VCManager();

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_VOICE_STATES", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"] });

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }

    switch (interaction.commandName) {
        case 'ping': await interaction.reply('Pong!')
            break;
        case 'create':
            if (interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_CHANNELS)) {
                manager.createPrimaryVoice(interaction.guild)
                interaction.reply(`channel created`)
            } else {
                await interaction.reply("You don't have the required permissions to create a primary voice channel")
            }
            break;
        case 'rename':
            if(interaction.user.id == "175304617108832256"){
                interaction.guild.members.cache.get(interaction.user.id).voice.channel.setName(interaction.options.data.find(d => d.name == "name").value,`user ${interaction.user.tag} renamed the channel`)
                    .then()
                    .catch(e=> console.log(e))
                await interaction.reply("done")
            } else {
                await interaction.reply("you aren't the owner of this channel")
            }
            break
        default: await interaction.reply("This command isn't available yet");
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    manager.update(client)
})

client.login(config.token);