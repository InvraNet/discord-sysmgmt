module.exports = {
    data: {
        name: 'bye',
        description: 'Replies with Goodbye!',
    },
    async execute(message, args) {
        await message.reply('Goodbye!');
    },
};
