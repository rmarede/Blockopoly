#!/bin/bash

# ---------------------------------------------------------------------------
#                                  CLI Script
# ---------------------------------------------------------------------------
#           this script is made to be used inside the CLI container

test() {
    peer chaincode invoke -o orderer1-os1:5801 -C channel1 -n basic -c '{"function":"InitLedger","Args":[]}' --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701
}

test2() {
    peer chaincode query -C channel1 -n basic -c '{"Args":["ReadAsset", "asset1"]}'
}

# first argument determines function to call
case "$1" in
    test)
        test
        ;;
    test2)
        test2
        ;;
    *)
        echo "Usage: $0 {p}"
        exit 1
esac
