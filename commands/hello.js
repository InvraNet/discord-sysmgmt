module.exports = {
    data: {
        name: 'hello',
        description: 'Replies with Hello!',
    },
    async execute(message, args) {
        await message.reply('Hello there!');
    },
};
