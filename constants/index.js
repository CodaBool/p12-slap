import io from 'socket.io-client'

//forces the transport to be only websocket. This skips an initial HTTP request & upgrade
export const socket = io.connect('http://localhost:8080', {transports: ['websocket']})

export const breakIntoParts = (num, parts) => 
        [...Array(parts)].map((_,i) => 
          0|num/parts+(i < num%parts))

export function copy(array) {
  return JSON.parse(JSON.stringify(array))
}
// fisher-yates / knuth shuffle
export function shuffleArr(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}