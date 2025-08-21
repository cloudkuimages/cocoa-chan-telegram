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
      headers: { 'User-Agent': 'xBOT/1.0' }
    })

    const contentType = res.headers['content-type']
    const buffer = Buffer.from(res.data)

    const ext = mime.extension(contentType) || 'bin'
    const filename = `file_${Date.now()}.${ext}`
    const tmpPath = path.join('/tmp', filename)

    const contentHandlers = {
      image: async () => conn.sendPhoto(m.chat.id, buffer, {
        caption: `Berhasil mengambil gambar dari:\n${url}`,
        reply_to_message_id: m.message_id
      }),
      audio: async () => conn.sendAudio(m.chat.id, buffer, {
        mimetype: contentType,
        filename,
        caption: `Berhasil mengambil audio dari:\n${url}`,
        reply_to_message_id: m.message_id
      }),
      json: async () => {
        const jsonText = JSON.stringify(JSON.parse(buffer.toString()), null, 2);
        return conn.sendMessage(m.chat.id, `📄 JSON:\n\`\`\`\n${jsonText}\n\`\`\``, {
          parse_mode: 'Markdown',
          reply_to_message_id: m.message_id
        });
      },
      default: async () => {
        await fs.writeFile(tmpPath, buffer);
        await conn.sendDocument(m.chat.id, await fs.readFile(tmpPath), {
          filename,
          caption: `📦 File dari:\n${url}`,
          reply_to_message_id: m.message_id
        });
        await fs.unlink(tmpPath);
      }
    };

    let handlerKey = 'default';
    if (contentType.includes('image')) handlerKey = 'image';
    else if (contentType.includes('audio')) handlerKey = 'audio';
    else if (contentType.includes('json')) handlerKey = 'json';

    await contentHandlers[handlerKey]();
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
