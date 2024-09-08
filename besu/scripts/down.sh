RED='\033[0;31m'
BLUE='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}[INFO] Stopping nodes...${NC}"

docker-compose -f ../compose/docker-compose-bootnode.yml stop

NODE_COUNT=$(jq '.blockchain.nodes.count' ../config/ibftConfigFile.json)

for (( i=1; i<$NODE_COUNT; i++ )); do
  docker-compose -f ../compose/docker-compose-node-$i.yml stop
done

echo -e "${BLUE}[INFO] Done.${NC}"