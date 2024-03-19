RED='\033[0;31m'
BLUE='\033[0;36m'
NC='\033[0m' 

#besu --data-path=cryptogen/node0/data --genesis-file=genesis/genesis.json --permissions-nodes-config-file-enabled --permissions-accounts-config-file-enabled --rpc-http-enabled --rpc-http-api=ADMIN,ETH,NET,PERM,IBFT --host-allowlist="*" --rpc-http-cors-origins="*"

#besu --data-path=cryptogen/node1/data --genesis-file=genesis/genesis.json --permissions-nodes-config-file-enabled --permissions-accounts-config-file-enabled --rpc-http-enabled --rpc-http-api=ADMIN,ETH,NET,PERM,IBFT --host-allowlist="*" --rpc-http-cors-origins="*" --p2p-port=30304 --rpc-http-port=8546

# curl -X POST --data '{"jsonrpc":"2.0","method":"perm_addNodesToAllowlist","params":[["enode://67e61faee5458a3a626627ae0e54c2e9e44f87ac60ba36c85a4595791fab94dffd812cba156cdd65c6c2fbbc3687cf4d49c9731681b8be7a1dc42e0908cd5953@127.0.0.1:30303","enode://0cc6f2b729e81c09773bd1b929d1c963c41f5c384d47768ebc55d822c7a8363d2ea3ec142203aa31a1436473e6ce38ce8e825a58ba68f594b505e5ad2faeaa28@127.0.0.1:30304"]], "id":1}' http://127.0.0.1:8545

# curl -X POST --data '{"jsonrpc":"2.0","method":"admin_addPeer","params":["enode://67e61faee5458a3a626627ae0e54c2e9e44f87ac60ba36c85a4595791fab94dffd812cba156cdd65c6c2fbbc3687cf4d49c9731681b8be7a1dc42e0908cd5953@127.0.0.1:30303"],"id":1}' http://127.0.0.1:8546

# docker compose up -d

if ! docker network ls | grep -q besu_network; then
  docker network create besu_network
fi

echo -e "${BLUE}[INFO] Deploying bootnode besu-node-0...${NC}"
docker-compose -f compose/docker-compose-bootnode.yml up -d

MAX_RETRIES=30 
RETRY_DELAY=3

for ((i=0; i<$MAX_RETRIES; i++)); do
  export ENODE=$(curl -s -X POST --data '{"jsonrpc":"2.0","method":"net_enode","params":[],"id":1}' http://127.0.0.1:8500 | jq -r '.result')

  if [ -n "$ENODE" ] && [ "$ENODE" != "null" ]; then
    break
  else
    echo -e "Fetching ENODE... Retrying in $RETRY_DELAY seconds..."
    sleep $RETRY_DELAY
  fi
done

if [ $i -eq $((MAX_RETRIES - 1)) ] && ([ -z "$ENODE" ] || [ "$ENODE" == "null" ]); then
  echo -e "${RED}[ERROR] Max retries reached. Unable to retrieve ENODE. ${NC}"
fi

echo -e "${BLUE}[SUCCESS] ENODE: $ENODE ${NC}"

# Replace bootnode enode's localhost address with the docker besu-node-0 container's address
export E_ADDRESS="${ENODE#enode://}"
echo "E_ADDRESS: $E_ADDRESS"
export DOCKER_NODE_1_ADDRESS=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' besu-node-0)
echo "DOCKER_NODE_1_ADDRESS: $DOCKER_NODE_1_ADDRESS"
export E_ADDRESS=$(echo $E_ADDRESS | sed -e "s/127.0.0.1/$DOCKER_NODE_1_ADDRESS/g")
echo "E_ADDRESS: $E_ADDRESS"

sed "s/<ENODE>/enode:\/\/$E_ADDRESS/g" compose/templates/docker-compose.yml > compose/docker-compose-nodes.yml


NODE_COUNT=$(jq '.blockchain.nodes.count' config/ibftConfigFile.json)

echo -e "${BLUE}[INFO] Deploying remaining $((NODE_COUNT-1)) nodes...${NC}"

for (( i=1; i<$NODE_COUNT; i++ ))
do
  docker-compose -f compose/docker-compose-nodes.yml up -d "besu-node-$i"
done
