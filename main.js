const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
    } else {
        console.error(`The command at ${filePath} is missing a 'data' or 'execute' property.`);
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Bot is connected to the Discord gateway.');
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commandName === 'help') {
        if (!client.commands.has(commandName)) {
            return message.reply('This command does not exist.');
        }

        const command = client.commands.get(commandName);
        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            await message.reply('There was an error while executing this command!');
        }
    } else {
        if (!client.commands.has(commandName)) return;

        const command = client.commands.get(commandName);

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            await message.reply('There was an error while executing this command!');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
