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
    COMMAND="peer chaincode query -C channel1 -n basic -c '{\"Args\":[\"ClientAccountID\"]}'"
}
    
mint() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{\"function\":\"Mint\",\"Args\":[\"$1\", \"$2\"]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

approve() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{\"function\":\"Approve\",\"Args\":[\"$1\", \"$2\"]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

balance() {
    COMMAND="peer chaincode query -C channel1 -n basic -c '{\"Args\":[\"ClientAccountBalance\"]}'"
}

available() {
    COMMAND="peer chaincode query -C channel1 -n basic -c '{\"Args\":[\"ClientAvailableBalance\"]}'"
}



# first argument determines function to call
case "$1" in
    init)
        init
        ;;
    mint)
        mint $2 $3
        ;;
    getID)
        getID
        ;;
    balance)
        balance
        ;;
    available)
        available
        ;;
    approve)
        approve $2 $3	
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
