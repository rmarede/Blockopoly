#!/bin/bash

# delete docker containers and clean directories
clean() {
    # stop and remove all containers
    docker stop $(docker ps -a -q)

    docker rm $(docker ps -a -f status=exited -q)

    # clean directories
    declare -a dirs=("user-registry" "land-registry" "gov-org" "bank1")

    for dir in "${dirs[@]}"; do
        cd "$dir"
        sudo rm -r msp IssuerPublicKey IssuerRevocationPublicKey ca-cert.pem fabric-ca-server.db
        cd ..
    done

    cd ca-client

    for dir in "${dirs[@]}"; do
        cd "$dir-admin"
        sudo rm -r msp
        cd ..
    done

    cd ..
}

# start CA containers (generates crypto material if absent)
up() {
    declare -a dirs=("user-registry" "land-registry" "gov-org" "bank1")

    for dir in "${dirs[@]}"; do
        cd "$dir"
        docker compose up -d
        cd ..
    done
}

# stop all running docker containers
stop() {
    docker stop $(docker ps -a -q)
}

enroll-ex() {
    export FABRIC_CA_CLIENT_HOME=$PWD/ca-client/user-registry-admin/
    fabric-ca-client enroll -u http://ca-ur-admin:adminpw@0.0.0.0:7054
    fabric-ca-client register --id.name admin-ur --id.secret adminpw --id.type admin -u http://0.0.0.0:7054
    fabric-ca-client register --id.name orderer1-ur --id.secret ordererpw --id.type orderer -u http://0.0.0.0:7054
    fabric-ca-client register --id.name peer1-ur --id.secret peerpw --id.type peer -u http://0.0.0.0:7054
    fabric-ca-client register --id.name user1-ur --id.secret userpw --id.type user -u http://0.0.0.0:7054
    fabric-ca-client register --id.name user2-ur --id.secret userpw --id.type user -u http://0.0.0.0:7054

    export FABRIC_CA_CLIENT_HOME=$PWD/ca-client/land-registry-admin/
    fabric-ca-client enroll -u http://ca-lr-admin:adminpw@0.0.0.0:7055
    fabric-ca-client register --id.name admin-lr --id.secret adminpw --id.type admin -u http://0.0.0.0:7055
    fabric-ca-client register --id.name orderer1-lr --id.secret ordererpw --id.type orderer -u http://0.0.0.0:7055
    fabric-ca-client register --id.name peer1-lr --id.secret peerpw --id.type peer -u http://0.0.0.0:7055

    export FABRIC_CA_CLIENT_HOME=$PWD/ca-client/gov-org-admin/
    fabric-ca-client enroll -u http://ca-gov-admin:adminpw@0.0.0.0:7056
    fabric-ca-client register --id.name admin-gov --id.secret adminpw --id.type admin -u http://0.0.0.0:7056
    fabric-ca-client register --id.name orderer1-gov --id.secret ordererpw --id.type orderer -u http://0.0.0.0:7056
    fabric-ca-client register --id.name peer1-gov --id.secret peerpw --id.type peer -u http://0.0.0.0:7056

    export FABRIC_CA_CLIENT_HOME=$PWD/ca-client/bank1-admin/
    fabric-ca-client enroll -u http://ca-b1-admin:adminpw@0.0.0.0:7057
    fabric-ca-client register --id.name admin-b1 --id.secret adminpw --id.type admin -u http://0.0.0.0:7057
    fabric-ca-client register --id.name peer1-b1 --id.secret peerpw --id.type peer -u http://0.0.0.0:7057
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
    enroll-ex)
        enroll-ex
        ;;
    *)
        echo "Usage: $0 {clean|up|stop|enroll-ex}"
        exit 1
esac
