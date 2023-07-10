import { Server } from "socket.io"
const io = new Server(3001, {
  cors: { origin: "*" }
})

const ROOM_CHAR_SIZE = 6
const players = new Map()

class Player {
  constructor(name, uid, order, id) {
    this.uid = uid
    this.id = id
    this.name = name
    this.order = order
  }
  turn = false
  deck = []
}

io.on('connection', socket => {
  const id = socket.id
  let room = id.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, ROOM_CHAR_SIZE)

  socket.on("init", data => {
    const player = new Player(data['name'], data['uid'], 1, room)
    players.set(id, player)
    socket.join(room)
    io.to(room).emit('init', room)
    console.log("👋 Name:", data['name'], "| Room:", room)
  })
  socket.on("chat", data => {
    socket.broadcast.to(room).emit('chat', data)
  })
  socket.on("move", data => {
    socket.broadcast.to(room).emit('move', data)
  })
  socket.on("status", data => {
    socket.broadcast.to(room).emit('status', data)
  })
  socket.on("chair", data => {
    socket.broadcast.to(room).emit('chair', data)
  })
  socket.on("drop", data => {
    socket.broadcast.to(room).emit('drop', data)
  })
  socket.on("animation", data => {
    socket.broadcast.to(room).emit('animation', data)
  })
  socket.on("update", data => {
    if (data.state === 'win') {
      io.to(room).emit('reset')
    } else if (data.state === 'end') {
      io.to(room).emit('reset')
      socket.broadcast.to(room).emit('status', 'ready')
    }
    socket.broadcast.to(room).emit('update', data)
  })
  socket.on("join", async data => {
    const group = io.sockets.adapter.rooms.get(id)
    if (group.size < 5 || data['id']) {
      socket.join(data['rkey'])
      socket.leave(room)
      room = data['rkey']
      const player = players.get(id)
      player.order = group.size + 1
      player.id = room
      players.set(id, player)
      console.log("✈️  Name:", player.name, "| Room:", room, "| Order:", player.order)
      const ids = await io.in(room).fetchSockets()
      const gamers = []
      for (const sock of ids) {
        gamers.push(players.get(sock.id))
      }
      io.to(room).emit('join', gamers)
    } else {
      console.error('full or failed init')
    }
  })
  socket.on("disconnect", () => {
    if (players.size) {
      const player = players.get(id)
      console.log('🚪 Name:', player?.name, "| Room:", room, "| Players:", players.size)
      players.delete(id)
      socket.broadcast.to(room).emit('leave', player)
    } else {
      console.log('🚪 Emptied:', room)
    }
  })
})