package utils

var counter int = 0

func GetActorID() (id int) {
   id = counter
   counter++
   return
}