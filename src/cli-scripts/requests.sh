#!/bin/bash

# ---------------------------------------------------------------------------
#                                  CLI Script
# ---------------------------------------------------------------------------
#           this script is made to be used inside the CLI container

init() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{\"function\":\"InitLedger\",\"Args\":[]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}
    
create() {
    COMMAND="peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{\"function\":\"CreateAsset\",\"Args\":[\"$1\", \"$2\", \"$3\"]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701"
}

queryAll() {
    COMMAND="peer chaincode query -C channel1 -n basic -c '{\"Args\":[\"GetAllAssets\"]}'"
}

readAsset() {
    COMMAND="peer chaincode query -C channel1 -n basic -c '{\"Args\":[\"ReadAsset\", "$1"]}'"
}

# first argument determines function to call
case "$1" in
    init)
        init
        ;;
    create)
        create $2 $3 $4
        ;;
    queryAll)
        queryAll
        ;;
    readAsset)
        readAsset $2
        ;;
    *)
        echo "Usage: $0 {init|create|queryAll|readAsset}"
        exit 1
esac

echo "[RUNNING] $COMMAND" 
eval $COMMAND  
