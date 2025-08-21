# 🤖 xBOT - Telegram Bot

<div align="center">
  
  [![Node.js Version](https://img.shields.io/badge/Node.js-v22+-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![License](https://img.shields.io/badge/License-MIT-red.svg?style=for-the-badge)](LICENSE)
  
  **✨ Modern Telegram Bot Framework with a Hot-Reload Plugin System ✨**
  
  [![Developer](https://img.shields.io/badge/Developer-XeyLabs-purple?style=for-the-badge)](https://forum.html-5.me)
</div>

---

## 🌟 Features

- 🔧 **Plugin System**: Modular architecture with hot-reloading for easy development.
- 🔄 **Auto Reload**: Automatically reloads plugins when files are changed.
- ⚡ **Fast & Modern**: Built with the latest Node.js for optimal performance.
- 🎨 **Colorful Logging**: Enhanced console output for better readability.
- 📝 **Simple Configuration**: Easy setup through a single `config.js` file.
- 🛡️ **Robust Error Handling**: Catches errors gracefully to keep the bot running.

## 📋 Requirements

- **Node.js v22 or higher**
- **Telegram Bot Token** (Get from [@BotFather](https://t.me/BotFather))
- **NPM or Yarn** package manager

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/xBOT.git
cd xBOT
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Bot
Create a `config.js` file from the example or by copying the following:
```javascript
export default {
  telegramBotToken: 'YOUR_BOT_TOKEN_HERE', // Get token from @BotFather
  owner: [
    1234567890 // Your Telegram User ID
  ]
}
```

### 4. Run Bot
```bash
npm start
```

## 📁 Project Structure

```
xBOT/
├── 📄 index.js          # Main bot entry point
├── ⚙️ config.js         # Bot configuration
├── 📂 plugins/          # Directory for your plugins
│   ├── 🔌 menu.js       # The main menu command
│   └── 🔌 get.js        # Example utility command
├── 📋 package.json      # Project dependencies
└── 📖 README.md         # This file
```

## 🔌 Plugin Development

Creating a new plugin is simple. Create a new `.js` file in the `plugins/` directory. The file must export a `default` object with `command`, `tags`, and a `handler` function.

**Example: `plugins/ping.js`**
```javascript
// plugins/ping.js

// The main function that runs when the command is triggered
const handler = async ({ conn, m, text }) => {
  await conn.sendMessage(m.chat.id, 'Pong!', {
    reply_to_message_id: m.message_id
  });
}

// The command(s) that trigger this plugin
handler.command = ['ping', 'p'];

// Help text for the menu
handler.help = ['ping'];

// Tags for grouping commands in the menu
handler.tags = ['tools'];

// Export the handler
export default handler;
```

### Plugin API
- `conn`: The Telegram bot instance.
- `m`: The full message object from `node-telegram-bot-api`.
- `text`: A string containing the arguments passed to the command.

## 🤝 Contributing

Contributions are welcome! Please feel free to fork the repository, make changes, and open a pull request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📞 Support

For questions or support, please visit our website:
- **Website**: [https://forum.html-5.me](https://forum.html-5.me)
- **Developer**: XeyLabs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  **Made with ❤️ by XeyLabs**
</div>
