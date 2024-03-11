package wallet

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const allowancePrefix = "allowance"

type SmartContract struct {
	contractapi.Contract
}

type Asset struct {
	Alpha int    `json:"Alpha"`
	Beta  string `json:"Beta"`
	ID    string `json:"ID"`
}

/* 	Requirements:
*	apenas o banco do user pode fazer mints de tokens para ele? (ter um sitio com essa informacao)
*	alguem chama isto (banco do user ou banco no geral?)
*	adiciona saldo ao realBalance e ao availableBalance
*
*
 */
func (s *SmartContract) Mint(ctx contractapi.TransactionContextInterface, account string, amount int) error {

	// check minter authorization
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get client MSPID: %v", err)
	} else if clientMSPID != "b1MSP" {
		return fmt.Errorf("client is not authorized to mint new tokens")
	} else if amount <= 0 {
		return fmt.Errorf("mint amount must be a positive integer")
	}

	currentBalance, err := s.ClientAccountBalance(ctx)
	if err != nil {
		return err
	}

	updatedBalance, err := add(currentBalance, amount)
	if err != nil {
		return fmt.Errorf("failed to add balance to account %s : %v || %v", account, err)
	}

	err = ctx.GetStub().PutState(account, []byte(strconv.Itoa(updatedBalance)))
	if err != nil {
		return fmt.Errorf("failed to update account balance %s from world state: %v || %v", account, err)
	}

	// emit mint event
	mintEvent := txEvent{"0x0", account, amount}
	mintEventJSON, err := json.Marshal(mintEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Mint", mintEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}
	log.Printf("Account %s balance updated from %d to %d ", account, currentBalance, updatedBalance)

	return nil
}

func (s *SmartContract) Burn(ctx contractapi.TransactionContextInterface, account string, amount int) error {

	return nil
}

func (s *SmartContract) Transfer(ctx contractapi.TransactionContextInterface, recipient string, amount int) error {

	return nil
}

func (s *SmartContract) BalanceOf(ctx contractapi.TransactionContextInterface, account string) (int, error) {

	return 0, nil
}

func (s *SmartContract) ClientAccountBalance(ctx contractapi.TransactionContextInterface) (int, error) {

	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return 0, fmt.Errorf("failed to get client id: %v", err)
	}

	balanceBytes, err := ctx.GetStub().GetState(clientID)
	if err != nil {
		return 0, fmt.Errorf("failed to read from world state: %v", err)
	} else if balanceBytes == nil {
		return 0, nil
	}

	balance, _ := strconv.Atoi(string(balanceBytes))

	return balance, nil // TODO: available balance
}

func (s *SmartContract) ClientAccountID(ctx contractapi.TransactionContextInterface) (string, error) {

	clientAccountID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return "", fmt.Errorf("failed to get client id: %v", err)
	}

	return clientAccountID, nil
}

func (s *SmartContract) TotalSupply(ctx contractapi.TransactionContextInterface) (int, error) {

	return 0, nil
}

func (s *SmartContract) Approve(ctx contractapi.TransactionContextInterface, spender string, value int) error {

	client, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}

	currentBalance, err := s.ClientAvailableBalance(ctx) // TODO availableBalance
	if err != nil {
		return err
	}

	if value < 0 || value > currentBalance {
		return fmt.Errorf("approval value must be a positive integer and less than or equal to the client's available balance")
	}

	allowanceKey, err := ctx.GetStub().CreateCompositeKey(allowancePrefix, []string{client, spender, ctx.GetStub().GetTxID()})
	if err != nil {
		return fmt.Errorf("failed to create the composite key for prefix %s: %v", allowancePrefix, err)
	}

	err = ctx.GetStub().PutState(allowanceKey, []byte(strconv.Itoa(value)))
	if err != nil {
		return fmt.Errorf("failed to update state of smart contract for key %s: %v", allowanceKey, err)
	}

	approvalEvent := txEvent{client, spender, value}
	approvalEventJSON, err := json.Marshal(approvalEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Approval", approvalEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	log.Printf("client %s approved a withdrawal allowance of %d for spender %s", client, value, spender)

	return nil
}

func (s *SmartContract) allowance(ctx contractapi.TransactionContextInterface, owner string, spender string) (int, error) {

	return 0, nil
}

func (s *SmartContract) transferFrom(ctx contractapi.TransactionContextInterface, from string, to string, value int) error {

	return nil
}

// TODO esta funcao nao é necessaria, pode ser feita do lado do frontend (e aqui ser feita como funcao auxiliar)
func (s *SmartContract) ClientAvailableBalance(ctx contractapi.TransactionContextInterface) (int, error) {

	balance, err := s.ClientAccountBalance(ctx)
	if err != nil {
		return 0, err
	}

	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return 0, fmt.Errorf("failed to get client id: %v", err)
	}

	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey(allowancePrefix, []string{clientID})

	for iterator.HasNext() {
		entry, _ := iterator.Next()

		value, _ := strconv.Atoi(string(entry.Value))

		balance = balance - value // TODO sub?
	}

	return balance, nil
}

// ---------------------------------- Helper Functions

// helper function that transfers tokens from the "from" address to the "to" address (Transfer and TransferFrom)
func transferHelper(ctx contractapi.TransactionContextInterface, from string, to string, value int) error {

	if from == to {
		return fmt.Errorf("cannot transfer to and from same client account")
	}

	if value < 0 { // transfer of 0 is allowed in ERC-20, so just validate against negative amounts
		return fmt.Errorf("transfer amount cannot be negative")
	}

	fromCurrentBalanceBytes, err := ctx.GetStub().GetState(from)
	if err != nil {
		return fmt.Errorf("failed to read client account %s from world state: %v", from, err)
	}

	if fromCurrentBalanceBytes == nil {
		return fmt.Errorf("client account %s has no balance", from)
	}

	fromCurrentBalance, _ := strconv.Atoi(string(fromCurrentBalanceBytes)) // Error handling not needed since Itoa() was used when setting the account balance, guaranteeing it was an integer.

	if fromCurrentBalance < value {
		return fmt.Errorf("client account %s has insufficient funds", from)
	}

	toCurrentBalanceBytes, err := ctx.GetStub().GetState(to)
	if err != nil {
		return fmt.Errorf("failed to read recipient account %s from world state: %v", to, err)
	}

	var toCurrentBalance int
	// If recipient current balance doesn't yet exist, we'll create it with a current balance of 0
	if toCurrentBalanceBytes == nil {
		toCurrentBalance = 0
	} else {
		toCurrentBalance, _ = strconv.Atoi(string(toCurrentBalanceBytes)) // Error handling not needed since Itoa() was used when setting the account balance, guaranteeing it was an integer.
	}

	fromUpdatedBalance, err := sub(fromCurrentBalance, value)
	if err != nil {
		return err
	}

	toUpdatedBalance, err := add(toCurrentBalance, value)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(from, []byte(strconv.Itoa(fromUpdatedBalance)))
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(to, []byte(strconv.Itoa(toUpdatedBalance)))
	if err != nil {
		return err
	}

	log.Printf("client %s balance updated from %d to %d", from, fromCurrentBalance, fromUpdatedBalance)
	log.Printf("recipient %s balance updated from %d to %d", to, toCurrentBalance, toUpdatedBalance)

	return nil
}

// add two number checking for overflow
func add(b int, q int) (int, error) {

	// Check overflow
	var sum int
	sum = q + b

	if (sum < q || sum < b) == (b >= 0 && q >= 0) {
		return 0, fmt.Errorf("Math: addition overflow occurred %d + %d", b, q)
	}

	return sum, nil
}

// sub two number checking for overflow
func sub(b int, q int) (int, error) {

	// sub two number checking
	if q <= 0 {
		return 0, fmt.Errorf("Error: the subtraction number is %d, it should be greater than 0", q)
	}
	if b < q {
		return 0, fmt.Errorf("Error: the number %d is not enough to be subtracted by %d", b, q)
	}
	var diff int
	diff = b - q

	return diff, nil
}
