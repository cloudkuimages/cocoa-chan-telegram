import axios from 'axios'
import mime from 'mime-types'
import fs from 'fs/promises'
import path from 'path'

const handler = async ({ conn, m, text }) => {
  const url = text?.trim()

  if (!url || !url.startsWith('http')) {
    return await conn.sendMessage(m.chat.id, 'Masukkan URL yang valid!', {
      reply_to_message_id: m.message_id
    })
  }

  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'CocoaChanBot/1.0' }
    })

    const contentType = res.headers['content-type']
    const buffer = Buffer.from(res.data)

    const ext = mime.extension(contentType) || 'bin'
    const filename = `file_${Date.now()}.${ext}`
    const tmpPath = path.join('/tmp', filename)

    if (contentType.includes('image')) {
      await conn.sendPhoto(m.chat.id, buffer, {
        caption: `Berhasil mengambil gambar dari:\n${url}`,
        reply_to_message_id: m.message_id
      })
    } else if (contentType.includes('audio')) {
      await conn.sendAudio(m.chat.id, buffer, {
        mimetype: contentType,
        filename,
        caption: `Berhasil mengambil audio dari:\n${url}`,
        reply_to_message_id: m.message_id
      })
    } else if (contentType.includes('json')) {
      const jsonText = JSON.stringify(JSON.parse(buffer.toString()), null, 2)
      await conn.sendMessage(m.chat.id, `📄 JSON:\n\`\`\`\n${jsonText}\n\`\`\``, {
        parse_mode: 'Markdown',
        reply_to_message_id: m.message_id
      })
    } else if (contentType.includes('text/html')) {
      await fs.writeFile(tmpPath, buffer)
      await conn.sendDocument(m.chat.id, await fs.readFile(tmpPath), {
        filename,
        caption: `📄 HTML dari:\n${url}`,
        reply_to_message_id: m.message_id
      })
      await fs.unlink(tmpPath)
    } else {
      await fs.writeFile(tmpPath, buffer)
      await conn.sendDocument(m.chat.id, await fs.readFile(tmpPath), {
        filename,
        caption: `📦 File dari:\n${url}`,
        reply_to_message_id: m.message_id
      })
      await fs.unlink(tmpPath)
    }
  } catch (err) {
    console.error('GET error:', err)
    await conn.sendMessage(m.chat.id, `❌ Gagal fetch data:\n${err.message}`, {
      reply_to_message_id: m.message_id
    })
  }
}

handler.command = ['get']
handler.help = ['get <url>']
handler.tags = ['internet', 'tools']
handler.private = false

export default handler
