# Code Examples
- [sandbox](https://codesandbox.io/s/vkgi6?file=%2Fsrc%2FGround.js%3A355-372)
- [basic](https://replit.com/talk/share/Simple-multiplayer-3D-FPS-using-Threejs/120692)
- [threejs rapier](https://github.com/isaac-mason/sketches/tree/main/src/sketches/sketch-Rapier-RaycastVehicle)
- [follow mouse](https://codepen.io/kylewetton/pen/WNNeyWJ)
- [voxel socket fps with ai](https://github.com/Eric-Gurt/StarDefenders3D)
- [reload animation](https://github.com/mohsenheydari/three-fps)
- [threejs fps](https://github.com/mrdoob/three.js/blob/dev/examples/games_fps.html)

### Rapier
- [github](https://github.com/Viki-17/react-character-collider/blob/bb6d8598fb71cb17b9a8db6304b20b7db8bff8f4/src/Soilder.jsx)
- [github](https://github.com/myBooInvasion/virtual-reality/blob/b65e05110f7607905e8fb67ea67ebd8887de18f1/src/components/Soldier.jsx)
- [github](https://github.com/Viki-17/react-character-collider/blob/bb6d8598fb71cb17b9a8db6304b20b7db8bff8f4/src/Player.jsx)
- [github](https://github.com/mog3n/blocpass/blob/43d24aef44d485ddd3c1a131fa1e9d0b2fa860ba/src/character/Soldier.js)
- [github](https://github.com/wewerlive/Eco-treats/blob/007f49c0eabde47bb48ff5992c6adc41c175b5df/src/components/eco-treat/Player.jsx)

# Models
- [Table](https://sketchfab.com/3d-models/low-poly-table-b940256ec5994e26a9e71289d1211b19)
- [Chair](https://sketchfab.com/3d-models/chair-b07d263a7ab942e6935e77cd75bf1194)

# Links
- [docs](https://docs.pmnd.rs/react-three-fiber/getting-started/your-first-scene)
- [fast gltf to react](https://gltf.pmnd.rs)
- [three.js](http://stemkoski.github.io/Three.js)
- [rules](https://bicyclecards.com/how-to-play/egyptian-rat-screw)
- [socket.io guide](https://medium.com/swlh/game-design-using-socket-io-and-deployments-on-scale-part-2-254e674bc94b) this shows how to scale
- [peerjs](https://peerjs.com) socket.io alternative. Far less popular but would cut down on server cost since it is P2P
- [cannon](https://github.com/pmndrs/use-cannon) alternative React physics. Just based on popularity I probably should be using this over Rapier but it might not matter.
- [post processing](https://github.com/pmndrs/react-postprocessing) and [docs](https://docs.pmnd.rs/react-postprocessing/introduction)
- [vr / ar](https://github.com/pmndrs/react-xr)

# Bugs
- ~~[running in mount twice](https://stackoverflow.com/a/69076030/15428240)~~ this should be solved now
- (feature?) you will be able to slap on cards which are burned.
- clicking start while seated attempts to also drop a card
- will sit on "Joining game" in menu despite failed ws conn

# Compression
MeshoptDecoder is already used in useGLTF loader

however, it is out of date, you can check the date on it [here](https://github.com/pmndrs/three-stdlib/blob/main/src/libs/MeshoptDecoder.js)

compared to the newer decoder [here](https://github.com/zeux/meshoptimizer/blob/master/js/meshopt_decoder.js)

# Other
- empty namespaces will timeout after 45s
- consider changing opening chat to Enter

# Go Migration notes
## Efficiency
- arrays & slice are highly performant read write
- array > slice > map
- can pre-allocate for a map `make(map[int]string, hint)` with a hint capacity
- maps of type map[int]struct{} which are empty will skip GC saving on iops
- `unsafe.Sizeof(hmap) + (len(theMap) * 8) + (len(theMap) * 8 * unsafe.Sizeof(x)) + (len(theMap) * 8 * unsafe.Sizeof(y))` find size of key and value

### write
- array append is 95% faster than InsertXSlice
- slice is 10x faster than map 

### read
- map has O(n) read and will be 90% faster most of the time


### Example
WRITE 200: if you had 200 items it would take .8 micro seconds for slice, 12 micro seconds for map to add one more item (slice 14x faster)
READ 200: if you had 200 items it would take .072 micro seconds for slice, .006 micro seconds for map to get one (map 12x faster)
WRITE 2000: if you had 2000 items it would take 8 micro seconds for slice, 177 micro seconds for map to add one more item (slice 22x faster)
READ 2000: if you had 2000 items it would take .8 micro seconds for slice, .01 micro seconds for map to get one (map 80x faster)
WRITE 64k: if you had 64k items it would take 328 micro seconds for slice, 5701 micro seconds for map to add one more item (slice 17x faster)
READ 64k: if you had 64k items it would take 23 micro seconds for slice, .01 micro seconds for map to get one (map 2300x faster)

- if expecting less than 2000 items then just use whatever is easier
- maps should be used if expecting high read

## Usage
### Maps
- [guide](https://distantjob.com/blog/golang-map)
- var m map[string]struct{}    ;      m = make(map[string]struct{}) // create
- m["route"] = 66
- m["route"] // returns the type's zero value useful to know if the key existed
  - // since this returns 0 if not existing something like this is possible
  - if visited[n] { // exists }
- len(m)
- delete(m, "route") // will do nothing if key does not exist
- i, ok := m["route"] // i will be 0 if doesn't exist ok will be bool for existance
- for key, value := range m { }

### Slice
- s := make([]T, n) // n is optional size
- len(s)
- s[0]
- s[0] = "val"
- Filter(s, func)
- couple ways to delete elements
```
// randomized past the index removal point
func remove(s []int, i int) []int {
  s[i] = s[len(s)-1]
  return s[:len(s)-1]
}

// preserve order index removal
func remove(s []int, i int) []int {
  copy(s[i:], s[i+1:])
  return s[:len(s)-1]
}

// preserve order section removal of elements [i:j] this will modify the original slice. reassign slice is needed since the length will be off otherwise
"golang.org/x/exp/slices"
mySlice = slices.Delete(mySlice, i, j)
```
- reslicing a slice does not make a new slice, and changes to the returned slice will affect the original
- append(s, x)
  - append(s, 3, 5, 7) can chain multiple append values as arguments
  - append(s, s2...) append one slice to another
  - can use `AppendByte(p, 7, 11, 13)` to specify how much to grow the array by

### Array
- b := [2]string{"Penn", "Teller"}


