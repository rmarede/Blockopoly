package main

import (
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"blockopoly/pakegi"
)

func main() {
	testChaincode, err := contractapi.NewChaincode(&pakegi.SmartContract{})
	if err != nil {
		log.Panicf("Error creating chaincode: %v", err)
	}

	if err := testChaincode.Start(); err != nil {
		log.Panicf("Error starting chaincode: %v", err)
	}
}

