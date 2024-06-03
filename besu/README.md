

## 1. Directory Structure
  
Before proceeding, it is important to familiarize yourself with the repository's directory structure to navigate and understand the setup efficiently.

| Folder         | Content                       |
|----------------|-------------------------------|
|src| The source code for the smart contracts, containing the business logic. Additionally, contains tests and configuration files to deploy them using Hardhat. |
|compose| Docker Compose files to deploy the network nodes. |
|scripts | A collection of scripts to automate the process of booting the network and deploying the smart contracts. |
|config |Network configuration files regarding the consensus algorithm and initial settings. |

After deploying the network, two additional folders will be created:

| Folder         | Content                       |
|----------------|-------------------------------|
|cryptogen| Contains the cryptographic material for each of the network's nodes. In production environment, all of the contents inside this folder should be present in every single peer. |
|genesis| The genesis block. |

---

  ## 2. Deploying the network
	
Deploying the network with the preconfigured settings for the proposed work is a seamless process, as all necessary commands are encapsulated within scripts provided in the repository. Start by opening a terminal at *Blockopoly/besu*. Before running any script, ensure it is executable by modifying its permissions with the *chmod* command, in this case: `chmod +x run.sh`

Then, booting the network is as simple as running the command `./run.sh <option>` with the desired option:

| Option         | Content                       |
|----------------|-------------------------------|
|clean| Cleans the network, removing all containers, volumes, and files generated. |
|boot| Boots the network, generating the cryptographic material, creating the genesis block, and launching the Docker containers for each peer. |
|deloy| Boots the network and deploys the smart contracts. |
|populate| Boots the network, deploys the smart contracts and populate them with some initial data. |
|permissions| ... |

The default network configuration is set to run with 3 nodes, using *IBFT* as the consensus algorithm. This can be modified by changing the *ibftConfigFile.json* file at *Blockopoly/besu/config*.

  ## 3. Testing the Network

Blockopoly is an Hardhat project, thus it makes use of the Hardhat testing framework to test the smart contracts. The tests are located at *Blockopoly/besu/src/test* and can be run without booting the network, by executing the following command at *Blockopoly/besu/src*: `npx hardhat test`.
A total of _ unit and integration tests were developed to ensure the correctness of the proposed solution.  

  ## 4. Logging and Monitoring (Optional)

At *Blockopoly/besu/scripts* you can find the *logspout.sh* script, which deploys a Logspout container to monitor the logs of the network's containers. This is an optional step, but it can be useful to monitor the network's activity and debug any issues that may arise.

To deploy the Logspout container, **open a new terminal** at *Blockopoly/besu/scripts* and run the following command: `./logspout.sh`

