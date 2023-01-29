package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/signal"
	"reflect"
	"strings"
	"syscall"
	"time"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"

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
	Name string   `json:"name"`
	Turn bool     `json:"turn"`
	Id   string   `json:"id"`
	Uid  string   `json:"uid"`
	Deck []string `json:"deck"`
}

type Message struct {
	Author string `json:"author"`
	Uid    string `json:"uid"`
	Body   string `json:"body"`
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

func printRooms(io *server.Server) {
	s := make([]string, 0)
	io.Sockets().Adapter().Rooms().Range(func(key, value interface{}) bool {
		s = append(s, fmt.Sprintf("%v", key))
		// sync.Map can return false to interupt iteration
		return true
	})
	log.Info().Strs("Rooms", s).Send()
}

func inRoom(io *server.Server, room string) (s []string) {
	clients := io.Sockets().Adapter().FetchSockets(&server.BroadcastOptions{
		Rooms: types.NewSet[server.Room](server.Room(room)),
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
				keyAppends = append(keyAppends, string(r))
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

// alternative implementation
// https://stackoverflow.com/a/59568072/15428240
// TODO: reflex is slow look for better
func fillStruct(m map[string]interface{}, s interface{}) error {
	structValue := reflect.ValueOf(s).Elem()

	for name, value := range m {
		structFieldValue := structValue.FieldByName(cases.Title(language.Und).String(name))

		if !structFieldValue.IsValid() {
			return fmt.Errorf("No such field: %s in obj", name)
		}

		if !structFieldValue.CanSet() {
			return fmt.Errorf("Cannot set %s field value", name)
		}

		// TODO: handle nil values better
		if value == nil {
			if structFieldValue.Type().Name() == "string" {
				structFieldValue.Set(reflect.ValueOf(""))
			}
			continue
		}

		val := reflect.ValueOf(value)
		if structFieldValue.Type() != val.Type() {
			// TODO: this is another bandaid on a horrible solution.
			// there should be a better way to map variables into struct
			if fmt.Sprintf("%v", structFieldValue.Type()) == "[]string" {
				// log.Print("arrays ", name, ": ", value, " | ", val, " | ", structFieldValue.Type().Name(), " | ", structFieldValue.Type())
				var emptySlice []string // does not allocate 😎
				structFieldValue.Set(reflect.ValueOf(emptySlice))
				continue
			}
			return errors.New("Provided value type didn't match obj field type")
		}
		// log.Print(name, ": ", value, " | ", val)

		structFieldValue.Set(val)
	}
	return nil
}

func printArr(title string, input ...any) {
	for i := range input {
		output, err := json.Marshal(i)
		check(err)
		log.Info().Msg(fmt.Sprintf("%s: %v", title, string(output)))
	}
}

func parsePlayer(input []any) (player Player) {
	if value, ok := input[0].(map[string]interface{}); ok {
		// pointer
		result := &Player{}
		err := fillStruct(value, result)
		check(err)
		return Player{
			Name: result.Name,
			Turn: result.Turn,
			Id:   result.Id,
			Uid:  result.Uid,
			Deck: result.Deck,
		}
	}
	return player
}

func parseMessage(input []any) (message Message) {
	if value, ok := input[0].(map[string]interface{}); ok {
		// pointer
		result := &Message{}
		err := fillStruct(value, result)
		check(err)
		return Message{
			Author: result.Author,
			Uid:    result.Uid,
			Body:   result.Body,
		}
	}
	return message
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
			players[id] = parsePlayer(data)
			log.Info().Str("Room", id).Str("Name", players[id].Name).Msg("👋")
			// TODO: find out how to remove old room
			// socket.Leave(server.Room(id))
			socket.Join(server.Room(rkey))
			io.Sockets().To(server.Room(rkey)).Emit("init", rkey)
		})

		socket.On("run", func(...any) {
		})

		socket.On("chat", func(msg ...any) {
			message := parseMessage(msg)
			socket.Broadcast().To(server.Room(rkey)).Emit("chat", message)
		})

		socket.On("join", func(data ...any) {
			if m, ok := data[0].(map[string]any); ok {

				if m["id"] == nil {
					// if m["id"] is nil at this point the client has failed the init process
					// TODO: they are connected on the socket but failed to join, so an error should
					// be sent down to client here
					log.Error().Msg("Failed init")
				}

				if m["rkey"] != rkey && m["id"] != nil {
					if room, ok := m["rkey"].(string); ok {
						log.Info().Str("Room", fmt.Sprintf("%s ➡️  %s", m["id"], room)).Str("Name", players[id].Name).Msg("✈️ ")

						// socket.Leave(server.Room(rkey))

						socket.Join(server.Room(room))
						rkey = room

						if player, ok := players[id]; ok {
							player.Id = room
							players[id] = player
						}

						// To goes to all clients
						pSlice := playersInRoom(io, room, players)

						socket.To(server.Room(room)).Emit("joined", pSlice)
					}
				}
			}
		})

		socket.On("disconnect", func(...any) {
			// debug
			if player, ok := players[id]; ok {
				log.Info().Str("Room", rkey).Str("Name", player.Name).Msg("🚪")
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
