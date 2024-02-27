# Blockopoly - A Blockchain-based Approach to Land Registry

Real Estate is a cornerstone of the global economy, representing a significant portion of wealth and being a major factor in any country’s GDP. Yet, despite being one of the most important sectors, it is still one of the most outdated. The traditional process of land conveyance is cumbersome, slow, and expensive, primarily due to the fragmentation of information across various controlling entities. 
There’s a need to have this data unified in a single shared database that all the relevant parties may access and contribute, but none fully controls. This study explores the potential benefits of using blockchain technology for this purpose and proposes a novel smart contract architecture for a permissioned blockchain network implemented with Hyperledger Fabric. 
The presented solution comprises land conveyance and renting functionalities and demonstrates how its application could bring increased efficiency, transparency, and trustworthiness over legacy systems.

## 1. Prerequisites

To deploy the network you will need the following technologies:  
1. **Unix-based Operating system** or **WSL2.0** if you are using Windows.
2. **Git** - Check 
3. **Docker** - If you will be using WSL, then don't forget to enable WSL2.0 engine support;
4. **Curl** - Check curl documentation [here](https://curl.se/download.html) or run `sudo apt install curl`
5. **Go Programming Language** - Check Go documentation [here](https://go.dev/dl/) or run:
	  ```
		sudo wget https://go.dev/dl/go1.21.6.linux-amd64.tar.gz	
		sudo tar -C ../../usr/local  -xzf  go1.21.6.linux-amd64.tar.gz
		...
	  ```
  
 This repository must then be cloned to your working directory (if you are using WSL, the directory must be ins the WSL filesystem). 
 Afterwards, you must install Hyperledger Fabric's binaries and Docker image. The install script `install-fabric.sh` is included in this directory. Open a new terminal at *Blockopoly/src* and run the following command:
  	  `chmod +x install-fabric.sh && ./install-fabric.sh docker binary`