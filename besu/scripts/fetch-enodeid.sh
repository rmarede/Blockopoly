RED='\033[0;31m'
BLUE='\033[0;36m'
NC='\033[0m' 

if [ "$#" -lt 1 ]; then
    echo -e "${RED}[ERROR] You must specify which node to fetch enodeID from.${NC}"
    exit 1
fi

MAX_RETRIES=30 

FILE=../cryptogen/enodeIds.txt
if [ ! -f "$FILE" ]; then
    touch "$FILE"
fi

echo -e "${BLUE}[INFO] Querying http://127.0.0.1:850$1...${NC}"
for ((j=0; j<$MAX_RETRIES; j++)); do
    export ENODE=$(curl -s -X POST --data '{"jsonrpc":"2.0","method":"net_enode","params":[],"id":1}' http://127.0.0.1:850$1 | jq -r '.result')
    if [ -n "$ENODE" ] && [ "$ENODE" != "null" ]; then
        echo "$ENODE" >> ../cryptogen/enodeIds.txt
        break
    else
        sleep 3
    fi
done

if [ $j -eq $((MAX_RETRIES - 1)) ] && ([ -z "$ENODE" ] || [ "$ENODE" == "null" ]); then
  echo -e "${RED}[ERROR] Max retries reached. Unable to retrieve ENODE. ${NC}"
    exit 1
fi
echo -e "enodeID: $ENODE"