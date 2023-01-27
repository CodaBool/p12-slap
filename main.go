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

	"github.com/google/uuid"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"

	debugger "github.com/zishang520/engine.io/log"
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

type Player struct {
	Name string   `json:"name"`
	Turn bool     `json:"turn"`
	Id   string   `json:"id"`
	Uid  string   `json:"uid"`
	Deck []string `json:"deck"`
}

func check(err error) {
	if err != nil {
		log.Fatal().Err(err).Msg("")
	}
}

func typeof(v interface{}) string {
	return fmt.Sprintf("%T", v)
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

func debug(io *server.Server) {
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
				if value == nil {
					// log.Print("  The room ", r, " is not present and is being deleted")
					delete(rooms, r)
				}
			}
			printUpdate = true
		}

		if printUpdate {
			keyAppends := make([]string, 0)
			for r := range rooms {
				keyAppends = append(keyAppends, fmt.Sprintf("%v", r))
			}
			log.Print("Connected: ", connected, " | Rooms: ", keyAppends)
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

func FillStruct(m map[string]interface{}, s interface{}) error {
	structValue := reflect.ValueOf(s).Elem()

	for name, value := range m {
		// structFieldValue := structValue.FieldByName(cases.Title(language.Und))
		structFieldValue := structValue.FieldByName(cases.Title(language.Und).String(name))

		if !structFieldValue.IsValid() {
			return fmt.Errorf("No such field: %s in obj", name)
		}

		if !structFieldValue.CanSet() {
			return fmt.Errorf("Cannot set %s field value", name)
		}

		val := reflect.ValueOf(value)
		if structFieldValue.Type() != val.Type() {
			return errors.New("Provided value type didn't match obj field type")
		}

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
		result := &Player{}
		err := FillStruct(value, result)
		check(err)
		return *result
	}
	return player
}

// needs to be capital first letter for JSON print to show it 🤷

func main() {
	// allocate 100 initial players in memory
	m := make(map[string]Player, 100)

	httpServer := types.CreateServer(nil)
	config := server.DefaultServerOptions()
	config.SetCors(&types.Cors{Origin: "*"})
	io := server.NewServer(httpServer, config)

	// debug
	debugger.DEBUG = true
	debugLogger()
	go debug(io)
	// types.NewStringBufferString("xxx")

	io.On("connection", func(clients ...any) {
		// client methods
		// https://github.com/zishang520/socket.io/blob/main/socket/socket.go#L45
		socket := clients[0].(*server.Socket)
		log.Info().Str("ID", string(socket.Id())).Msg("+")

		socket.On("init", func(data ...any) {
			player := parsePlayer(data)
			// print("Id", socket.Id())
			// socket.To(server.Room(socket.Id())).Emit("init", socket.Id())
			// socket.Leave(server.Room(socket.Id()))
			// socket.Join("baby")
			// log.Print("left ", socket.Id(), " & joined baby")

			m[string(socket.Id())] = player

			print("m", m)
			printRooms(io)
		})

		socket.On("run", func(...any) {
			id := uuid.New()
			log.Print("i have to use this somewhere", m, id)
			// socket.Join("baby")
			// socket.To("baby").Emit("wow")
			// socket.Leave("baby")
		})

		socket.On("disconnect", func(...any) {
			// print("player", m[id.String()])
			log.Info().Str("ID", string(socket.Id())).Msg("-")
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
