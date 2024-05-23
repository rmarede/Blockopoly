RED='\033[0;31m'
BLUE='\033[0;36m'
NC='\033[0m' 

#besu --data-path=cryptogen/node0/data --genesis-file=genesis/genesis.json --permissions-nodes-config-file-enabled --permissions-accounts-config-file-enabled --rpc-http-enabled --rpc-http-api=ADMIN,ETH,NET,PERM,IBFT --host-allowlist="*" --rpc-http-cors-origins="*"

#besu --data-path=cryptogen/node1/data --genesis-file=genesis/genesis.json --permissions-nodes-config-file-enabled --permissions-accounts-config-file-enabled --rpc-http-enabled --rpc-http-api=ADMIN,ETH,NET,PERM,IBFT --host-allowlist="*" --rpc-http-cors-origins="*" --p2p-port=30304 --rpc-http-port=8546

# curl -X POST --data '{"jsonrpc":"2.0","method":"perm_addNodesToAllowlist","params":[["enode://67e61faee5458a3a626627ae0e54c2e9e44f87ac60ba36c85a4595791fab94dffd812cba156cdd65c6c2fbbc3687cf4d49c9731681b8be7a1dc42e0908cd5953@127.0.0.1:30303","enode://0cc6f2b729e81c09773bd1b929d1c963c41f5c384d47768ebc55d822c7a8363d2ea3ec142203aa31a1436473e6ce38ce8e825a58ba68f594b505e5ad2faeaa28@127.0.0.1:30304"]], "id":1}' http://127.0.0.1:8545

# curl -X POST --data '{"jsonrpc":"2.0","method":"admin_addPeer","params":["enode://67e61faee5458a3a626627ae0e54c2e9e44f87ac60ba36c85a4595791fab94dffd812cba156cdd65c6c2fbbc3687cf4d49c9731681b8be7a1dc42e0908cd5953@127.0.0.1:30303"],"id":1}' http://127.0.0.1:8546

# TODO In each Tessera directory, start tessera node:
# tessera -configfile tessera.conf

if ! docker network ls | grep -q besu_network; then
  docker network create besu_network
fi

echo -e "${BLUE}[INFO] Deploying bootnode besu-node-0...${NC}"
docker-compose -f ../compose/docker-compose-bootnode.yml up -d

echo -e "${BLUE}[INFO] Fetching bootnode ENODE address. Please wait...${NC}"
. fetch-enodeid.sh 0

export ENODE=$(head -n 1 "../cryptogen/enodeIds.txt")

for (( i=1; i<$NODE_COUNT; i++ )); do
  cp ../compose/templates/docker-compose.yml ../compose/docker-compose-node-$i.yml
  # Replace bootnode enode's localhost address with the docker besu-node-0 container's address
  export E_ADDRESS="${ENODE#enode://}"
  echo "e_address: $E_ADDRESS"
  export DOCKER_NODE_0_ADDRESS=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' besu-node-0)
  echo "docker_node_address: $DOCKER_NODE_0_ADDRESS"
  export E_ADDRESS=$(echo $E_ADDRESS | sed -e "s/127.0.0.1/$DOCKER_NODE_0_ADDRESS/g")
  echo "FINAL E_ADDRESS: $E_ADDRESS"
  sed -i "s/<ENODE>/enode:\/\/$E_ADDRESS/g" ../compose/docker-compose-node-$i.yml
  sed -i 's/<NODENUM>/'$i'/g' ../compose/docker-compose-node-$i.yml
done

NODE_COUNT=$(jq '.blockchain.nodes.count' ../config/ibftConfigFile.json)

echo -e "${BLUE}[INFO] Deploying remaining $((NODE_COUNT-1)) nodes...${NC}"

for (( i=1; i<$NODE_COUNT; i++ ))
do
  docker-compose -f ../compose/docker-compose-node-$i.yml up -d "besu-node-$i"
done

echo -e "${BLUE}[INFO] Fetching ENODE addresses from remaining $((NODE_COUNT-1)) nodes. Please wait...${NC}"
for (( i=1; i<$NODE_COUNT; i++ )); do
  . fetch-enodeid.sh $i
done
