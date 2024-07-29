const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, Events } = require('discord.js');
const cooldowns = new Map();
const commandsPerPage = 4;

module.exports = {
    data: {
        name: 'help',
        description: 'List of all available commands.',
        example: `${process.env.PREFIX}help`,
        support: null,
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

        const totalCommands = commands.size;
        const totalPages = Math.ceil(totalCommands / commandsPerPage);
        let page = parseInt(args[0], 10) || 1;
        page = Math.max(1, Math.min(page, totalPages));

        const embed = new EmbedBuilder()
            .setTitle('**List of all available commands:**')
            .setColor('#0099ff');

        const commandArray = Array.from(commands.values());
        const start = (page - 1) * commandsPerPage;
        const end = Math.min(start + commandsPerPage, totalCommands);

        for (let i = start; i < end; i++) {
            const command = commandArray[i];
            embed.addFields({
                name: `**${command.data.name}**`,
                value: `Description: ${command.data.description}\nExample: \`\`\`js\n${command.data.example}\`\`\``,
            });
        }

        embed.setFooter({ text: `Page ${page} of ${totalPages}` });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 1),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages)
            );

        const messageSent = await message.channel.send({ embeds: [embed], components: [row] });

        const filter = i => i.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'prev') {
                page--;
            } else if (i.customId === 'next') {
                page++;
            }

            const newEmbed = new EmbedBuilder()
                .setTitle('**List of all available commands:**')
                .setColor('#0099ff');

            const start = (page - 1) * commandsPerPage;
            const end = Math.min(start + commandsPerPage, totalCommands);

            for (let i = start; i < end; i++) {
                const command = commandArray[i];
                if (command.data.support === null) {
                    newEmbed.addFields({
                        name: `**${command.data.name}**`,
                        value: `Description: ${command.data.description}\nExample: \`\`\`js\n${command.data.example}\`\`\``,
                    });
                } else {
                    newEmbed.addFields({
                        name: `**${command.data.name}**`,
                        value: `Description: ${command.data.description}\nExample: \`\`\`js\n${command.data.example}\`\`\`\nSupport: ${command.data.support}`,
                    });
                }
            }

            newEmbed.setFooter({ text: `Page ${page} of ${totalPages}` });

            const newRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 1),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages)
                );

            await i.update({ embeds: [newEmbed], components: [newRow] });
        });

        collector.on('end', collected => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                );

            messageSent.edit({ components: [disabledRow] });
        });
    },
};