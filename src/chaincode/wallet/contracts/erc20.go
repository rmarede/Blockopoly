package contracts

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"blockopoly/utils"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const allowancePrefix = "allowance"
const totalSupplyKey = "totalSupply"

type WalletContract struct {
	contractapi.Contract
}

func (s *WalletContract) Mint(ctx contractapi.TransactionContextInterface, account string, amount int) error {

	// check minter authorization
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get client MSPID: %v", err)
	} else if clientMSPID != "b1MSP" {
		return fmt.Errorf("client is not authorized to mint new tokens")
	} else if amount <= 0 {
		return fmt.Errorf("mint amount must be a positive integer")
	}

	currentBalance, err := s.BalanceOf(ctx, account)
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

	// UPDATE TOTAL SUPPLY
	totalSupplyBytes, err := ctx.GetStub().GetState(totalSupplyKey)
	if err != nil {
		return fmt.Errorf("failed to retrieve total token supply: %v", err)
	}
	var totalSupply int
	if totalSupplyBytes == nil {
		totalSupply = 0
	} else {
		totalSupply, _ = strconv.Atoi(string(totalSupplyBytes)) // Error handling not needed since Itoa() was used when setting the totalSupply, guaranteeing it was an integer.
	}
	totalSupply, err = add(totalSupply, amount)
	if err != nil {
		return err
	}
	err = ctx.GetStub().PutState(totalSupplyKey, []byte(strconv.Itoa(totalSupply)))
	if err != nil {
		return err
	}

	// emit mint event
	mintEvent := utils.TxEvent{"0x0", account, amount}
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

func (s *WalletContract) Burn(ctx contractapi.TransactionContextInterface, account string, amount int) error {

	return nil
}

func (s *WalletContract) Transfer(ctx contractapi.TransactionContextInterface, recipient string, amount int) error {

	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}

	err = s.transferHelper(ctx, clientID, recipient, amount)
	if err != nil {
		return fmt.Errorf("failed to transfer: %v", err)
	}

	transferEvent := utils.TxEvent{clientID, recipient, amount}
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

func (s *WalletContract) BalanceOf(ctx contractapi.TransactionContextInterface, account string) (int, error) {

	balanceBytes, err := ctx.GetStub().GetState(account)
	if err != nil {
		return 0, fmt.Errorf("failed to read from world state: %v", err)
	} else if balanceBytes == nil {
		return 0, nil
	}

	balance, _ := strconv.Atoi(string(balanceBytes))

	return balance, nil
}

func (s *WalletContract) ClientAccountID(ctx contractapi.TransactionContextInterface) (string, error) {

	clientAccountID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return "", fmt.Errorf("failed to get client id: %v", err)
	}

	return clientAccountID, nil
}

func (s *WalletContract) TotalSupply(ctx contractapi.TransactionContextInterface) (int, error) {

	totalSupplyBytes, err := ctx.GetStub().GetState(totalSupplyKey)
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve total token supply: %v", err)
	}

	var totalSupply int

	if totalSupplyBytes == nil {
		totalSupply = 0
	} else {
		totalSupply, _ = strconv.Atoi(string(totalSupplyBytes))
	}

	log.Printf("TotalSupply: %d tokens", totalSupply)

	return totalSupply, nil
}

func (s *WalletContract) Approve(ctx contractapi.TransactionContextInterface, spender string, value int) error {
	owner, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}

	allowanceKey, err := ctx.GetStub().CreateCompositeKey(allowancePrefix, []string{owner, spender})
	if err != nil {
		return fmt.Errorf("failed to create the composite key for prefix %s: %v", allowancePrefix, err)
	}

	err = ctx.GetStub().PutState(allowanceKey, []byte(strconv.Itoa(value)))
	if err != nil {
		return fmt.Errorf("failed to update state of smart contract for key %s: %v", allowanceKey, err)
	}

	approvalEvent := utils.TxEvent{owner, spender, value}
	approvalEventJSON, err := json.Marshal(approvalEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Approval", approvalEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	log.Printf("client %s approved a withdrawal allowance of %d for spender %s", owner, value, spender)

	return nil
}

func (s *WalletContract) Allowance(ctx contractapi.TransactionContextInterface, owner string, spender string) (int, error) {

	allowanceKey, err := ctx.GetStub().CreateCompositeKey(allowancePrefix, []string{owner, spender})
	if err != nil {
		return 0, fmt.Errorf("failed to create the composite key for prefix %s: %v", allowancePrefix, err)
	}

	// Read the allowance amount from the world state
	allowanceBytes, err := ctx.GetStub().GetState(allowanceKey)
	if err != nil {
		return 0, fmt.Errorf("failed to read allowance for %s from world state: %v", allowanceKey, err)
	}

	var allowance int

	if allowanceBytes == nil {
		allowance = 0
	} else {
		allowance, err = strconv.Atoi(string(allowanceBytes)) // Error handling not needed since Itoa() was used when setting the totalSupply, guaranteeing it was an integer.
	}

	log.Printf("The allowance left for spender %s to withdraw from owner %s: %d", spender, owner, allowance)

	return allowance, nil
}

func (s *WalletContract) TransferFrom(ctx contractapi.TransactionContextInterface, from string, to string, value int) error {

	spender, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client id: %v", err)
	}

	allowanceKey, err := ctx.GetStub().CreateCompositeKey(allowancePrefix, []string{from, spender})
	if err != nil {
		return fmt.Errorf("failed to create the composite key for prefix %s: %v", allowancePrefix, err)
	}

	currentAllowance, err := s.Allowance(ctx, from, spender)
	if err != nil {
		return fmt.Errorf("failed to retrieve allowance: %v", err)
	}

	if currentAllowance < value {
		return fmt.Errorf("spender does not have enough allowance for transfer")
	}

	err = s.transferHelper(ctx, from, to, value)
	if err != nil {
		return fmt.Errorf("failed to transfer: %v", err)
	}

	updatedAllowance, err := sub(currentAllowance, value)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(allowanceKey, []byte(strconv.Itoa(updatedAllowance)))
	if err != nil {
		return err
	}

	// Emit the Transfer event
	transferEvent := utils.TxEvent{from, to, value}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	log.Printf("spender %s allowance updated from %d to %d", spender, currentAllowance, updatedAllowance)

	return nil
}

// ---------------------------------- Helper Functions

// helper function that transfers tokens from the "from" address to the "to" address (Transfer and TransferFrom)
func (s *WalletContract) transferHelper(ctx contractapi.TransactionContextInterface, from string, to string, value int) error {

	if from == to {
		return fmt.Errorf("cannot transfer to and from same client account")
	}

	if value < 0 { // transfer of 0 is allowed in ERC-20, so just validate against negative amounts
		return fmt.Errorf("transfer amount cannot be negative")
	}

	fromCurrentBalance, err := s.BalanceOf(ctx, from)
	if err != nil {
		return err
	} else if fromCurrentBalance < value {
		return fmt.Errorf("client account %s has insufficient funds", from)
	}

	toCurrentBalance, err := s.BalanceOf(ctx, to)
	if err != nil {
		return err
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
