const { exec } = require('child_process');
const os = require('os');

module.exports = {
    data: {
        name: 'keystroke',
        description: 'Simulates keystrokes with a delay using wtype for Wayland and xdotool for X11.',
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
        const delay = 1;
        const platform = os.platform();

        if (platform !== 'linux') {
            message.reply('This command only works on Linux.');
            return;
        }

        const isWayland = process.env.WAYLAND_DISPLAY !== undefined;
        const isX11 = process.env.DISPLAY !== undefined;

        if (!isWayland && !isX11) {
            message.reply('Neither Wayland nor X11 display server detected.');
            return;
        }

        function typeWithDelay(text, delay) {
            let index = 0;

            function typeNext() {
                if (index < text.length) {
                    let char = text[index];
                    let typingPromises = [];

                    if (isWayland) {
                        typingPromises.push(typeWithWtype(char));
                    }

                    if (isX11) {
                        typingPromises.push(typeWithXdotool(char));
                    }

                    Promise.all(typingPromises)
                        .then(() => {
                            index++;
                            setTimeout(typeNext, delay);
                        })
                        .catch((error) => {
                            console.error(`Error during keystroke simulation: ${error.message}`);
                            message.reply('There was an error simulating the keystroke!');
                        });
                }
            }

            typeNext();
        }

        function typeWithWtype(char) {
            return new Promise((resolve, reject) => {
                let escapedChar = char.replace(/"/g, '\\"');
                let command = `wtype "${escapedChar}"`;

                exec(command, (error) => {
                    if (error) {
                        reject(new Error(`wtype error: ${error.message}`));
                    } else {
                        resolve();
                    }
                });
            });
        }

        function typeWithXdotool(char) {
            return new Promise((resolve, reject) => {
                let command;
                switch (char) {
                    case ' ':
                        command = 'xdotool key space';
                        break;
                    case '\n':
                        command = 'xdotool key Return';
                        break;
                    case '.':
                        command = 'xdotool key period';
                        break;
                    case ',':
                        command = 'xdotool key comma';
                        break;
                    case ':':
                        command = 'xdotool key colon';
                        break;
                    case ';':
                        command = 'xdotool key semicolon';
                        break;
                    case '?':
                        command = 'xdotool key Shift+slash';
                        break;
                    case '!':
                        command = 'xdotool key Shift+exclam';
                        break;
                    case '@':
                        command = 'xdotool key Shift+at';
                        break;
                    case '#':
                        command = 'xdotool key Shift+3';
                        break;
                    case '$':
                        command = 'xdotool key Shift+dollar';
                        break;
                    case '%':
                        command = 'xdotool key Shift+percent';
                        break;
                    case '^':
                        command = 'xdotool key Shift+asciicircum';
                        break;
                    case '&':
                        command = 'xdotool key Shift+ampersand';
                        break;
                    case '*':
                        command = 'xdotool key Shift+asterisk';
                        break;
                    case '(':
                        command = 'xdotool key Shift+parenleft';
                        break;
                    case ')':
                        command = 'xdotool key Shift+parenright';
                        break;
                    case '-':
                        command = 'xdotool key minus';
                        break;
                    case '_':
                        command = 'xdotool key Shift+minus';
                        break;
                    case '=':
                        command = 'xdotool key equal';
                        break;
                    case '+':
                        command = 'xdotool key Shift+equal';
                        break;
                    case '[':
                        command = 'xdotool key bracketleft';
                        break;
                    case ']':
                        command = 'xdotool key bracketright';
                        break;
                    case '{':
                        command = 'xdotool key Shift+bracketleft';
                        break;
                    case '}':
                        command = 'xdotool key Shift+bracketright';
                        break;
                    case '\\':
                        command = 'xdotool key backslash';
                        break;
                    case '|':
                        command = 'xdotool key Shift+backslash';
                        break;
                    case '\'':
                        command = 'xdotool key apostrophe';
                        break;
                    case '"':
                        command = 'xdotool key Shift+apostrophe';
                        break;
                    case '/':
                        command = 'xdotool key slash';
                        break;
                    case '`':
                        command = 'xdotool key grave';
                        break;
                    case '~':
                        command = 'xdotool key Shift+grave';
                        break;
                    default:
                        if (char.match(/[a-zA-Z]/)) {
                            command = `xdotool key ${char.toLowerCase()}`;
                        } else if (char.match(/[0-9]/)) {
                            command = `xdotool key ${char}`;
                        } else {
                            command = null;
                        }
                        break;
                }

                if (command) {
                    exec(command, (error) => {
                        if (error) {
                            reject(new Error(`xdotool error: ${error.message}`));
                        } else {
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            });
        }

        try {
            typeWithDelay(input, delay);
            message.reply(`Started simulating keystrokes: ${input}`);
        } catch (error) {
            console.error(`Error in keystroke simulation: ${error.message}`);
            message.reply('There was an error simulating the keystrokes!');
        }
    },
};
