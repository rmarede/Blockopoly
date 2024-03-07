#!/bin/bash

declare -a orgs
declare -a peers
declare -a orderers
declare -A abrevs
declare -A ports

# Check if Docker is running
docker info > /dev/null 2>&1

# Check the exit status of the previous command
if [ $? -ne 0 ]; then
  echo "[ERROR] Docker is not initialized. Please start Docker and try again."
  exit 1
fi

# delete docker containers and clean crypto material
clean() {
    echo "[INFO] Deleting all existing Docker instances..."
    # stop and remove all containers
    docker stop $(docker ps -a -q)

    docker rm $(docker ps -a -f status=exited -q)

    sudo rm -r organizations channels chaincode/vendor

    for org in "${peers[@]}"; do
        cd "fabric-ca/$org"
        sudo rm -r msp clients IssuerPublicKey IssuerRevocationPublicKey ca-cert.pem fabric-ca-server.db
        cd ../..
    done

    for org in "${orderers[@]}"; do
        cd "fabric-ca/$org"
        sudo rm -r msp clients IssuerPublicKey IssuerRevocationPublicKey ca-cert.pem fabric-ca-server.db
        cd ../..
    done
}

# start CA containers (generates crypto material if absent)
up() {
    echo "[INFO] Generating crypto material for all Certificate Authorities..."

    mkdir organizations
    
    for org in "${orgs[@]}"; do
        mkdir organizations/$org ; mkdir organizations/$org/msp ; mkdir organizations/$org/msp/cacerts
        cp config.yaml organizations/$org/msp/config.yaml

        cd fabric-ca
        docker compose up -d "ca-${abrevs[$org]}"
        cd ..
        # cp "../cryptogen/${abrevs[$org]}-config.yaml" ../organizations/$org/msp/config.yaml
        # cp "../cryptogen/${abrevs[$org]}-config.yaml" ./$org/msp TODO ??
    done
    
}

# stop all running docker containers
stop() {
    docker stop $(docker ps -a -q)
}

# enroll ca-admin for each CA and register an admin, peers and orderers 
register() {
    # --id.type -> role of the identity. four possible types: peer, orderer, admin, and client (used for applications). 
    #              this type must be linked to the relevant NodeOU.
    #              the four roles are mutually exclusive
    # --id.attrs -> https://hyperledger-fabric-ca.readthedocs.io/en/latest/users-guide.html#attribute-based-access-control 

    echo "[INFO] Registering admins, peers and orderers. Enrolling ca-admins..."

    for org in "${peers[@]}"; do
        cp fabric-ca/$org/ca-cert.pem organizations/$org/msp/cacerts/ca-cert.pem
        export FABRIC_CA_CLIENT_HOME=$PWD/fabric-ca/$org/clients/ca-admin-${abrevs[$org]}/
        fabric-ca-client enroll -u "http://ca-${abrevs[$org]}-admin:adminpw@0.0.0.0:${ports[$org]}"
        fabric-ca-client register --id.name "admin-${abrevs[$org]}" --id.secret adminpw --id.type admin -u "http://0.0.0.0:${ports[$org]}" # TODO --id.attrs "hf.Registrar.Roles=client,hf.Registrar.Attributes=*,hf.Revoker=true,hf.GenCRL=true,admin=true:ecert,abac.init=true:ecert"
        fabric-ca-client register --id.name "peer1-${abrevs[$org]}" --id.secret peerpw --id.type peer -u "http://0.0.0.0:${ports[$org]}"
    done
   
    export FABRIC_CA_CLIENT_HOME=$PWD/fabric-ca/user-registry/clients/ca-admin-ur/
    fabric-ca-client register --id.name user1-ur --id.secret userpw --id.type client -u http://0.0.0.0:7054
    fabric-ca-client register --id.name user2-ur --id.secret userpw --id.type client -u http://0.0.0.0:7054
    
    for org in "${orderers[@]}"; do
        cp fabric-ca/$org/ca-cert.pem organizations/$org/msp/cacerts/ca-cert.pem
        export FABRIC_CA_CLIENT_HOME=$PWD/fabric-ca/$org/clients/ca-admin-${abrevs[$org]}/
        fabric-ca-client enroll -u "http://ca-${abrevs[$org]}-admin:adminpw@0.0.0.0:${ports[$org]}"
        fabric-ca-client register --id.name "admin-${abrevs[$org]}" --id.secret adminpw --id.type admin -u "http://0.0.0.0:${ports[$org]}"
        fabric-ca-client register --id.name "orderer1-${abrevs[$org]}" --id.secret ordererpw --id.type orderer -u "http://0.0.0.0:${ports[$org]}"
    done
}

# enrolls peers and orderers, generating their crypto material
enroll() {

    echo "[INFO] Enrolling peers and orderers..."

    for org in "${peers[@]}"; do
        # enroll peer1
        export FABRIC_CA_CLIENT_HOME=$PWD/fabric-ca/$org/clients/peer1-${abrevs[$org]}/
        export FABRIC_CA_CLIENT_MSPDIR=msp
        fabric-ca-client enroll -u "http://peer1-${abrevs[$org]}:peerpw@0.0.0.0:${ports[$org]}"
        # cp "../cryptogen/${abrevs[$org]}-config.yaml" $org/clients/peer1-${abrevs[$org]}/msp/config.yaml # TODO necessario?

        # enroll org's admin, responsible for activities such as installing and instantiating chaincode
        export FABRIC_CA_CLIENT_HOME=$PWD/fabric-ca/$org/clients/admin-${abrevs[$org]}
        export FABRIC_CA_CLIENT_MSPDIR=msp
        fabric-ca-client enroll -u "http://admin-${abrevs[$org]}:adminpw@0.0.0.0:${ports[$org]}"

        # local MSPs need config.yaml file
        cp config.yaml fabric-ca/$org/clients/peer1-${abrevs[$org]}/msp/config.yaml
        cp config.yaml fabric-ca/$org/clients/admin-${abrevs[$org]}/msp/config.yaml

        # rename ca-certs on localMSPs (important because of config.yaml)
        mv fabric-ca/$org/clients/peer1-${abrevs[$org]}/msp/cacerts/0-0-0-0-${ports[$org]}.pem fabric-ca/$org/clients/peer1-${abrevs[$org]}/msp/cacerts/ca-cert.pem
        mv fabric-ca/$org/clients/admin-${abrevs[$org]}/msp/cacerts/0-0-0-0-${ports[$org]}.pem fabric-ca/$org/clients/admin-${abrevs[$org]}/msp/cacerts/ca-cert.pem

    done

    for org in "${orderers[@]}"; do
        # enroll orderer1
        export FABRIC_CA_CLIENT_HOME=$PWD/fabric-ca/$org/clients/orderer1-${abrevs[$org]}/
        export FABRIC_CA_CLIENT_MSPDIR=msp
        fabric-ca-client enroll -u "http://orderer1-${abrevs[$org]}:ordererpw@0.0.0.0:${ports[$org]}"
        # cp "../cryptogen/${abrevs[$org]}-config.yaml" $org/clients/orderer1-${abrevs[$org]}/msp/config.yaml # TODO necessario?

        # enroll org's admin
        export FABRIC_CA_CLIENT_HOME=$PWD/fabric-ca/$org/clients/admin-${abrevs[$org]}
        export FABRIC_CA_CLIENT_MSPDIR=msp
        fabric-ca-client enroll -u "http://admin-${abrevs[$org]}:adminpw@0.0.0.0:${ports[$org]}"

        # local MSPs need config.yaml file
        cp config.yaml fabric-ca/$org/clients/orderer1-${abrevs[$org]}/msp/config.yaml
        cp config.yaml fabric-ca/$org/clients/admin-${abrevs[$org]}/msp/config.yaml

        # rename ca-certs on localMSPs (important because of config.yaml)
        mv fabric-ca/$org/clients/orderer1-${abrevs[$org]}/msp/cacerts/0-0-0-0-${ports[$org]}.pem fabric-ca/$org/clients/orderer1-${abrevs[$org]}/msp/cacerts/ca-cert.pem
        mv fabric-ca/$org/clients/admin-${abrevs[$org]}/msp/cacerts/0-0-0-0-${ports[$org]}.pem fabric-ca/$org/clients/admin-${abrevs[$org]}/msp/cacerts/ca-cert.pem

    done
}

launch-peers() {
    echo "[INFO] Launching peer nodes' Docker contrainers..."
    cd fabric-ca
    for org in "${peers[@]}"; do
        docker compose up -d "peer1-${abrevs[$org]}"
    done
    cd ..
}

launch-orderers() {
    echo "[INFO] Launching ordering nodes' Docker contrainers..."
    cd fabric-ca
    for org in "${orderers[@]}"; do
        docker compose up -d "orderer1-${abrevs[$org]}"
    done
    cd ..
}

launch-cli() {
    echo "[INFO] Launching the CLI Docker contrainer..."
    cd fabric-ca
    docker compose up -d cli
    cd ..
}

# list every registered identity for each CA
list() {
    for org in "${orgs[@]}"; do
        echo "------------------------------------ REGISTERED IDENTITIES IN $org CA"
        export FABRIC_CA_CLIENT_HOME=$PWD/fabric-ca/$org/clients/ca-admin-${abrevs[$org]}/
        fabric-ca-client identity list
        echo " "
    done
}

genesis() {
    echo "[INFO] Generating genesis block of syschannel and configurations for channel1..."
    configtxgen -profile OrgsOrdererGenesis -outputBlock channels/genesisblock -channelID syschannel
    configtxgen -profile OrgsChannel -outputCreateChannelTx channels/channel1.tx -channelID channel1
}

cli() {
    docker exec -it cli bash
}

boot() {
    clean 2> /dev/null
    up
    register
    enroll
    genesis
    launch-peers
    launch-orderers
    launch-cli
}

init() {
    export PATH=$PWD/bin:$PATH
    export FABRIC_CFG_PATH=$PWD/config/

    orgs=("user-registry" "land-registry" "gov-org" "bank1" "ordering-service1") # "ordering-service2")
    peers=("user-registry" "land-registry" "gov-org" "bank1")
    orderers=("ordering-service1") # "ordering-service2")

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

init
# first argument determines function to call
case "$1" in
    clean)
        clean 2> /dev/null
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
    launch-orderers)
        launch-orderers
        ;;
    launch-cli)
        launch-cli
        ;;
    list)
        list
        ;;
    genesis)
        genesis
        ;;
    boot)
        boot
        ;;
    cli)
        cli
        ;;
    *)
        echo "Usage: $0 {boot|clean|up|stop|register|enroll|launch-peers|launch-orderers|launch-cli|list|genesis|cli}"
        exit 1
esac
