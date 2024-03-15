#!/bin/bash

# ---------------------------------------------------------------------------
#                                  CLI Script
# ---------------------------------------------------------------------------
#           this script is made to be used inside the CLI container

# note: create and join channel operations require using the organization admin
#       same goes for installing, approving and committing chaincode on a peer

RED='\033[0;31m'
BLUE='\033[0;36m'
NC='\033[0m' # reset color

declare -a orgss
orgss=("ur" "lr" "gov" "b1") 

declare -a chaincodes
chaincodes=("wallet" "marketplace") 

echo -e "${BLUE}[INFO] Creating channel1 and joining peers...${NC}"

# create channel and join user registry to it
. identity.sh admin ur peer1
. channel.sh create

for org in "${orgss[@]}"; do
    . identity.sh admin $org peer1
    . channel.sh join
done


for cc in "${chaincodes[@]}"; do

    echo -e "${BLUE}[INFO] Packaging chaincode $cc...${NC}"
    . chaincode.sh package $cc

    echo -e "${BLUE}[INFO] Installing chaincode $cc on peers...${NC}"
    for org in "${orgss[@]}"; do
        . identity.sh admin $org peer1
        . chaincode.sh install $cc
    done

    echo -e "${BLUE}[INFO] Approving chaincode $cc for all organizations...${NC}"
    for org in "${orgss[@]}"; do
        . identity.sh admin $org peer1
        . chaincode.sh approve $cc
    done

    echo -e "${BLUE}[INFO] Committing chaincode $cc...${NC}"
    . chaincode.sh commit $cc

done





