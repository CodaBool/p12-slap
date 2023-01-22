# Code Examples
- [sandbox](https://codesandbox.io/s/vkgi6?file=%2Fsrc%2FGround.js%3A355-372)
- [basic](https://replit.com/talk/share/Simple-multiplayer-3D-FPS-using-Threejs/120692)
- [threejs rapier](https://github.com/isaac-mason/sketches/tree/main/src/sketches/sketch-Rapier-RaycastVehicle)

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
- (feature?) you will be able to slap on cards which on burned.

# Compression
MeshoptDecoder is already used in useGLTF loader

however, it is out of date, you can check the date on it [here](https://github.com/pmndrs/three-stdlib/blob/main/src/libs/MeshoptDecoder.js)

compared to the newer decoder [here](https://github.com/zeux/meshoptimizer/blob/master/js/meshopt_decoder.js)
