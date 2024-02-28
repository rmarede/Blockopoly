#!/bin/bash

# ---------------------------------------------------------------------------
#                                  CLI Script
# ---------------------------------------------------------------------------
#           this script is made to be used inside the CLI container

# note: create and join channel operations require using the organization admin
#       same goes for installing, approving and committing chaincode on a peer

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

# package chaincode
. chaincode.sh package

# install chaincode on all peers
. identity.sh admin ur peer1
. chaincode.sh install
. identity.sh admin lr peer1
. chaincode.sh install
. identity.sh admin gov peer1
. chaincode.sh install
. identity.sh admin b1 peer1
. chaincode.sh install

# approve chaincode for all orgs
. identity.sh admin ur peer1
. chaincode.sh approve
. identity.sh admin lr peer1
. chaincode.sh approve
. identity.sh admin gov peer1
. chaincode.sh approve
. identity.sh admin b1 peer1
. chaincode.sh approve

. chaincode.sh commit

