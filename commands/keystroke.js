const { keyboard } = require('@nut-tree-fork/nut-js');

module.exports = {
    data: {
        name: 'keystroke',
        description: 'Simulates keyboard keystrokes.',
        example: `${process.env.PREFIX}keystroke I love coding in js (by the way that is a good lie)`,
        support: "Linux (x11 ONLY!), Windows, macOS",
        options: [
            {
                type: 'STRING',
                name: 'input',
                description: 'The keystrokes to simulate.',
                required: true,
            },
        ],
    },
    async execute(message, args) {
        const input = args.join(' ').trim();
        const delay = 10;

        async function typeWithDelay(text, delay) {
            let index = 0;

            async function typeNext() {
                if (index < text.length) {
                    let char = text[index];
                    try {
                        await typeChar(char);
                        index++;
                        setTimeout(typeNext, delay);
                    } catch (error) {
                        console.error(`Error during keystroke simulation: ${error.message}`);
                        message.reply('There was an error simulating the keystroke!');
                    }
                }
            }

            typeNext();
        }

        async function typeChar(char) {
            keyboard.type(char);
        }        

        try {
            await typeWithDelay(input, delay);
            message.reply(`Started simulating keystrokes: ${input}`);
        } catch (error) {
            console.error(`Error in keystroke simulation: ${error.message}`);
            message.reply('There was an error simulating the keystrokes!');
        }
    },
};