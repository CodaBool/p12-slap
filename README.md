# Code Examples
- [sandbox](https://codesandbox.io/s/vkgi6?file=%2Fsrc%2FGround.js%3A355-372)
- [basic](https://replit.com/talk/share/Simple-multiplayer-3D-FPS-using-Threejs/120692)
- [threejs rapier](https://github.com/isaac-mason/sketches/tree/main/src/sketches/sketch-Rapier-RaycastVehicle)
- [follow mouse](https://codepen.io/kylewetton/pen/WNNeyWJ)
- [voxel socket fps with ai](https://github.com/Eric-Gurt/StarDefenders3D)
- [reload animation](https://github.com/mohsenheydari/three-fps)
- [threejs fps](https://github.com/mrdoob/three.js/blob/dev/examples/games_fps.html)
- [animation](https://tympanus.net/codrops/2019/10/14/how-to-create-an-interactive-3d-character-with-three-js)

### Rapier
- [github](https://github.com/Viki-17/react-character-collider/blob/bb6d8598fb71cb17b9a8db6304b20b7db8bff8f4/src/Soilder.jsx)
- [github](https://github.com/myBooInvasion/virtual-reality/blob/b65e05110f7607905e8fb67ea67ebd8887de18f1/src/components/Soldier.jsx)
- [github](https://github.com/Viki-17/react-character-collider/blob/bb6d8598fb71cb17b9a8db6304b20b7db8bff8f4/src/Player.jsx)
- [github](https://github.com/mog3n/blocpass/blob/43d24aef44d485ddd3c1a131fa1e9d0b2fa860ba/src/character/Soldier.js)
- [github](https://github.com/wewerlive/Eco-treats/blob/007f49c0eabde47bb48ff5992c6adc41c175b5df/src/components/eco-treat/Player.jsx)

### Socket.io in Go options
- [1](https://github.com/ambelovsky/gosf-socketio)
- [2](https://github.com/Baiguoshuai1/shadiaosocketio)
- [currently using](https://github.com/zishang520/socket.io)
- [possible to create a custom one with Melody](https://github.com/olahol/melody)

### no downtime reloads
> these may not work with sockets and some AWS solution may be better

- [no downtime reload with Echo](https://medium.com/web-developer/golang%E3%83%BCzero-downtime-deploys-and-rollbacks-go-http-server%E3%83%BCecho-web-framework-apache-12a9a21bfc25)
- [simple systemd solution](https://bunrouter.uptrace.dev/guide/go-zero-downtime-restarts.html)
  - [systemd examples](https://www.reddit.com/r/golang/comments/oq7rvo/comment/h6gzbnn/?utm_source=share&utm_medium=web2x&context=3)
- [overwrite bin and stop](https://www.reddit.com/r/golang/comments/rcebag/comment/hnugioa/?utm_source=share&utm_medium=web2x&context=3)
-  I see options using the SO_REUSEADDR and SO_REUSEPORT, but this does random load balancing. I would need this to be sticky 
  - [basic](https://wutch.medium.com/zero-downtime-api-in-golang-d5b6a52cc0ed)
  - [too long didnt read 😂](https://www.haproxy.com/blog/truly-seamless-reloads-with-haproxy-no-more-hacks)
  - [too long didnt read 😂](https://goteleport.com/blog/golang-ssh-bastion-graceful-restarts)

# Models
- [Table](https://sketchfab.com/3d-models/low-poly-table-b940256ec5994e26a9e71289d1211b19)
- [Chair](https://sketchfab.com/3d-models/chair-b07d263a7ab942e6935e77cd75bf1194)
- [Room](https://sketchfab.com/3d-models/control-room-re-upload-e79e77650b5749f5a1ba18c5124e67b4)


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
- [progress bar guide](https://mc.dean.lsa.umich.edu/threejs/manual/en/textures.html)

# Blog
- [creating a texture atlas 4.1MB -> 37KB 111x reduction in assets](https://codesandbox.io/s/textureatlas-three-js-forked-q3n2gc?file=%2Fsrc%2Findex.js)

# Packer
### Logs
- [config](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html)

> debug
```
export PACKER_LOG_PATH="./packer.log"
export PACKER_LOG=10
packer build -debug .
```

# Smart build
- in order to only build front end I would need to split into a client server folder struct
  - then update in vercel the root folder
- go build
  - t4g runs on Arm-based 64 bit AWS Graviton2 processors
  - change GOARCH if instead using an intel based cpu
  - -ldflags="-s -w" strips ~1.3M unecessary info
  - -x enables verbose building

# Bugs
- ~~[running in mount twice](https://stackoverflow.com/a/69076030/15428240)~~ this should be solved now
- (feature?) you will be able to slap on cards which are burned.
- clicking start while seated attempts to also drop a card
- will sit on "Joining game" in menu despite failed ws conn
- ~~holding control gives null ref~~
- using npm i -f for the peer depend on latest rapier (rm this in Vercel)
- got a card is undefined when playing for over 5 minutes, and 5+ games
- typing space attempts a slap when you try to type

# Compression
MeshoptDecoder is already used in useGLTF loader

however, it is out of date, you can check the date on it [here](https://github.com/pmndrs/three-stdlib/blob/main/src/libs/MeshoptDecoder.js)

compared to the newer decoder [here](https://github.com/zeux/meshoptimizer/blob/master/js/meshopt_decoder.js)

# Other
- NOTE: empty namespaces will timeout after 45s
- consider changing opening chat to Enter
- would be nice to only drop cards if looking at table 
- should give message to all when a bad slap happened
- can filter out logs with agent.json
```
"filters": [{
  "type": "exclude",
  "expression": "URL query contains semicolon, which is no longer a supported separator"
}],
```

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


