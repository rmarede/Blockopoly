package utils

import (
	"runtime"
	"strings"
)


func wasCalledBy(funcName string) bool {
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