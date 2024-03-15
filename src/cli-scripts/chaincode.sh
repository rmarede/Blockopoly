#!/bin/bash

# ---------------------------------------------------------------------------
#                                  CLI Script
# ---------------------------------------------------------------------------
#           this script is made to be used inside the CLI container

package() {
    cd ../chaincode/$1
    go mod tidy
    GO111MODULE=on go mod vendor
    peer lifecycle chaincode package ../$1.tar.gz --path . --lang golang --label $1-1.0
    cd ../../scripts
}

install() {
    peer lifecycle chaincode install ../chaincode/$1.tar.gz
}

approve() { # TODO isto assim nao funciona
    CC_PACKAGE_ID=$1-1.0:$(peer lifecycle chaincode queryinstalled | grep -oP 'Package ID: '$1'-1.0:\K[^,]+')
    export CC_PACKAGE_ID
    echo -e "${BLUE}[INFO] Approving package $CC_PACKAGE_ID...${NC}"
    peer lifecycle chaincode approveformyorg -o orderer1-os1:5801 --channelID channel1 --name $1 --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1
}

commit() {
    peer lifecycle chaincode commit -o orderer1-os1:5801 --channelID channel1 --name $1 --version 1.0 --sequence 1 --peerAddresses peer1-ur:5401 --peerAddresses peer1-lr:5501 --peerAddresses peer1-gov:5601 --peerAddresses peer1-b1:5701
}

check() {
    #peer lifecycle chaincode queryinstalled 
    #peer lifecycle chaincode checkcommitreadiness --channelID channel1 --name $1 --version 1.0 --sequence 1 --output json
    peer lifecycle chaincode querycommitted --channelID channel1 
}

# first argument determines function to call
case "$1" in
    package)
        package $2
        ;;
    install)
        install $2
        ;;
    approve)
        approve $2
        ;;
    commit)
        commit $2
        ;;
    check)
        check
        ;;
    *)
        echo "Usage: $0 {package|install|approve}"
        exit 1
esac
