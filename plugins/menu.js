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
  message += `Dibuat oleh XeyLabs`
  
  const buttons = createPaginationButtons(currentPage, totalPages)
  
  await conn.sendMessage(m.chat.id, message, {
    parse_mode: 'Markdown',
    reply_markup: buttons,
    disable_web_page_preview: true
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
      url: 'https://forum.html-5.me'
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
