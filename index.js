
const [major] = process.versions.node.split('.').map(Number)
if (major < 22) {
  console.error(chalk.red.bold(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                      ERROR                                            ║
║                          Minimal Node.js v22 dibutuhkan                          ║
║                              Versi saat ini: v${process.version}                                ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`))
  process.exit(1)
}

import TelegramBot from 'node-telegram-bot-api'
import chokidar from 'chokidar
import { UploadFile } from 'cloudku-uploader'
import path from 'path'
import fs from 'fs/promises'
import chalk from 'chalk'
import config from './config.js'

const gradient = (text, colors) => {
  const lines = text.split('\n')
  return lines.map((line, i) => chalk.hex(colors[i % colors.length])(line)).join('\n')
}

console.log(gradient(`
 ██████╗ ██████╗  ██████╗ ██████╗  █████╗      ██████╗██╗  ██╗ █████╗ ███╗   ██╗    ██████╗  ██████╗ ████████╗
██╔════╝██╔═══██╗██╔════╝██╔═══██╗██╔══██╗    ██╔════╝██║  ██║██╔══██╗████╗  ██║    ██╔══██╗██╔═══██╗╚══██╔══╝
██║     ██║   ██║██║     ██║   ██║███████║    ██║     ███████║███████║██╔██╗ ██║    ██████╔╝██║   ██║   ██║   
██║     ██║   ██║██║     ██║   ██║██╔══██║    ██║     ██╔══██║██╔══██║██║╚██╗██║    ██╔══██╗██║   ██║   ██║   
╚██████╗╚██████╔╝╚██████╗╚██████╔╝██║  ██║    ╚██████╗██║  ██║██║  ██║██║ ╚████║    ██████╔╝╚██████╔╝   ██║   
 ╚═════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝     ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝    ╚═════╝  ╚═════╝    ╚═╝   
`, ['#ff1493', '#ff69b4', '#ff1493', '#ff69b4', '#ff1493', '#ff69b4']))

console.log(chalk.cyan.bold('                                    Version Telegram '))
console.log(chalk.magenta.italic('                                     by AlfiDev \n'))

const bot = new TelegramBot(config.telegramBotToken, { polling: true })
const plugins = new Map()
const pluginsFIle = path.join(process.cwd(), 'plugins')

async function loadPlugins() {
  plugins.clear()
  let loadedFiles = []
  try {
    const files = await fs.readdir(pluginsFIle)
    for (const file of files) {
      if (!file.endsWith('.js')) continue
      const filePath = path.join(pluginsFIle, file)
      const modulePath = `file://${filePath}?update=${Date.now()}`
      try {
        const { default: handler } = await import(modulePath)
        if (!handler || !handler.command) {
          console.warn(chalk.yellow.bold(`⚠️  Plugin ${chalk.cyan(file)} tidak punya export default atau command`))
          continue
        }
        const commands = Array.isArray(handler.command) ? handler.command : [handler.command]
        for (const cmd of commands) plugins.set(cmd.toLowerCase(), handler)
        loadedFiles.push(file)
      } catch (err) {
        console.error(chalk.red.bold(`❌ Gagal load plugin ${chalk.cyan(file)}:`), chalk.gray(err.message))
      }
    }
    if (loadedFiles.length > 0) {
      console.log(chalk.green.bold(`✅ Loaded ${chalk.yellow(loadedFiles.length)} plugin:`))
      loadedFiles.forEach(p => console.log(chalk.gray(` ${chalk.blue('└─')} ${chalk.white(p)}`)))
    } else {
      console.log(chalk.yellow.bold('⚠️  Tidak ada plugin berhasil dimuat.'))
    }
  } catch (e) {
    console.error(chalk.red.bold('❌ Gagal membaca direktori plugins:'), chalk.gray(e.message))
  }
}

global.sendMedia = async (conn, chatId, filePath, caption = '') => {
  try {
    const buffer = await fs.readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const opts = { caption }
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return conn.sendPhoto(chatId, buffer, opts)
    else if (['.mp4', '.mov', '.mkv', '.webm'].includes(ext)) return conn.sendVideo(chatId, buffer, opts)
    else return conn.sendDocument(chatId, buffer, opts)
  } catch (err) {
    console.error(chalk.red.bold('❌ sendMedia error:'), chalk.gray(err))
    return conn.sendMessage(chatId, '❌ Gagal kirim file.')
  }
}

global.loading = async (m, conn, done = false) => {
  const chatId = m.chat?.id || m.chat
  const key = `loading_${chatId}`
  global._loadingMsgs = global._loadingMsgs || {}
  try {
    if (!done) {
      const res = await conn.sendMessage(chatId, '⏳ Loading...', { reply_to_message_id: m.message_id || m.id })
      global._loadingMsgs[key] = res.message_id
    } else {
      if (global._loadingMsgs[key]) {
        await conn.editMessageText('✅ Selesai diproses.', { chat_id: chatId, message_id: global._loadingMsgs[key] })
        delete global._loadingMsgs[key]
      }
    }
  } catch (err) {
    console.error(chalk.red.bold('❌ loading() error:'), chalk.gray(err))
  }
}

bot.on('message', async (msg) => {
  const from = msg.from
  const chat = msg.chat
  const text = msg.text || ''
  const userTag = from.username ? `@${from.username}` : from.first_name
  const chatType = chat.type === 'private' ? 'PRIVATE' : 'GROUP'
  const chatName = chat.type === 'group' ? chat.title : 'Direct Message'
  console.log(`${chalk.bgBlue.white.bold(`[${chatType}]`)} ${chalk.bgYellow.black.bold(`[${chatName}]`)} ${chalk.gray('from')} ${chalk.bgGreen.white.bold(`[${userTag}]`)}: ${chalk.white.bold(text)}`)
  if (!text.startsWith('/')) return
  const args = text.trim().split(' ')
  let rawCommand = args.shift().substring(1).toLowerCase()
  const command = rawCommand.split('@')[0]
  const handler = plugins.get(command)
  if (handler) {
    try {
      await handler({ conn: bot, m: msg, text: args.join(' ') })
    } catch (e) {
      console.error(chalk.red.bold(`❌ Error on command /${command}:`), chalk.gray(e))
      bot.sendMessage(chat.id, '❌ Error saat menjalankan perintah.')
    }
  }
})

bot.on('callback_query', async (cb) => {
  const m = { callback_query: cb }
  for (const [, handler] of plugins.entries()) {
    if (typeof handler.before === 'function') {
      try {
        await handler.before(m, { conn: bot })
      } catch (e) {
        console.error(chalk.red.bold('❌ Callback error:'), chalk.gray(e))
        bot.answerCallbackQuery(cb.id, { text: '❌ Callback error' })
      }
    }
  }
})

chokidar.watch([pluginsFIle, path.join(process.cwd(), 'config.js'), path.join(process.cwd(), 'index.js')], {
  ignored: /^\./, persistent: true, usePolling: true, interval: 500
}).on('change', async (filePath) => {
  const filename = path.basename(filePath)
  if (filename.endsWith('.js') && filePath.includes('plugins')) {
    console.log(chalk.blue.bold(`🔄 Plugin changed:`), chalk.cyan(filename))
    await loadPlugins()
  } else if (filename === 'config.js' || filename === 'index.js') {
    console.log(chalk.redBright.bold(`⚠️  ${filename} was modified. Restarting...`))
    process.exit(0)
  }
})

loadPlugins()
