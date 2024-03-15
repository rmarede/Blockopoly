package contracts

import (
	"blockopoly/utils"
	"encoding/json"
	"fmt"

	//"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const tokenKey = "token"
const contractAddress = "0x001"

// TODO posso fazer um transferToContract em que se passe quem é que é suposto receber o dinheiro no futuro, e assim
// podia guardar uma allowance (especial, com key diferente para nao se acessivel por fora) de contrato, e fazer uma verificacao extra para maior seguranca
// para ja so ver se o contrato tem dinehiro e transferir

func (s *WalletContract) TransferFromContract(ctx contractapi.TransactionContextInterface, to string, value int) error {

	fmt.Println("token2: %s", tokenKey+ctx.GetStub().GetTxID())
	abytes, err := ctx.GetStub().GetState(tokenKey + ctx.GetStub().GetTxID())
	if err != nil {
		return fmt.Errorf("failed to get state1: %v", err)
	}

	if abytes == nil {
		return fmt.Errorf("failed to get state2: %v", err)
	}

	fmt.Println("[AAA] TransferFromContract: ", string(abytes))

	err = s.transferHelper(ctx, contractAddress, to, value)
	if err != nil {
		return fmt.Errorf("fatal error? : failed to transfer: %v", err)
	}

	// Emit the Transfer event
	transferEvent := utils.TxEvent{contractAddress, to, value}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil
}

func (s *WalletContract) Test(ctx contractapi.TransactionContextInterface) error {

	fmt.Println("[GGGGG] wasInvokedByFunction:", utils.WasCalledBy("FunctionPie"))

	creator, _ := ctx.GetStub().GetCreator()

	fmt.Println("[GGGGG] creator:", string(creator))

	binding, _ := ctx.GetStub().GetBinding()

	fmt.Println("[GGGGG] binding:", string(binding))

	//utils.PrintRuntimeStack()

	return nil
}
