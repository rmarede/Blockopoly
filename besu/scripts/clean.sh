
RED='\033[0;31m'
BLUE='\033[0;36m'
NC='\033[0m' 

echo -e "${BLUE}[INFO] Deleting all existing Docker instances...${NC}"
# stop and remove all containers
docker stop $(docker ps -a -q) 2> /dev/null

docker rm $(docker ps -a -f status=exited -q) 2> /dev/null

echo -e "${BLUE}[INFO] Cleaning project directories and cryptographic material...${NC}"

sudo rm -r ../cryptogen ../genesis ../compose/docker-compose-nodes.yml 2> /dev/null

sudo rm -r ../src/ignition/deployments 2> /dev/null

echo -e "${BLUE}[INFO] Done.${NC}"