const { exec } = require('child_process');
const os = require('os');
const path = require('path');

module.exports = {
    data: {
        name: 'launch',
        description: 'Launches an application.',
        example: `${process.env.PREFIX}launch 'kitty'`,
        support: "Linux, Windows",
        options: [
            {
                type: 'STRING',
                name: 'application',
                description: 'The application to launch.',
                required: true,
            },
        ],
    },
    async execute(message, args) {
        if (args[0] == null) {
            message.reply("You need to specify an app. **Example:** ``launch mpv``");
            return;
        }

        const platform = os.platform();
        const application = args[0].trim();
        let command;
        let checkCommand;

        if (platform === 'win32') {
            // Normalize application path
            const normalizedApp = path.normalize(application);
            command = `start "" "${normalizedApp}"`;
            checkCommand = `powershell -Command "Test-Path '${normalizedApp}'"`;
        } else if (platform === 'darwin') {
            command = `open -a "${application}"`;
            checkCommand = `mdfind "kMDItemDisplayName == '${application}' && kMDItemContentType == 'public.application'"`;
        } else if (platform === 'linux') {
            command = `exec "${application}"`;
            checkCommand = `which ${application}`;
        } else {
            message.reply(`This platform \`\`${platform}\`\` is not supported for launching applications.`);
            return;
        }

        exec(checkCommand, (checkError, stdout) => {
            if (checkError || !stdout.trim()) {
                message.reply(`The application \`\`${application}\`\` was not found.`);
                return;
            }

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error launching application: ${error}`);
                    message.reply(`There was an error launching the application! \`\`Error: ${stderr || error.message}\`\``);
                } else {
                    message.reply(`Application \`\`${application}\`\` launched successfully.`);
                }
            });
        });
    },
};
