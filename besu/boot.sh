RED='\033[0;31m'
BLUE='\033[0;36m'
NC='\033[0m' 

echo -e "${BLUE}"
cat << "EOF"
  ____  _            _                     _       
 |  _ \| |          | |                   | |      
 | |_) | | ___   ___| | _____  _ __   ___ | |_   _ 
 |  _ <| |/ _ \ / __| |/ / _ \| '_ \ / _ \| | | | |
 | |_) | | (_) | (__|   < (_) | |_) | (_) | | |_| |
 |____/|_|\___/ \___|_|\_\___/| .__/ \___/|_|\__, |
                              | |             __/ |
                              |_|            |___/ 
EOF
echo -e "${NC}"

case $1 in
  "clean")
      cd scripts
      . clean.sh
      cd ..
      ;;
  "up")
      cd scripts
      . clean.sh
      . cryptogen.sh
      . up.sh
      cd ..
      ;;
  "deploy")
      cd scripts
      . clean.sh
      . cryptogen.sh
      . up.sh
      . deploy.sh
      cd ..
      ;;
  "populate")
      cd scripts
      . clean.sh
      . cryptogen.sh
      . up.sh
      . deploy.sh
      cd ../src/scripts
      node populate-cns.js
      # node populate-state.js
      # node boot-permissioning.js
      # cd ../..
      ;;
  *)
      echo "Invalid command. Usage: . boot.sh <clean|up|deploy|populate>"
      ;;
esac
