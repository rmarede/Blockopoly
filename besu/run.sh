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
    "boot")
        cd scripts
        . clean.sh
        . cryptogen.sh
        . create.sh
        cd ..
        ;;
    "down")
        cd scripts
        . down.sh
        cd ..
        ;;
    "up")
        cd scripts
        . up.sh
        cd ..
        ;;
    "deploy")
        cd scripts
        . clean.sh
        . cryptogen.sh
        . create.sh
        . deploy.sh
        cd ../src/scripts
        echo 'n' | node populate-cns.js
        cd ../..
        ;;
    "populate")
        cd scripts
        . clean.sh
        . cryptogen.sh
        . create.sh
        . deploy.sh
        cd ../src/scripts
        echo 'n' | node populate-cns.js
        echo 'n' | node populate-state.js
        cd ../..
        ;;
    "prod")
        cd scripts
        . clean.sh
        . cryptogen.sh
        . create.sh
        . deploy.sh --deploy-permissioning
        cd ../src/scripts
        echo 'y' | node populate-cns.js
        echo 'y' | node populate-state.js
        node boot-permissioning.js
        cd ../..
        ;;
    *)
        echo "Invalid command. Usage: . boot.sh <clean|boot|deploy|populate|prod>"
        ;;
esac
