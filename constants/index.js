import io from 'socket.io-client'
import { useState, useEffect } from 'react'
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

export function debounce(func, wait, immediate) {
	var timeout
	return function() {
		var context = this, args = arguments
		var later = function() {
			timeout = null
			if (!immediate) func.apply(context, args)
		}
		var callNow = immediate && !timeout
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
		if (callNow) func.apply(context, args)
	}
}

export function useDebounce(value, timeout) {
  const [state, setState] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setState(value), timeout)
    return () => clearTimeout(handler)
  }, [value, timeout])

  return state
}