package contracts

import (
	//"strconv"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type MarketplaceContract struct {
	contractapi.Contract
}

func (s *MarketplaceContract) FunctionPie(ctx contractapi.TransactionContextInterface) error {

	ctx.GetStub().InvokeChaincode("wallet", [][]byte{[]byte("Test")}, "channel1")

	return nil
}
