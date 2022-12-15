import io from 'socket.io-client'

//forces the transport to be only websocket. This skips an initial HTTP request & upgrade
export const socket = io.connect('http://localhost:8080', {transports: ['websocket']})

export const breakIntoParts = (num, parts) => 
        [...Array(parts)].map((_,i) => 
          0|num/parts+(i < num%parts))