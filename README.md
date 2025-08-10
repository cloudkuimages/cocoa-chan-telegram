# 🍫 COCOA CHAN MD
## Telegram Bot Edition - Free Version

<div align="center">
  <img src="https://codeshare.cloudku.click/db/thumbnails/thumb_user_1.jpg" alt="Cocoa Chan MD" width="300" style="border-radius: 15px;">
  
  [![Node.js Version](https://img.shields.io/badge/Node.js-v22+-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-blue.svg?style=for-the-badge&logo=telegram)](https://telegram.org/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![License](https://img.shields.io/badge/License-MIT-red.svg?style=for-the-badge)](LICENSE)
  
  **✨ Modern Telegram Bot Framework with Plugin System ✨**
  
  [![Telegram Channel](https://img.shields.io/badge/Channel-@CocoaChanChannel-blue?style=for-the-badge&logo=telegram)](https://t.me/CocoaChanChannel)
  [![Telegram Group](https://img.shields.io/badge/Group-@CocoaChanGroup-green?style=for-the-badge&logo=telegram)](https://t.me/CocoaChanGroup)
  [![Developer](https://img.shields.io/badge/Dev-@cloudkudev-purple?style=for-the-badge&logo=telegram)](https://t.me/cloudkudev)
</div>

---

## 🌟 Features

- 🔧 **Plugin System** - Modular architecture with hot-reload
- 🔄 **Auto Reload** - Automatic plugin reloading on file changes
- 📱 **Media Support** - Send photos, videos, and documents easily
- ⚡ **Fast Performance** - Built with modern Node.js v22+
- 🎨 **Beautiful UI** - Colorful console output with gradient effects
- 📝 **Easy Configuration** - Simple config-based setup
- 🛡️ **Error Handling** - Robust error management system

## 📋 Requirements

- **Node.js v22 or higher** (Required)
- **Telegram Bot Token** (Get from [@BotFather](https://t.me/BotFather))
- **NPM or Yarn** package manager

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/cocoa-chan-md.git
cd cocoa-chan-md
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Bot
Create `config.js` file:
```javascript
export default {
  telegramBotToken: 'YOUR_BOT_TOKEN_HERE'
}
```

### 4. Run Bot
```bash
npm start
# or
node index.js
```

## 📁 Project Structure

```
cocoa-chan-md/
├── 📄 index.js          # Main bot file
├── ⚙️ config.js         # Configuration
├── 📂 plugins/          # Plugin directory
│   ├── 🔌 example.js    # Example plugin
│   └── 🔌 ...           # More plugins
├── 📋 package.json      # Dependencies
└── 📖 README.md         # This file
```

## 🔌 Plugin Development

Create a new plugin in the `plugins/` directory:

```javascript
// plugins/start.js
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import moment from 'moment-timezone'
import config from '../config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginsDir = path.join(__dirname)

const COMMANDS_PER_PAGE = 10
const MAX_MESSAGE_LENGTH = 3500

let handler = async ({ conn, m }) => {
  const name = m.from?.first_name || 'Pengguna'
  const userId = m.from?.id
  const isOwner = config.owner.includes(userId)
  const role = isOwner ? 'Owner' : 'User'
  const waktu = moment().tz('Asia/Jakarta').format('dddd, DD MMMM YYYY HH:mm:ss')
  
  const args = m.text?.split(' ') || []
  const currentPage = parseInt(args[1]) || 1
  
  const groups = await loadCommands()
  if (!groups) {
    return conn.sendMessage(m.chat.id, 'Gagal membaca daftar plugin.', {
      reply_to_message_id: m.message_id
    })
  }
  
  const allCommands = []
  for (const [tag, commands] of Object.entries(groups)) {
    allCommands.push({
      tag: tag.charAt(0).toUpperCase() + tag.slice(1),
      commands: commands
    })
  }
  
  const totalPages = Math.ceil(allCommands.length / COMMANDS_PER_PAGE)
  const startIndex = (currentPage - 1) * COMMANDS_PER_PAGE
  const endIndex = startIndex + COMMANDS_PER_PAGE
  const pageCommands = allCommands.slice(startIndex, endIndex)
  
  let message = `Halo, ${name}!\n`
  message += `Waktu: ${waktu}\n`
  message += `Role: ${role}\n`
  message += `Halaman: ${currentPage}/${totalPages}\n\n`
  message += `Daftar perintah bot:\n\n`
  
  for (const group of pageCommands) {
    message += `${group.tag}\n`
    message += `${group.commands.map(c => `- ${c}`).join('\n')}\n\n`
  }
  
  message += `Bot aktif 24/7\n`
  message += `Dibuat oleh @CloudkuDev`
  
  const buttons = createPaginationButtons(currentPage, totalPages)
  
  const photoUrl = 'https://codeshare.cloudku.click/db/thumbnails/thumb_user_1.jpg'
  
  await conn.sendPhoto(m.chat.id, photoUrl, {
    caption: message,
    parse_mode: 'Markdown',
    reply_markup: buttons
  })
}

async function loadCommands() {
  const groups = {}
  
  try {
    const files = await fs.readdir(pluginsDir)
    
    for (const file of files) {
      if (!file.endsWith('.js')) continue
      
      const filePath = path.join(pluginsDir, file)
      const modulePath = `file://${filePath}?v=${Date.now()}`
      
      try {
        const plugin = (await import(modulePath)).default
        if (!plugin?.command || !plugin?.tags) continue
        
        const commands = Array.isArray(plugin.command) 
          ? plugin.command 
          : [plugin.command]
        const tags = Array.isArray(plugin.tags) 
          ? plugin.tags 
          : [plugin.tags]
        
        for (const tag of tags) {
          if (!groups[tag]) groups[tag] = []
          groups[tag].push(commands.map(cmd => `/${cmd}`).join(', '))
        }
      } catch (pluginErr) {
        console.error(`Error loading plugin ${file}:`, pluginErr)
        continue
      }
    }
    
    return groups
  } catch (err) {
    console.error('Error reading plugins directory:', err)
    return null
  }
}

function createPaginationButtons(currentPage, totalPages) {
  const keyboard = []
  
  const navRow = []
  
  if (currentPage > 1) {
    navRow.push({
      text: 'Sebelumnya',
      callback_data: `menu_${currentPage - 1}`
    })
  }
  
  if (currentPage < totalPages) {
    navRow.push({
      text: 'Selanjutnya',
      callback_data: `menu_${currentPage + 1}`
    })
  }
  
  if (navRow.length > 0) {
    keyboard.push(navRow)
  }
  
  if (totalPages > 3) {
    const jumpRow = []
    
    if (currentPage > 2) {
      jumpRow.push({
        text: '1',
        callback_data: 'menu_1'
      })
      
      if (currentPage > 3) {
        jumpRow.push({
          text: '...',
          callback_data: 'menu_noop'
        })
      }
    }
    
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
      jumpRow.push({
        text: i === currentPage ? `[${i}]` : `${i}`,
        callback_data: `menu_${i}`
      })
    }
    
    if (currentPage < totalPages - 1) {
      if (currentPage < totalPages - 2) {
        jumpRow.push({
          text: '...',
          callback_data: 'menu_noop'
        })
      }
      
      jumpRow.push({
        text: `${totalPages}`,
        callback_data: `menu_${totalPages}`
      })
    }
    
    if (jumpRow.length > 0) {
      keyboard.push(jumpRow)
    }
  }
  
  keyboard.push([
    {
      text: 'Website',
      url: 'https://cloudkutube.eu'
    },
    {
      text: 'Channel',
      url: 'https://t.me/cloudkudev'
    }
  ])
  
  keyboard.push([
    {
      text: 'Developer',
      url: 'https://t.me/cloudkudev'
    }
  ])
  
  return {
    inline_keyboard: keyboard
  }
}

handler.callback = async ({ conn, callback_query }) => {
  const data = callback_query.data
  
  if (!data.startsWith('menu_')) return
  
  const page = data.replace('menu_', '')
  if (page === 'noop') {
    return conn.answerCallbackQuery(callback_query.id, {
      text: 'Navigasi cepat'
    })
  }
  
  const pageNum = parseInt(page)
  if (isNaN(pageNum)) return
  
  const fakeMessage = {
    from: callback_query.from,
    chat: { id: callback_query.message.chat.id },
    message_id: callback_query.message.message_id,
    text: `/menu ${pageNum}`
  }
  
  try {
    await conn.deleteMessage(callback_query.message.chat.id, callback_query.message.message_id)
  } catch (err) {
    console.error('Error deleting message:', err)
  }
  
  await handler({ conn, m: fakeMessage })
  await conn.answerCallbackQuery(callback_query.id)
}

handler.command = ['start', 'menu']
handler.help = ['start', 'menu']
handler.tags = ['main']

export default handler
```

### Plugin API

- `conn` - Telegram bot instance
- `m` - Message object
- `text` - Command arguments

### Global Functions

- `global.sendMedia(conn, chatId, filePath, caption)` - Send media files
- `global.loading(m, conn, done)` - Show loading indicator

## 🎨 Console Output

The bot features beautiful console logging with:
- 🌈 **Gradient ASCII Art** - Eye-catching startup banner
- 📊 **Colored Logs** - Different colors for different log types
- 🔍 **Message Tracking** - Real-time message monitoring
- ⚡ **Plugin Status** - Live plugin loading feedback

## ⚙️ Configuration

Edit `config.js` to customize:

```javascript
export default {
  telegramBotToken: 'YOUR_BOT_TOKEN',
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support & Community

<div align="center">

| Platform | Link | Description |
|----------|------|-------------|
| 📢 **Channel** | [@CocoaChanChannel](https://t.me/CocoaChanChannel) | Latest updates & announcements |
| 💬 **Group** | [@CocoaChanGroup](https://t.me/CocoaChanGroup) | Community support & discussions |
| 👨‍💻 **Developer** | [@cloudkudev](https://t.me/cloudkudev) | Direct contact with developer |

</div>

## 🐛 Bug Reports

Found a bug? Please report it:
1. Join our [Telegram Group](https://t.me/CocoaChanGroup)
2. Contact developer: [@cloudkudev](https://t.me/cloudkudev)
3. Provide detailed information about the issue

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cloudkuimages/cocoa-chan-telegram&type=Date)](https://star-history.com/cloudkuimages/cocoa-chan-telegram&Date)

---

<div align="center">
  
  **Made with ❤️ by [AlfiDev](https://t.me/cloudkudev)**
  
  ⭐ **Star this repo if you found it helpful!** ⭐
  
  ![Footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer)
  
</div>
