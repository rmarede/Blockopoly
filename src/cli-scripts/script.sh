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

echo -e "${BLUE}[INFO] Creating channel1 and joining peers...${NC}"

# create channel and join user registry to it
. identity.sh admin ur peer1
. channel.sh create
. channel.sh join

# join land registry to the channel
. identity.sh admin lr peer1
. channel.sh join

# # join gov org to the channel
. identity.sh admin gov peer1
. channel.sh join

# join bank1 to the channel
. identity.sh admin b1 peer1
. channel.sh join

echo -e "${BLUE}[INFO] Packaging chaincode...${NC}"

# package chaincode
. chaincode.sh package

echo -e "${BLUE}[INFO] Installing chaincode on peers...${NC}"

# install chaincode on all peers
. identity.sh admin ur peer1
. chaincode.sh install
. identity.sh admin lr peer1
. chaincode.sh install
. identity.sh admin gov peer1
. chaincode.sh install
. identity.sh admin b1 peer1
. chaincode.sh install

echo -e "${BLUE}[INFO] Approving chaincode for all organizations...${NC}"

# approve chaincode for all orgs
. identity.sh admin ur peer1
. chaincode.sh approve
. identity.sh admin lr peer1
. chaincode.sh approve
. identity.sh admin gov peer1
. chaincode.sh approve
. identity.sh admin b1 peer1
. chaincode.sh approve

echo -e "${BLUE}[INFO] Committing chaincode...${NC}"

. chaincode.sh commit

