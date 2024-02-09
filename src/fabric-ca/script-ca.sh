#!/bin/bash

declare -a orgs
declare -a peers
declare -a orderers
declare -A abrevs
declare -A ports

# delete docker containers and clean directories
clean() {
    init

    # stop and remove all containers
    docker stop $(docker ps -a -q)

    docker rm $(docker ps -a -f status=exited -q)

    sudo rm -r ../organizations

    for org in "${peers[@]}"; do
        cd "$org"
        sudo rm -r msp clients IssuerPublicKey IssuerRevocationPublicKey ca-cert.pem fabric-ca-server.db
        cd ..
    done

    for org in "${orderers[@]}"; do
        cd "$org"
        sudo rm -r msp clients IssuerPublicKey IssuerRevocationPublicKey ca-cert.pem fabric-ca-server.db
        cd ..
    done
}

# start CA containers (generates crypto material if absent)
up() {
    init
    mkdir ../organizations
    for org in "${orgs[@]}"; do
        docker compose up -d "ca-${abrevs[$org]}"

        mkdir ../organizations/$org ; mkdir ../organizations/$org/msp ; mkdir ../organizations/$org/msp/cacerts
        cp "../cryptogen/${abrevs[$org]}-config.yaml" ../organizations/$org/msp/config.yaml
        # cp "../cryptogen/${abrevs[$org]}-config.yaml" ./$org/msp TODO ??
    done
}

# stop all running docker containers
stop() {
    docker stop $(docker ps -a -q)
}

# enroll ca-admin for each CA and register an admin, a peer and an orderer for each organization 
register() {
    init

    # register an admin, and a peer for every endorser
    for org in "${peers[@]}"; do
        cp $org/ca-cert.pem ../organizations/$org/msp/cacerts/ca-cert.pem
        export FABRIC_CA_CLIENT_HOME=$PWD/$org/clients/ca-admin-${abrevs[$org]}/
        fabric-ca-client enroll -u "http://ca-${abrevs[$org]}-admin:adminpw@0.0.0.0:${ports[$org]}"
        fabric-ca-client register --id.name "admin-${abrevs[$org]}" --id.secret adminpw --id.type admin -u "http://0.0.0.0:${ports[$org]}"
        fabric-ca-client register --id.name "peer1-${abrevs[$org]}" --id.secret peerpw --id.type peer -u "http://0.0.0.0:${ports[$org]}"
    done

    # register users on the user registry
    export FABRIC_CA_CLIENT_HOME=$PWD/user-registry/clients/ca-admin-ur/
    fabric-ca-client register --id.name user1-ur --id.secret userpw --id.type user -u http://0.0.0.0:7054
    fabric-ca-client register --id.name user2-ur --id.secret userpw --id.type user -u http://0.0.0.0:7054

    # register orderers for each ordering service organization
    for org in "${orderers[@]}"; do
        cp $org/ca-cert.pem ../organizations/$org/msp/cacerts/ca-cert.pem
        export FABRIC_CA_CLIENT_HOME=$PWD/$org/clients/ca-admin-${abrevs[$org]}/
        fabric-ca-client enroll -u "http://ca-${abrevs[$org]}-admin:adminpw@0.0.0.0:${ports[$org]}"
        fabric-ca-client register --id.name "admin-${abrevs[$org]}" --id.secret adminpw --id.type admin -u "http://0.0.0.0:${ports[$org]}"
        fabric-ca-client register --id.name "orderer1-${abrevs[$org]}" --id.secret ordererpw --id.type orderer -u "http://0.0.0.0:${ports[$org]}"
    done
}

# enrolls peers and orderers, generating their crypto material
enroll() {
    init

    for org in "${peers[@]}"; do
        # enroll peer1
        export FABRIC_CA_CLIENT_HOME=$PWD/$org/clients/peer1-${abrevs[$org]}/
        export FABRIC_CA_CLIENT_MSPDIR=msp
        fabric-ca-client enroll -u "http://peer1-${abrevs[$org]}:peerpw@0.0.0.0:${ports[$org]}"
        cp "../cryptogen/${abrevs[$org]}-config.yaml" $org/clients/peer1-${abrevs[$org]}/msp/config.yaml # TODO necessario?

        # enroll org's admin, responsible for activities such as installing and instantiating chaincode
        export FABRIC_CA_CLIENT_HOME=$PWD/$org/clients/admin-${abrevs[$org]}
        export FABRIC_CA_CLIENT_MSPDIR=msp
        fabric-ca-client enroll -u "http://admin-${abrevs[$org]}:adminpw@0.0.0.0:${ports[$org]}"

        mkdir $org/clients/peer1-${abrevs[$org]}/msp/admincerts
        cp $org/clients/admin-${abrevs[$org]}/msp/signcerts/cert.pem "$org/clients/peer1-${abrevs[$org]}/msp/admincerts/${abrevs[$org]}-admin-cert.pem"

    done

    for org in "${orderers[@]}"; do
        # enroll orderer1
        export FABRIC_CA_CLIENT_HOME=$PWD/$org/clients/orderer1-${abrevs[$org]}/
        export FABRIC_CA_CLIENT_MSPDIR=msp
        fabric-ca-client enroll -u "http://orderer1-${abrevs[$org]}:ordererpw@0.0.0.0:${ports[$org]}"
        cp "../cryptogen/${abrevs[$org]}-config.yaml" $org/clients/orderer1-${abrevs[$org]}/msp/config.yaml # TODO necessario?

        # enroll org's admin
        export FABRIC_CA_CLIENT_HOME=$PWD/$org/clients/admin-${abrevs[$org]}
        export FABRIC_CA_CLIENT_MSPDIR=msp
        fabric-ca-client enroll -u "http://admin-${abrevs[$org]}:adminpw@0.0.0.0:${ports[$org]}"

        mkdir $org/clients/orderer1-${abrevs[$org]}/msp/admincerts
        cp $org/clients/admin-${abrevs[$org]}/msp/signcerts/cert.pem "$org/clients/orderer1-${abrevs[$org]}/msp/admincerts/${abrevs[$org]}-admin-cert.pem"

    done
}

launch-peers() {
    init
    for org in "${peers[@]}"; do
        docker compose up -d "peer1-${abrevs[$org]}"
    done
}

launch-orderers() {
    init
    for org in "${orderers[@]}"; do
        docker compose up -d "orderer1-${abrevs[$org]}"
    done
}

# list every registered identity for each CA
list() {
    init

    for org in "${orgs[@]}"; do
        echo "------------------------------------ REGISTERED IDENTITIES IN $org CA"
        export FABRIC_CA_CLIENT_HOME=$PWD/$org/clients/ca-admin-${abrevs[$org]}/
        fabric-ca-client identity list
        echo " "
    done
}

init() {
    orgs=("user-registry" "land-registry" "gov-org" "bank1" "ordering-service1" "ordering-service2")
    peers=("user-registry" "land-registry" "gov-org" "bank1")
    orderers=("ordering-service1" "ordering-service2")

    abrevs[user-registry]="ur"
    abrevs[land-registry]="lr"
    abrevs[gov-org]="gov"
    abrevs[bank1]="b1"
    abrevs[ordering-service1]="os1"
    abrevs[ordering-service2]="os2"
    

    # the ports specified for each CA in the respective fabric-ca-server-config.yaml and docker-compose.yml
    ports[user-registry]=7054
    ports[land-registry]=7055
    ports[gov-org]=7056
    ports[bank1]=7057
    ports[ordering-service1]=7058
    ports[ordering-service2]=7059
} 

# first argument determines function to call
case "$1" in
    clean)
        clean
        ;;
    up)
        up
        ;;
    stop)
        stop
        ;;
    register)
        register
        ;;
    enroll)
        enroll
        ;;
    launch-peers)
        launch-peers
        ;;
    list)
        list
        ;;
    *)
        echo "Usage: $0 {clean|up|stop|register|enroll|launch-peers|list}"
        exit 1
esac
