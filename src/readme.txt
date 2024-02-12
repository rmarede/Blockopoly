Folders:

bin - fabric binaries

config - configuration files for peers (core.yaml), orderers (orderer.yaml) and channels (configtx.yaml)

fabric-ca - local peer MSP, contains private cryptografic materials

organizations - public channel msp, only used in configtx.yaml

config.yaml - specifies public organization OU configurations (node types inside org)

compose - container configurations for deploying the peers, orderers and CAs

scripts - set of scripts to be run inside the CLI container, to interact with the network

script-ca.sh - script that automates network deployment