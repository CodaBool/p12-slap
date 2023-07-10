import io from 'socket.io-client'
import { useState, useEffect } from 'react'
// forces the transport start as websocket. This skips an initial HTTP request & upgrade
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_DOMAIN || 'http://localhost:3001'
export const socket = io.connect(SOCKET_URL, {path: '/slap'})
export const randomName = (Math.random() + 1).toString(36).substring(7)
export const ROOM_CHAR_SIZE = 6

export class Player {
  constructor(name, uid, id, order) {
    this.name  = name
    this.id    = id
    this.uid   = uid
    this.order = order
    this.turn  = false
    this.deck  = []
  }
}

// split an array into even numbers
export const breakIntoParts = (num, parts) => 
        [...Array(parts)].map((_,i) => 
          0|num/parts+(i < num%parts))

export function copy(array) {
  return JSON.parse(JSON.stringify(array))
}
function isFlattenable(value) {
  return true
}
function baseFlatten(array, depth, predicate, isStrict, result) {
  predicate || (predicate = isFlattenable)
  result || (result = [])

  if (array == null) {
    return result
  }

  for (const value of array) {
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result)
      } else {
        result.push(...value)
      }
    } else if (!isStrict) {
      result[result.length] = value
    }
  }
  return result
}
export function flatten(array) {
  const length = array == null ? 0 : array.length
  return length ? baseFlatten(array, 1) : []
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

export class TextureAtlas {
  constructor(json, texture) {
    this.textures = {};

    const { frames } = json;

    Object.keys(frames).forEach((name) => {
      const t = texture.clone();
      const data = frames[name].frame;
      t.repeat.set(data.w / texture.image.width, data.h / texture.image.height);
      t.offset.x = data.x / texture.image.width;
      t.offset.y =
        1 - data.h / texture.image.height - data.y / texture.image.height;
      t.needsUpdate = true;
      t.name = name

      this.textures[name] = t;
    });
  }

  getTexture(name) {
    return this.textures[name];
  }
}

export const cardNames = [
  "ad",
  "ah",
  "as",
  "ac",
  "2d",
  "2h",
  "2s",
  "2c",
  "3d",
  "3h",
  "3s",
  "3c",
  "4d",
  "4h",
  "4s",
  "4c",
  "5d",
  "5h",
  "5s",
  "5c",
  "6d",
  "6h",
  "6s",
  "6c",
  "7d",
  "7h",
  "7s",
  "7c",
  "8d",
  "8h",
  "8s",
  "8c",
  "9d",
  "9h",
  "9s",
  "9c",
  "1d",
  "1h",
  "1s",
  "1c",
  "jd",
  "jh",
  "js",
  "jc",
  "qd",
  "qh",
  "qs",
  "qc",
  "kd",
  "kh",
  "ks",
  "kc"
]