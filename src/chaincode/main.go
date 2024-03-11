package main

import (
	"log"

	"blockopoly/wallet"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	cc, err := contractapi.NewChaincode(&wallet.SmartContract{})
	if err != nil {
		log.Panicf("Error creating chaincode: %v", err)
	}

	if err := cc.Start(); err != nil {
		log.Panicf("Error starting chaincode: %v", err)
	}

	/* nao da para ter mais que um chaincode instanciado
	testChaincodee, err := contractapi.NewChaincode(&wallets.SmartContractt{})
	if err != nil {
		log.Panicf("Error creating chaincode: %v", err)
	}

	if err := testChaincodee.Start(); err != nil {
		log.Panicf("Error starting chaincode: %v", err)
	}*/
}
