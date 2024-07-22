RED='\033[0;31m'
BLUE='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m' 

echo -e "${GREEN}"
cat << "EOF"
  ____  _            _                     _       
 |  _ \| |          | |                   | |      
 | |_) | | ___   ___| | _____  _ __   ___ | |_   _ 
 |  _ <| |/ _ \ / __| |/ / _ \| '_ \ / _ \| | | | |
 | |_) | | (_) | (__|   < (_) | |_) | (_) | | |_| |
 |____/|_|\___/ \___|_|\_\___/| .__/ \___/|_|\__, |
                              | |             __/ |
                              |_|            |___/ 
                              
---------------------------------------------------

         |   |
       __|   |__
      |_   _   _|  BENCHMARKING WITH CALIPER
        \ | | /
         \| |/
          ' '
EOF
echo -e "${NC}"

echo -e "${GREEN}[INFO] Updating contract definition files...  ${NC}"
node scripts/update-contract-definitions.js

echo -e "${GREEN}[INFO] Launching benchmark containers...  ${NC}"
cd compose
docker compose up
cd ..

#npx caliper launch manager \
#    --caliper-bind-sut besu:1.4 \
#    --caliper-workspace . \
#    --caliper-benchconfig benchmarks/benchmark1.yaml \
#    --caliper-networkconfig networks/network-config.json