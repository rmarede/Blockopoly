RED='\033[0;31m'
BLUE='\033[0;36m'
NC='\033[0m' 

echo -e "${BLUE}[INFO] Starting $((NODE_COUNT)) nodes...${NC}"

docker-compose -f ../compose/docker-compose-bootnode.yml up -d

NODE_COUNT=$(jq '.blockchain.nodes.count' ../config/ibftConfigFile.json)

for (( i=1; i<$NODE_COUNT; i++ ))
do
  docker-compose -f ../compose/docker-compose-node-$i.yml up -d "besu-node-$i"
done

echo -e "${BLUE}[INFO] Done.${NC}"