let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const owners = global.owner.map(([id]) => id)
  const esReyMago = owners.includes(m.sender)
  const tituloEspecial = esReyMago ? '👑 *REY MAGO SUPREMO* 👑\n' : ''

  const texto = `
╭━━━[ 🧙‍♂️ *MENÚ RPG MÁGICO* ]━━━╮
┃ 🎮 *Comandos de Aventura:*
┃ ⛏️ .minar → Extrae minerales y gana monedas
┃ 🎁 .daily → Reclama tu tesoro diario
┃ ❓ .acertijo → Responde acertijos y gana recompensas
┃ 🗡️ .robar2 @user → Intenta saquear a otro mago
┃ 🛒 .comprar <nombre> → Compra un personaje
┃ 📜 .mispersonajes → Revisa tus héroes mágicos
┃ 🔮 .pjs → Lista de personajes
┃ 💼 .banco → Consulta tus ahorros
┃ 💸 .enviar @user <cantidad> → Envía monedas
┃ ⚔️ .duelo → Desafía a otro jugador
┃ 🩸 .sacrificar → Sacrifica por poder oscuro
┃ 🎲 .cajamisteriosa → Abre una caja
┃ 🏆 .toppersonajes → Ranking
┃ 🧟 .invasionzombie → Defensa del reino
┃ 🏹 .cazar → Caza bestias
┃ 👑 .reinado → Lucha por el trono
┃ 💰 .mismonedas → Revisa tus monedas
┃ 🔨 .trabajar → Gana monedas trabajando
┃ 💀 .invocacion → Invoca personajes
┃ ➕ .math <dificultad> → Matemáticas
┃ 💘 .rw → Compra waifus
┃ 💖 .miswaifus → Tus waifus
┃ 📖 .listawaifus → Lista general
┃ 🥇 .topwaifus → Ranking waifus
╰━━━━━━━━━━━━━━━━━━━━⬯

╭━━━[ 📊 *TU ESTADO* ]━━━╮
┃ 🧪 Nivel de Magia: ${user.level || 0}
┃ ✨ Experiencia: ${user.exp || 0}
┃ 💰 Monedas: ${(user.monedas || 0).toLocaleString()} 🪙
╰━━━━━━━━━━━━━━━━━━━━⬯

${tituloEspecial}
🌟 *Sigue creciendo, aventurero.*
💡 El destino del reino depende de ti.
`.trim()

  const img = 'https://files.catbox.moe/mfkwj2.jpg'

  await conn.sendMessage(m.chat, {
    image: { url: img },
    caption: texto,
    footer: '🧙‍♂️ Menú RPG',
    buttons: [
      {
        buttonId: '.menu',
        buttonText: { displayText: '🏠 Volver al Menú' },
        type: 1
      }
    ],
    headerType: 4
  }, { quoted: m })
}

handler.help = ['menurpg']
handler.tags = ['rpg']
handler.command = ['menurpg', 'rpgmenu', 'menur']
handler.register = true

export default handler