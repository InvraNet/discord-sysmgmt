module.exports = {
    data: {
        name: 'bye',
        description: 'Replies with Goodbye!',
        example: `${process.env.PREFIX}bye`,
        support: null,
    },
    async execute(message, args) {
        await message.reply('Goodbye!');
    },
};
