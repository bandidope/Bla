const codigosArabes = ['+212', '+971', '+20', '+966', '+964', '+963', '+973', '+968', '+974']
const regexArabe = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/
const regexComando = /^[\/!#.]/

global.advertenciasArabes ||= {}

export async function before(m, { conn, isOwner, isROwner }) {
  try {
    if (!m?.message || !m.sender || typeof m.text !== 'string') return false
    if (m.isBaileys || m.isGroup) return false
    if (isOwner || isROwner) return false

    const numero = m.sender
    const texto = m.text
    const limpio = numero.replace(/\D/g, '')

    const esArabe =
      regexArabe.test(texto) ||
      codigosArabes.some(p => limpio.startsWith(p.replace('+', '')))

    const esComando = regexComando.test(texto)

    if (!esArabe || esComando) return true

    global.advertenciasArabes[numero] = (global.advertenciasArabes[numero] || 0) + 1
    const count = global.advertenciasArabes[numero]

    if (count >= 3) {
      await m.reply(`╭━〔 ⛔ BLOQUEO ACTIVADO 〕━⬣
┃ 👤 Usuario: ${numero}
┃ 🚫 Acceso: Denegado
┃ ⚠️ Motivo: Contenido no permitido
┃ 🔢 Intentos: 3/3
┃
┃ 🔒 Estado: bloqueado por seguridad
╰━━━━━━━━━━━━━━━━⬣`)

      await conn.updateBlockStatus(numero, 'block').catch(() => {})
      delete global.advertenciasArabes[numero]

      return false
    }

    await m.reply(`╭━〔 ⚠️ ADVERTENCIA 〕━⬣
┃ 👤 Usuario: ${numero}
┃ 🚫 Contenido detectado
┃ 🔢 Intentos: ${count}/3
┃
┃ 💡 Usa solo comandos permitidos
┃ ⚠️ Al llegar a 3 serás bloqueado
╰━━━━━━━━━━━━━━━━⬣`)

    return false

  } catch (e) {
    console.error('error anti-arabe:', e)
    return true
  }
}