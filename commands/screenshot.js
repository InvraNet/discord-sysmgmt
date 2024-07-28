const { exec } = require('child_process');
const os = require('os');
const path = require('path');
const screenshot = require('screenshot-desktop');
const fs = require('fs');
const sharp = require('sharp');

module.exports = {
    data: {
        name: 'screenshot',
        description: 'Takes a screenshot, compresses it, and sends it as an attachment.',
    },
    async execute(message, args) {
        try {
            const platform = os.platform();
            const filePath = path.join(__dirname, '../temp/screenshot.png');
            const compressedFilePath = path.join(__dirname, '../temp/screenshot-compressed.png');
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }
            
            const processAndSendScreenshot = async () => {
                try {
                    await compressImage(filePath, compressedFilePath);
                    sendScreenshot(compressedFilePath);
                } catch (err) {
                    console.error(`Error during processing or sending: ${err}`);
                    message.reply('There was an error processing or sending the screenshot!');
                }
            };

            if (platform === 'win32' || platform === 'darwin') {
                await screenshot({ filename: filePath });
                console.log(`Screenshot taken and saved to ${filePath}`);
                await processAndSendScreenshot();
            } else if (platform === 'linux') {
                const display = process.env.DISPLAY || ':0';

                if (process.env.WAYLAND_DISPLAY) {
                    exec(`grim ${filePath}`, (error) => {
                        if (error) {
                            console.error(`Error taking screenshot on Wayland: ${error}`);
                            message.reply('There was an error taking the screenshot!');
                        } else {
                            console.log(`Screenshot taken on Wayland and saved to ${filePath}`);
                            processAndSendScreenshot();
                        }
                    });
                } else {
                    exec(`import -window root ${filePath}`, (error) => {
                        if (error) {
                            console.error(`Error taking screenshot on X11: ${error}`);
                            message.reply('There was an error taking the screenshot!');
                        } else {
                            console.log(`Screenshot taken on X11 and saved to ${filePath}`);
                            processAndSendScreenshot();
                        }
                    });
                }
            } else {
                message.reply('Current host is not available to take a screenshot.');
                return;
            }

            async function compressImage(inputPath, outputPath) {
                await sharp(inputPath)
                    .resize({ width: 1920 })
                    .toFormat('jpeg', { quality: 75 })
                    .toFile(outputPath);
            }

            async function sendScreenshot(filePath) {
                try {
                    await message.reply({ files: [filePath] });
                    await fs.promises.unlink(filePath);
                } catch (err) {
                    console.error(`Error sending screenshot: ${err}`);
                    message.reply('There was an error sending the screenshot!');
                }
            }

        } catch (error) {
            console.error(`Error taking screenshot: ${error}`);
            message.reply('There was an error taking the screenshot!');
        }
    },
};