#!/bin/sh
cp ./connectors/my-ethereum-connector.js /home/node/.npm-global/lib/node_modules/@hyperledger/caliper-cli/node_modules/@hyperledger/caliper-ethereum/lib/ethereum-connector.js

caliper launch manager --caliper-flow-skip-install