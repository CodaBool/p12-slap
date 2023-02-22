module main

go 1.20

// engine.io 1.3 breaks localhost connects 🤷
// for now use 1.2.2
require (
	github.com/mitchellh/mapstructure v1.5.0
	github.com/rs/zerolog v1.29.0
	github.com/zishang520/engine.io v1.3.0
	github.com/zishang520/socket.io v1.0.18
)

require (
	github.com/andybalholm/brotli v1.0.4 // indirect
	github.com/gookit/color v1.5.0 // indirect
	github.com/gorilla/websocket v1.5.0 // indirect
	github.com/mattn/go-colorable v0.1.12 // indirect
	github.com/mattn/go-isatty v0.0.14 // indirect
	github.com/xo/terminfo v0.0.0-20210125001918-ca9a967f8778 // indirect
	golang.org/x/sys v0.0.0-20210927094055-39ccf1dd6fa6 // indirect
)