#!/bin/bash

# ---------------------------------------------------------------------------
#                                  CLI Script
# ---------------------------------------------------------------------------
#           this script is made to be used inside the CLI container

RED='\033[0;31m'
BLUE='\033[0;36m'
NC='\033[0m' # reset color

init() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{\"function\":\"InitLedger\",\"Args\":[]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

getID() {
    COMMAND="peer chaincode query -C channel1 -n wallet -c '{\"Args\":[\"ClientAccountID\"]}'"
}
    
mint() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{\"function\":\"Mint\",\"Args\":[\"$1\", \"$2\"]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

transfer() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{\"function\":\"Transfer\",\"Args\":[\"$1\", \"$2\"]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

approve() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{\"function\":\"Approve\",\"Args\":[\"$1\", \"$2\"]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

balance() {
    COMMAND="peer chaincode query -C channel1 -n basic -c '{\"Args\":[\"BalanceOf\",\"$1\"]}'"
}

available() {
    COMMAND="peer chaincode query -C channel1 -n basic -c '{\"Args\":[\"ClientAvailableBalance\"]}'"
}

accept() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{\"function\":\"MarketplaceContract:AcceptBid\",\"Args\":[\"asd\"]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

helppp() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{\"function\":\"MarketplaceContract:Help\",\"Args\":[]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

ex() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{\"function\":\"MarketplaceContract:Example\",\"Args\":[\"mike\", \"Armikgs\"]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

pie() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n marketplace -c '{\"function\":\"FunctionPie\",\"Args\":[]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

test() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n wallet -c '{\"function\":\"Test\",\"Args\":[]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

# first argument determines function to call
case "$1" in
    init)
        init
        ;;
    mint)
        mint $2 $3
        ;;
    transfer)
        transfer $2 $3
        ;;
    getID)
        getID
        ;;
    balance)
        balance $2
        ;;
    available)
        available
        ;;
    approve)
        approve $2 $3	
        ;;
    accept)
        accept	
        ;;
    test)
        test	
        ;;
    pie)
        pie	
        ;;
    help)
        echo -e "${RED}Usage: $0 {init|mint|getID|balance}${NC}"
        exit 1
        ;;
    *)
        help
esac

echo -e "${BLUE}[RUNNING] $COMMAND${NC}" 
eval $COMMAND  
