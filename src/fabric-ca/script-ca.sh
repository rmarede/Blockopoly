#!/bin/bash

# delete docker containers and clean directories
clean_command() {
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
}

# start CA containers (generates crypto material if absent)
up_command() {
    declare -a dirs=("user-registry" "land-registry" "gov-org" "bank1")

    for dir in "${dirs[@]}"; do
        cd "$dir"
        docker compose up -d
        cd ..
    done
}

# stop all running docker containers
stop_command() {
    docker stop $(docker ps -a -q)
}

# first command line argument determines function to call
case "$1" in
    clean)
        clean_command
        ;;
    up)
        up_command
        ;;
    stop)
        stop_command
        ;;
    *)
        echo "Usage: $0 {clean|up|stop}"
        exit 1
esac
