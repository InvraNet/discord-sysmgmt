module.exports = {
    data: {
        name: 'hello',
        description: 'Replies with Hello!',
        example: `${process.env.PREFIX}hello`,
        support: null,
    },
    async execute(message, args) {
        await message.reply('Hello there!');
    },
};
