const cooldowns = new Map();

module.exports = {
    data: {
        name: 'help',
        description: 'List of all available commands.',
    },
    async execute(message, args) {
        const { client } = message;
        const commands = client.commands;
        
        const now = Date.now();
        const cooldownAmount = 60 * 1000;

        if (cooldowns.has(message.author.id)) {
            const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;
            
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.channel.send(`Please wait ${timeLeft.toFixed(1)} more second(s) before using the help command again.`);
            }
        }

        cooldowns.set(message.author.id, now);

        let helpMessage = '**List of all available commands:**\n';

        commands.forEach(command => {
            helpMessage += `**${command.data.name}**: ${command.data.description}\n`;
        });

        try {
            await message.channel.send(helpMessage);
        } catch (error) {
            console.error('Error sending help message:', error);
            await message.channel.send('There was an error while sending the help message.');
        }
    },
};