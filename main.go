package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"reflect"
	"strings"
	"syscall"
	"time"

	ms "github.com/mitchellh/mapstructure"

	"github.com/zishang520/engine.io/types"
	server "github.com/zishang520/socket.io/socket"

	// Logging
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// reflect.DeepEquals(1, 2)

// I found a better method of looking at types and used it in periodicallyPrintInfo
// switch mapOrBool.(type) { // v := can be set to v for printing
// case bool:
// case map[int]string:

// io.Of("/test", nil).Emit("hi", msgs...)

// utils.Log().Success("FetchSockets %v", io.Adapter().FetchSockets(&socket.BroadcastOptions{
// 	Rooms: types.NewSet[socket.Room]("/"),
// }))

// TODO: should look into using server.Room instead of string for key values

type Player struct {
	Name  string   `json:"name"`
	Turn  bool     `json:"turn"`
	Id    string   `json:"id"`
	Uid   string   `json:"uid"`
	Deck  []string `json:"deck"`
	Order int8     `json:"order"`
}

type Message struct {
	Author string `json:"author"`
	Uid    string `json:"uid"`
	Body   string `json:"body"`
}

type Update struct {
	Players   []Player `json:"players"`
	Stack     []string `json:"stack"`
	State     string   `json:"state"`
	FaceOwner string   `json:"faceOwner"`
	Key       string   `json:"key"`
	Id        string   `json:"id"`
	Type      string   `json:"type"`
}

type Move struct {
	X        int16  `json:"x"`
	Z        int16  `json:"z"`
	Rotation int16  `json:"rotation"`
	Uid      string `json:"uid"`
	Order    int8   `json:"order"`
}

func check(err error) {
	if err != nil {
		log.Fatal().Err(err).Msg("")
	}
}

func typeof(v interface{}) string {
	return fmt.Sprintf("%T", v)
}

func firstN(s string, n int) string {
	i := 0
	for j := range s {
		if i == n {
			return s[:j]
		}
		i++
	}
	return s
}

func removeIndex(s []string, i int) []string {
	s[i] = s[len(s)-1]
	return s[:len(s)-1]
}

func debugLogger() {
	var _ string = `                _        _     _
               | |      | |   (_)      
 ___  ___   ___| | _____| |_   _  ___  
/ __|/ _ \ / __| |/ / _ \ __| | |/ _ \ 
\__ \ (_) | (__|   <  __/ |_ _| | (_) |
|___/\___/ \___|_|\_\___|\__(_)_|\___/ `

	// You can set which level of logs are shown by changing SetGlobalLevel
	// 4 FTL log.Fatal().Err(err).Msg("")
	// 3 ERR log.Error().Err(err).Msg("")
	// 2 WRN log.Warn().Msg("")
	// 1 INF log.Info().Msg("")
	// 0 DBG log.Print("")
	// - TRC log.Trace().Msg("")
	log.Logger = log.Output(zerolog.ConsoleWriter{
		Out:          os.Stderr,
		PartsExclude: []string{zerolog.TimestampFieldName}, // comment to add time
		FormatCaller: func(i interface{}) string {
			line := strings.Split(fmt.Sprintf("%s", i), ":")
			if false { // change to true to add line number for logs
				return "@" + line[len(line)-1]
			}
			return ""
		},
	}).Level(zerolog.DebugLevel).With().Caller().Logger()
	zerolog.SetGlobalLevel(zerolog.DebugLevel)
	// fmt.Println(ASCII_ART)
}

func printRooms(io *server.Server, printPlayers bool, players map[string]Player) {
	s := make([]string, 0)
	io.Sockets().Adapter().Rooms().Range(func(key, value interface{}) bool {
		s = append(s, fmt.Sprintf("%v", key))
		// sync.Map can return false to interupt iteration
		return true
	})
	if printPlayers {
		output := make([]string, 0)
		for _, rkey := range s {
			if len(rkey) == ROOM_CHAR_SIZE {
				slice := inRoom(io, rkey)
				names := make([]string, 1)
				names[0] = rkey + ": "
				for _, id := range slice {
					names = append(names, players[id].Name)
				}
				// only get rooms with players in it
				if len(names) > 1 {
					output = append(output, strings.Join(names, " "))
				}
			}
		}
		log.Info().Strs("All", output).Send()
	} else {
		log.Info().Strs("Rooms", s).Send()
	}
}

func activeRooms(io *server.Server) (s []string) {
	// alternative solution would be to look at the length of the rkey and simply print short ones
	io.Sockets().Adapter().Rooms().Range(func(key, value interface{}) bool {
		if rkey, ok := key.(server.Room); ok {
			clients := io.Sockets().Adapter().FetchSockets(&server.BroadcastOptions{
				Rooms: types.NewSet(rkey),
			})
			if len(clients) > 1 {
				s = append(s, string(rkey))
			}
		}
		return true
	})
	return s
}

func inRoom(io *server.Server, room string) (s []string) {
	clients := io.Sockets().Adapter().FetchSockets(&server.BroadcastOptions{
		Rooms: types.NewSet(server.Room(room)),
	})
	for _, client := range clients {
		if cl, ok := client.(*server.Socket); ok {
			s = append(s, string(cl.Id()))
		}
	}
	return s
}

func playersInRoom(io *server.Server, room string, players map[string]Player) (pSlice []Player) {
	idSlice := inRoom(io, room)
	for _, id := range idSlice {
		if player, ok := players[id]; ok {
			pSlice = append(pSlice, player)
		}
	}
	return pSlice
}

// TODO: this probably could be improved with the new foudn FetchSockets logic used in inRoom
func debug(io *server.Server, p map[string]Player) {
	rooms := make(map[server.Room]bool)
	printUpdate := false
	var count int = 0
	var connected uint64 = 0
	for range time.Tick(time.Second * 1) {

		if connected != io.Engine().ClientsCount() {
			connected = io.Engine().ClientsCount()
			printUpdate = true
		}

		count = 0
		io.Sockets().Adapter().Rooms().Range(func(key, value interface{}) bool {
			count++
			if value, ok := key.(server.Room); ok {
				if !(rooms[value]) {
					// log.Print("Adding room ", key)
					rooms[value] = true
					printUpdate = true
				}
			}
			return true
		})

		if count != len(rooms) {
			// sync rooms
			// log.Print("  rooms ", len(rooms), " -> ", count)
			for r := range rooms {
				value, _ := io.Sockets().Adapter().Rooms().Load(r)
				// log.Print("  checking if room ", r, " is in rooms, got value of '", value, "' for that key")
				if value == nil {
					// log.Print("  The room ", r, " is not present for the socket and is being deleted")
					delete(rooms, r)
				}
			}
			printUpdate = true
		}

		if printUpdate {
			keyAppends := make([]string, 0)
			for r := range rooms {
				// keyAppends = append(keyAppends, fmt.Sprintf("%v", r))
				// truncate id
				if len(string(r)) == ROOM_CHAR_SIZE {
					keyAppends = append(keyAppends, string(r))
				}
			}
			log.Print("Connected: ", connected, " | Players: ", len(p), " | Rooms: ", keyAppends)
			printUpdate = false
		}
	}
}

func findMethods(input any) {
	fooType := reflect.TypeOf(input)
	for i := 0; i < fooType.NumMethod(); i++ {
		method := fooType.Method(i)
		log.Print(method.Name)
	}
}

func print(title string, input any) {
	output, err := json.Marshal(input)
	check(err)
	log.Info().Msg(fmt.Sprintf("%s: %v", title, string(output)))
}

func printArr(title string, input ...any) {
	for i := range input {
		output, err := json.Marshal(i)
		check(err)
		log.Info().Msg(fmt.Sprintf("%s: %v", title, string(output)))
	}
}

func rmNonAlphaNum(s string) string {
	var result strings.Builder
	for i := 0; i < len(s); i++ {
		b := s[i]
		if ('a' <= b && b <= 'z') ||
			('A' <= b && b <= 'Z') ||
			('0' <= b && b <= '9') ||
			b == ' ' {
			result.WriteByte(b)
		}
	}
	return result.String()
}

// 36 ^ 6 = 2,176,782,336
// 1 in 2,176,782,336 odds of duplicate room
const ROOM_CHAR_SIZE int = 6

func main() {
	// allocate 100 initial players in memory
	players := make(map[string]Player, 100)
	// this would be a better as a set of a set
	// roomRegistry := make(map[string][]string, 100)

	httpServer := types.CreateServer(nil)
	config := server.DefaultServerOptions()
	config.SetCors(&types.Cors{Origin: "*"})
	io := server.NewServer(httpServer, config)

	debugLogger()
	go debug(io, players)

	// USEFUL
	// types.NewStringBufferString("xxx")
	// "github.com/google/uuid"
	// id := uuid.New()
	// can get ip of the client from handshake.address
	// Nested objs
	// if m, ok := data[0].(map[string]any); ok {
	// 	if m2, ok := m["player"].([]any); ok {
	// 		print("player", parsePlayer(m2))
	// 		log.Print("wants to join room ", m["rkey"])
	// 		if
	// 	}
	// }

	io.On("connection", func(clients ...any) {
		// client methods
		// https://github.com/zishang520/socket.io/blob/main/socket/socket.go#L45
		socket := clients[0].(*server.Socket)
		id := string(socket.Id())
		rkey := firstN(strings.ToUpper(rmNonAlphaNum(id)), ROOM_CHAR_SIZE)

		socket.On("init", func(data ...any) {
			var player Player
			err := ms.Decode(data[0], &player)
			check(err)
			player.Id = rkey
			player.Order = 1
			players[id] = player
			// TODO: for some reason leaving your original room breaks broadcasts
			// socket.Leave(server.Room(id))
			socket.Join(server.Room(rkey))

			io.Sockets().To(server.Room(rkey)).Emit("init", rkey)
			log.Info().Str("Name", players[id].Name).Msg("👋") // .Str("Room", rkey)
		})

		socket.On("run", func(...any) {
		})

		socket.On("chat", func(msg ...any) {
			var message Message
			err := ms.Decode(msg[0], &message)
			check(err)
			socket.Broadcast().To(server.Room(rkey)).Emit("chat", message)
		})

		socket.On("move", func(data ...any) {
			// log.Print("d ", data[0], " ", typeof(data[0]))
			// if arr, ok := data[0].(Move); ok {
			// 	log.Print("arr ", arr)
			// }
			if arr, ok := data[0].([]any); ok {
				var move Move
				if posX, ok := arr[0].(float64); ok {
					move.X = int16(posX)
				} else {
					log.Print("failed to cast position X to float64")
				}
				if posZ, ok := arr[1].(float64); ok {
					move.Z = int16(posZ)
				} else {
					log.Print("failed to cast position Z to float64")
				}
				if rotation, ok := arr[2].(float64); ok {
					move.Rotation = int16(rotation)
				} else {
					log.Print("failed to cast rotation to float64")
				}
				if uid, ok := arr[3].(string); ok {
					move.Uid = uid
				} else {
					log.Print("failed to cast uid to string")
				}
				if order, ok := arr[4].(float64); ok {
					move.Order = int8(order)
				} else {
					log.Print("failed to cast order to int8")
				}
				// log.Print("broadcast ", move)
				socket.Broadcast().To(server.Room(rkey)).Emit("move", move)
				// log.Print(pos, arr[2])
				// var x int16 = int16(arr[0])
				// var y int16 = int16(arr[1])
				// log.Print("d ", " ", arr, " ", typeof(arr[0]))
				// if anInt, ok := arr[0].(int); ok {
				// 	log.Print("val ", anInt)
				// } else {
				// 	log.Print("ok ", ok, " ", anInt)
				// }
			} else {
				log.Print("outter fail")
			}
			// socket.Broadcast().To(server.Room(rkey)).Emit("chat", message)
		})

		socket.On("status", func(status ...any) {
			log.Print("sending status ", status[0])
			socket.Broadcast().To(server.Room(rkey)).Emit("status", status[0])
		})

		socket.On("sit", func(data ...any) {
			log.Print("sending sit ", data[0])
			socket.Broadcast().To(server.Room(rkey)).Emit("sit", data[0])
		})

		socket.On("drop", func(data ...any) {
			var result Update
			err := ms.Decode(data[0], &result)
			check(err)
			socket.Broadcast().To(server.Room(rkey)).Emit("drop",
				map[string]string{"key": result.Key, "type": result.Type},
			)
		})

		socket.On("reset", func(data ...any) {
			log.Print("sending reset ", data[0])
			socket.Broadcast().To(server.Room(rkey)).Emit("reset", data[0])
		})

		socket.On("update", func(data ...any) {
			var result Update
			err := ms.Decode(data[0], &result)
			check(err)
			for _, player := range result.Players {
				players[player.Id] = player
			}
			if result.State == "win" {
				log.Print("win, sending reset")
				io.Sockets().To(server.Room(rkey)).Emit("reset")
				// socket.Broadcast().To(server.Room(rkey)).Emit("reset")
			}
			socket.Broadcast().To(server.Room(rkey)).Emit("update", result)
		})

		socket.On("join", func(data ...any) {
			if m, ok := data[0].(map[string]any); ok {

				if m["id"] == nil {
					// if m["id"] is nil at this point the client has failed the init process
					// TODO: they are connected on the socket but failed to join, so an error should
					// be sent down to client here
					log.Error().Msg("Failed init")
					printRooms(io, true, players)
					io.Sockets().To(server.Room(id)).Emit("err", "init")

					log.Print("but do I know my name ", m["Name"], " | name: ", players[id].Name, " | rkey: ", m["rkey"])
				}

				if m["rkey"] != rkey && m["id"] != nil {
					if room, ok := m["rkey"].(string); ok {

						// previous room is m["id"]

						clients := io.Sockets().Adapter().FetchSockets(&server.BroadcastOptions{
							Rooms: types.NewSet(server.Room(room)),
						})
						var count int8 = 0
						for _, client := range clients {
							if _, ok := client.(*server.Socket); ok {
								count++
							}
						}
						log.Info().Str("Joining", room).Str("Name", players[id].Name).Int8("Order", count+1).Msg("✈️ ")

						// TODO: find a way to remove old room
						// socket.Leave(server.Room(rkey))
						socket.Join(server.Room(room))
						socket.Leave(server.Room(rkey))
						// io.To(server.Room(rkey)).SocketsLeave(server.Room(rkey))
						rkey = room

						if player, ok := players[id]; ok {
							player.Id = room
							player.Order = count + 1
							players[id] = player
						}

						pSlice := playersInRoom(io, room, players)
						io.Sockets().To(server.Room(rkey)).Emit("join", pSlice)
						// socket.To(server.Room(room)).Emit("join", pSlice)
						// socket.Leave(server.Room(rkey))
					}
				}
			}
		})

		socket.On("disconnect", func(...any) {
			// debug
			if player, ok := players[id]; ok {
				log.Info().Str("Room", rkey).Str("ID", string(socket.Id())).Str("Name", player.Name).Msg("🚪")
			}
			delete(players, id)
		})
	})

	PORT := "80"
	if envPort := os.Getenv("WS_PORT"); envPort != "" {
		PORT = envPort
	}
	httpServer.Listen("localhost:"+PORT, nil)
	log.Trace().Msg("listening at localhost:" + PORT)
	log.Info().Msg("🎧")

	channel := make(chan os.Signal, 1)
	signal.Notify(channel)
	exit := make(chan int)
	go func() {
		for s := range channel {
			switch s {
			case os.Interrupt, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT:
				close(exit)
				return
			}
		}
	}()
	exitCode := <-exit
	httpServer.Close(nil)
	os.Exit(exitCode)
}
