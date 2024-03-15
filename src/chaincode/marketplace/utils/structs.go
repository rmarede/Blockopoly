package utils

type Event struct {
	From  string `json:"from"`
	To    string `json:"to"`
	Value int    `json:"value"`
}
