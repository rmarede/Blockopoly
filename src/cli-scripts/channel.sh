#!/bin/bash

# ---------------------------------------------------------------------------
#                                  CLI Script
# ---------------------------------------------------------------------------
#           this script is made to be used inside the CLI container

create() {
    peer channel create -c channel1 -f ../channels/channel1.tx -o orderer1-os1:5801 --outputBlock ../channels/channel1.block
}

join() {
    peer channel join -b ../channels/channel1.block
}

# first argument determines function to call
case "$1" in
    create)
        create
        ;;
    join)
        join
        ;;
    *)
        echo "Usage: $0 {create|join}"
        exit 1
esac
