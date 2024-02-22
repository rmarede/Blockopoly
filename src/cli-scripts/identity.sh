#!/bin/bash

# ---------------------------------------------------------------------------
#                                  CLI Script
# ---------------------------------------------------------------------------
#           this script is made to be used inside the CLI container

declare -a orgs
declare -a peers
declare -a orderers
declare -A abrevs
declare -A directories
declare -A ports

# 
peer1() {
    # TODO apenas permitir orgs que temos como parametro
    init
    export CORE_PEER_ID=peer1-$1
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/hyperledger/fabric/organizations/${directories[$1]}/clients/peer1-$1/msp
    export CORE_PEER_ADDRESS=peer1-$1:${ports[peer1-$1]} 
    export CORE_PEER_LOCALMSPID=${1}MSP
    env-vars
}

admin() {
    init
    export CORE_PEER_ID=admin-$1
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/hyperledger/fabric/organizations/${directories[$1]}/clients/admin-$1/msp
    export CORE_PEER_ADDRESS=$2-$1:${ports[$2-$1]} 
    export CORE_PEER_LOCALMSPID=${1}MSP
    env-vars
}

orderer1() {
    # TODO apenas permitir orgs que temos como parametro
    init
    export CORE_PEER_ID=orderer1-$1
    export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/hyperledger/fabric/organizations/${directories[$1]}/clients/orderer1-$1/msp
    export CORE_PEER_ADDRESS=orderer1-$1:${ports[orderer1-$1]} 
    export CORE_PEER_LOCALMSPID=${1}MSP
    env-vars
}

env-vars() {
    echo CORE_PEER_ID=$CORE_PEER_ID
    echo CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH
    echo CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS
    echo CORE_PEER_LOCALMSPID=$CORE_PEER_LOCALMSPID
}


init() {
    orgs=("user-registry" "land-registry" "gov-org" "bank1" "ordering-service1") # "ordering-service2")
    peers=("user-registry" "land-registry" "gov-org" "bank1")
    orderers=("ordering-service1") # "ordering-service2")

    abrevs[user-registry]="ur"
    abrevs[land-registry]="lr"
    abrevs[gov-org]="gov"
    abrevs[bank1]="b1"
    abrevs[ordering-service1]="os1"
    abrevs[ordering-service2]="os2"

    directories[ur]="user-registry"
    directories[lr]="land-registry"
    directories[gov]="gov-org"
    directories[b1]="bank1"
    directories[os1]="ordering-service1"
    
    # the ports specified for each CA in the respective fabric-ca-server-config.yaml and docker-compose.yml
    ports[ca-ur]=7054
    ports[ca-lr]=7055
    ports[ca-gov]=7056
    ports[ca-b1]=7057
    ports[ca-os1]=7058

    ports[peer1-ur]=5401
    ports[peer1-lr]=5501
    ports[peer1-gov]=5601
    ports[peer1-b1]=5701

    ports[orderer1-os1]=5801
} 

# first argument determines function to call
case "$1" in
    peer1)
        peer1 $2
        ;;
    admin)
        admin $2 $3
        ;;
    orderer1)
        orderer1 $2
        ;;
    *)
        echo "Usage: $0 {peer1 <org> | admin <org> <target_node>}"
        exit 1
esac
