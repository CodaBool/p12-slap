const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://localhost:8080']
  }
})
// const util = require('util')
http.listen(8080, () => console.log('--> http://localhost:8080'))

const players = {}
const game = { stack: [] }

io.on('connection', socket => {
  
  // players[socket.id] = { cord: [0, 10, 0] }

  // console.log(`${socket.id} connected`)

  socket.emit("joined")

  socket.on("join", player => {
    // console.log('join data', player)
    // data is a Player class here 
    // this will run anytime a client does a mount
    players[socket.id] = {...player, id: socket.id}
    // console.log('server player', players[socket.id])
    // console.log('complete player list', players)
    console.log('lobby', socket.id, Object.keys(players).map(key => players[key].name))
    // socket.broadcast.emit("join", data)
    io.sockets.emit("join", players)
  })

  socket.on("joined", () => {
    socket.emit("joined", players)
  })

  socket.on('update-to-server', data => {
    for (const p of data.gamers) {
      players[p.id] = {...p}
    }
    if (data.state == 'slap') {
      // won a slap
      socket.emit('resetAll')
      socket.broadcast.emit('resetAll')
    }
    socket.broadcast.emit('update-to-clients', 
      { players: Object.values(players), stack: data.stack, state: data.state }
    )
  })

  // socket.on("rollDice", (data) => {
  //   users[data.id].pos = data.pos;
  //   const turn = data.num != 6 ? (data.id + 1) % users.length : data.id;
  //   io.sockets.emit("rollDice", data, turn);
  // });

  // socket.on("restart", () => {
  //   users = [];
  //   io.sockets.emit("restart");
  // });




  // socket.broadcast.emit('b', socket.id, io.engine.clientsCount)
  // socket.on('mounted', () => {
  //   socket.emit('getId', socket.id)
  // })
  // socket.emit(
  //   'init',
  //   { id: socket.id },
  //   io.engine.clientsCount - 1,
  //   Object.keys(players)
  // )

  socket.on('update', data => {
    if (io.engine.clientsCount > 2) {

      // when joined socket.handshake.issued
      // rooms socket.adapter.rooms

      // console.log(users)
      if (players[socket.id]) {
        players[socket.id].cord = data.cord
        socket.broadcast.emit('updated', data)
      }
    }
  })

  socket.on('drop', data => {
    // TODO: sync deck
    // console.log('drop', data.key)
    socket.broadcast.emit('dropAll', data.key)
  })

  socket.on('reset', () => {
    console.log('got a reset')
    socket.emit('resetAll')
  })

  socket.on('disconnect', msg => {
    console.log(socket.id, 'disconnected')
    socket.broadcast.emit('disconnected', players[socket.id])
    delete players[socket.id]
    socket.disconnect()
  })

  // socket.on('new room', function(room){
	//   console.log(`A new room is created ${room}`);
	//   socket.room = room;
	//   socket.join(room);
  // 	  io.emit('rooms', getRooms('new room'));
  // });

  // socket.on('join room', function(room){
	//   console.log(`A new user joined room ${room}`);
	//   socket.room = room;
	//   socket.join(room);
  // 	  io.emit('rooms', getRooms('joined room'));
  // });

  // socket.on('chat message', function(data){
  //   io.in(data.room).emit('chat message', `${data.name}: ${data.msg}` );
  // });
})

// setInterval(() => {
// 	const nsp = io.of('/');
//     let pack = [];
	
//     for(let id in io.sockets.sockets){
//         const socket = nsp.connected[id];
// 		//Only push sockets that have been initialised
// 		if (socket.player.model !== undefined){
//       // console.log('trying to push', pack)
// 			pack.push({
// 				id: socket.id,
// 				x: socket.player.x,
// 				y: socket.player.y,
// 				z: socket.player.z,
// 			});    
// 		}
//     }
// 	if (pack.length>0) io.emit('remoteData', pack);
// }, 40)

// function getRooms(){
//   const nsp = io.of('/');
//   const rooms = nsp.adapter.rooms;
//   /*Returns data in this form
//   {
//     'roomid1': { 'socketid1', socketid2', ...},
//     ...
//   }
//   */
//   //console.log('getRooms rooms>>' + util.inspect(rooms));

//   const list = {};
	
//   for(let roomId in rooms){
// 	  const room = rooms[roomId];
// 	  if (room===undefined) continue;
// 	  const sockets = [];
// 	  let roomName = "";
// 	  console.log('getRooms room>>', room);
// 	  for(let socketId in room.sockets){
// 		  const socket = nsp.connected[socketId];
// 		  if (socket===undefined || socket.username===undefined || socket.room===undefined) continue;
// 		  console.log(`getRooms socket(${socketId})>>${socket.username}:${socket.room}`);
// 		  // sockets.push(socket.username);
// 		  if (roomName=="") roomName = socket.room;
// 	  }
// 	  if (roomName!="") list[roomName] = sockets;
//   }
	
//   console.log(`getRooms: >>`, list);
//   return list;
// }