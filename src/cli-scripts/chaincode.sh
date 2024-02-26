#!/bin/bash

# ---------------------------------------------------------------------------
#                                  CLI Script
# ---------------------------------------------------------------------------
#           this script is made to be used inside the CLI container

package() {
    cd ../chaincode
    go mod tidy
    GO111MODULE=on go mod vendor
    peer lifecycle chaincode package ../basic.tar.gz --path . --lang golang --label basic_1.0
    cd ../scripts
}

install() {
    peer lifecycle chaincode install ../basic.tar.gz
}

approve() {
    CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep -oP 'Package ID: \K[^,]+')
    export CC_PACKAGE_ID
    peer lifecycle chaincode approveformyorg -o orderer1-os1:5801 --channelID channel1 --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1
}

commit() {
    peer lifecycle chaincode commit -o orderer1-os1:5801 --channelID channel1 --name basic --version 1.0 --sequence 1 --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701
}

check() {
    peer lifecycle chaincode queryinstalled 
    peer lifecycle chaincode checkcommitreadiness --channelID channel1 --name basic --version 1.0 --sequence 1 --output json
    peer lifecycle chaincode querycommitted --channelID channel1 --name basic
}

# first argument determines function to call
case "$1" in
    package)
        package
        ;;
    install)
        install
        ;;
    approve)
        approve
        ;;
    commit)
        commit
        ;;
    *)
        echo "Usage: $0 {package|install|approve}"
        exit 1
esac
