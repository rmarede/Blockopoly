package utils

import (
	"fmt"
	"runtime"
	"strings"
)


func WasCalledBy(funcName string) bool {
	pc := make([]uintptr, 10) 
	runtime.Callers(2, pc)
	frames := runtime.CallersFrames(pc)

	for frame, more := frames.Next(); more; frame, more = frames.Next() {
		if strings.Contains(frame.Function, funcName) {
			return true
		}
	}

	return false
}

func PrintRuntimeStack() bool {
	pc := make([]uintptr, 10) 
	runtime.Callers(2, pc)
	frames := runtime.CallersFrames(pc)

	for frame, more := frames.Next(); more; frame, more = frames.Next() {
		fmt.Printf("[RUNTIME STACK] %s:%d %s\n", frame.File, frame.Line, frame.Function)
	}

	return false
}