
RED='\033[0;31m'
BLUE='\033[0;36m'
NC='\033[0m' 

# Check if besu binary is installed
if ! [ -x "$(command -v besu)" ]; then
  echo -e "${RED}Error: besu is not installed.${NC}" >&2
  exit 1
fi

NODE_COUNT=$(jq '.blockchain.nodes.count' ../config/ibftConfigFile.json)
echo -e "${BLUE}[INFO] Generating cryptographic material for $NODE_COUNT nodes...${NC}"

besu operator generate-blockchain-config --config-file=../config/ibftConfigFile.json --to=../cryptogen --private-key-file-name=key

mkdir ../genesis
mv ../cryptogen/genesis.json ../genesis/genesis.json

counter=0
# iterate over every directory generated
for dir in ../cryptogen/keys/*/ ; do
  # check if the item is a directory
  if [ -d "$dir" ]; then
    mkdir -p "../cryptogen/node$counter"
    mv "$dir" "../cryptogen/node$counter/data" # rename the directory
    cp ../config/permissions_config.toml "../cryptogen/node$counter/data" # copy the permissions file
    ((counter++))
  fi
done

rmdir ../cryptogen/keys

echo -e "${BLUE}[INFO] Done.${NC}"
