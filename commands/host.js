const si = require('systeminformation');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'host',
        description: 'Provides detailed system information including CPU, GPU, RAM, and OS.',
    },
    async execute(message) {
        try {
            const cpuInfo = await si.cpu();
            const memoryInfo = await si.mem();
            const memoryLayouts = await si.memLayout();
            const gpuInfo = await si.graphics();
            const osInfo = await si.osInfo();

            let osName;
            switch (true) {
                case osInfo.release.startsWith('14.5'):
                    osName = 'Sonoma';
                    break;
                case osInfo.release.startsWith('13'):
                    osName = 'Ventura';
                    break;
                case osInfo.release.startsWith('12'):
                    osName = 'Monterey';
                    break;
                case osInfo.release.startsWith('11'):
                    osName = 'Big Sur';
                    break;
                case osInfo.release.startsWith('10.15'):
                    osName = 'Catalina';
                    break;
                default:
                    osName = osInfo.distro || 'Unknown';
                    break;
            }

            const osEmbed = new EmbedBuilder()
                .setTitle('OS Information')
                .setDescription(`\`\`OS: ${osInfo.platform}\`\`\n \`\`Release: ${osName} (${osInfo.release})\`\`\n\`\`UEFI Support: ${osInfo.uefi}\`\`\n\`\`OS Arch: ${osInfo.arch}\`\`\n\`\`Build: ${osInfo.build}\`\``)
                .setColor('#00ff00');

            const cpuEmbed = new EmbedBuilder()
                .setTitle('CPU Information')
                .setDescription(`\`\`Model: ${cpuInfo.brand}\`\`\n\`\`Cores: ${cpuInfo.cores}\`\`\n\`\`Speed: ${cpuInfo.speed} GHz\`\``)
                .setColor('#ff0000');

            const totalRAM = memoryInfo.total / (1024 ** 3);
            const availableRAM = memoryInfo.available / (1024 ** 3);
            const freeRAM = memoryInfo.free / (1024 ** 3);
            const usedRAM = totalRAM - availableRAM;
            const ramEmbed = new EmbedBuilder()
                .setTitle('RAM Information')
                .setDescription(`\`\`Total RAM: ${totalRAM.toFixed(2)} GB\`\`\n\`\`Used RAM: ${usedRAM.toFixed(2)} GB\`\`\n\`\`Available RAM: ${availableRAM.toFixed(2)} GB\`\``)
                .setColor('#0000ff');

            const ramDetails = memoryLayouts.map((layout, index) =>
                new EmbedBuilder()
                    .setTitle(`RAM Detail (Bank ${index})`)
                    .setDescription(`\`\`Bank Label: ${layout.label}\`\`\n\`\`Size: ${(layout.size / (1024 ** 2)).toFixed(2)} MB\`\`\n\`\`Clock Speed: ${layout.clockSpeed} MHz\`\``)
                    .setColor('#0000ff')
            );

            const gpuEmbeds = gpuInfo.controllers.map((gpu, index) =>
                new EmbedBuilder()
                    .setTitle(`GPU Information (GPU ${index})`)
                    .setDescription(`\`\`Model: ${gpu.model}\`\`\n\`\`Memory: ${gpu.memoryTotal / (1024 ** 2)} MB\`\``)
                    .setColor('#ff00ff')
            );

            // Create an array of all embeds
            const embeds = [osEmbed, cpuEmbed, ramEmbed, ...ramDetails, ...gpuEmbeds];

            // Create pagination buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('◀️')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('▶️')
                        .setStyle(ButtonStyle.Primary)
                );

            let currentPage = 0;

            const embedMessage = await message.channel.send({ embeds: [embeds[currentPage]], components: [row] });

            const filter = interaction => {
                return ['prev', 'next'].includes(interaction.customId) && interaction.user.id === message.author.id;
            };

            const collector = embedMessage.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'next') {
                    currentPage = (currentPage + 1) % embeds.length;
                } else if (interaction.customId === 'prev') {
                    currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                }

                await interaction.update({ embeds: [embeds[currentPage]], components: [row] });
            });

        } catch (error) {
            console.error('Error sending host information message:', error);
            await message.channel.send('There was an error while retrieving system information.');
        }
    },
};