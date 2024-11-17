# Blockopoly - A Blockchain-based Approach to Land Registry

Real Estate is a cornerstone of the global economy, representing a significant portion of wealth and being a major factor in any country’s GDP. Yet, despite being one of the most important sectors, it is still one of the most outdated. The traditional process of land conveyance is cumbersome, slow, and expensive, primarily due to the fragmentation of information across various controlling entities. 
There’s a need to have this data unified in a single shared database that all the relevant parties may access and contribute, but none fully controls. This study explores the potential benefits of using blockchain technology for this purpose and proposes a novel smart contract architecture for a permissioned blockchain network implemented with Hyperledger Besu. 
The presented solution comprises land conveyance and renting functionalities and demonstrates how its application could bring increased efficiency, transparency, and trustworthiness over legacy systems.

---

# Setup Guide

This guide will walk you through the process of setting up and deploying the network for the Blockopoly Master Thesis, using the Hyperledger Besu framework.
Before beginning, it is highly recommended to read the Blockopoly Dissertation files provided at the root of the repository. This will give you a solid understanding of how Besu operates, along with a grasp of the basic concepts that will be frequently mentioned throughout this guide.

---

  ## 1. Prerequisites

To deploy the network you will need the following technologies:  
1. **Unix-based Operating system** or [WSL2.0](https://learn.microsoft.com/en-us/windows/wsl/install) if you are using Windows;
2. **Git** - To manage versions and clone the repository; 
3. **Docker** - Ensure [WSL2.0 engine support](https://docs.docker.com/desktop/wsl/) is enabled if using WSL;
4. **Curl** - Run `sudo apt install curl`
5. **JQ** - Run `sudo apt install jq` or `wget https://github.com/jqlang/jq/releases/download/jq-1.7/jq-1.7.tar.gz` and then `tar -xvf jq-1.7.tar.gz`;
6. **Node** - Run `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash` and `nvm install node`
7. **JDK 17+** - Run `sudo apt install openjdk-17-jdk -y`
8. **Besu Binaries** - Run `wget https://github.com/hyperledger/besu/releases/download/24.3.0/besu-24.3.0.tar.gz` and then `tar -xvf besu-24.3.0.tar.gz`. This will extract the binaries to the current directory.
9. **Tessera Binaries** - Run `wget https://s01.oss.sonatype.org/service/local/repositories/releases/content/net/consensys/quorum/tessera/tessera-dist/24.4.1/tessera-dist-24.4.1.tar` and then `tar -xvf tessera-dist-24.4.1.tar`. This will extract the binaries to the current directory.

Add the following lines to your `.bashrc` or `.bash_profile` file, replacing `yourusername` with your actual username:

```
export PATH=$PATH:~/jq-1.7

export NVM_DIR="/home/yourusername/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

export PATH=$PATH:~/besu-24.3.0/bin
export PATH=$PATH:~/tessera-24.4.1/bin
```
  
Afterwards, clone this repository to your working directory. If using WSL, ensure the directory is within the WSL filesystem.

Install the following node modules globally (using the `-g` flag) or locally inside the *Blockopoly/besu/src* folder, depending on your preference:
```
npm install hardhat
npm install ethers
```

---

  ## 2. Deploying the network
	
Deploying the network with the preconfigured settings for the proposed work is a seamless process, as all necessary commands are encapsulated within scripts provided in the repository. All the files required to boot the network and proceed with the deployment of the smart contracts are located inside *Blockopoly/besu*. A user guide and a detailed explanation of the directory structure can be found in the README.md file at *Blockopoly/besu*.

---

  ## 3. Testing the Network

Blockopoly is an Hardhat project, thus it makes use of the Hardhat testing framework to test the smart contracts. A total of _ unit and integration tests were developed to ensure the correctness of the proposed solution.  

---

  ## 4. Benchmarking

Hyperledger Caliper is a benchmarking tool that allows performance testing of blockchain networks. Inside *Blockopoly/caliper* you will find the necessary files to run the benchmarking tests. It is a requirement that the network is effectively deployed and the smart contracts are instantiated before runing the caliper benchamrks. A user guide and a detailed explanation of the directory structure can be found in the README.md file at *Blockopoly/caliper*. 
  
---
