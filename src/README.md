
# Setup Guide

This guide will walk you through the process of setting up and deploying the network for the Blockopoly Master Thesis, using the Hyperledger Fabric framework.
Before beginning, it is highly recommended to read the Blockopoly Dissertation files provided at the root of the repository. This will give you a solid understanding of how Fabric operates, along with a grasp of the basic concepts that will be frequently mentioned throughout this guide.

---

  ## 1. Prerequisites

To deploy the network you will need the following technologies:  
1. **Unix-based Operating system** or **WSL2.0** if you are using Windows;
2. **Git** - To manage versions and clone the repository; 
3. **Docker** - Ensure WSL2.0 engine support is enabled if using WSL;
4. **Curl** - Check curl documentation [here](https://curl.se/download.html) or run `sudo apt install curl`
5. **Go Programming Language** - Check Go documentation [here](https://go.dev/dl/).
  
Clone this repository to your working directory. If using WSL, ensure the directory is within the WSL filesystem.
 Afterwards, you must install Hyperledger Fabric's Docker images. The official install script `install-fabric.sh` is included in this directory. Open a new terminal at *Blockopoly/src* and run the following command:
  	  `chmod +x install-fabric.sh && ./install-fabric.sh docker`

> **ProTip:** The Fabric binaries are already included in the repository, at *Blockopoly/src/bin*. However you can use this install script to re-download them if necessary, by running `./install-fabric.sh binary`. 

---

  ## 2. Folder Structure
  
Before proceeding, it is important to familiarize yourself with the repository's structure to navigate and understand the setup efficiently.

| Folder         | Content                       |
|----------------|-------------------------------|
|bin| Hyperledger Fabric binaries |
|chaincode| The source code for the smart contracts, containing the business logic.|
| cli-scripts | A collection of scripts to be run inside a CLI container, that automate the process of creating the channels and deploying the chaincode.|
|config |Configuration files for peers (*core.yaml*), orderers (*orderer.yaml*) and channels (*configtx.yaml*).|
| fabric-ca | Contains the local MSPs for each of the peers, orderers, admins and CAs, including all the private cryptographic materials. In a production environment, these would be securely distributed across different machines and accessible only to the designated entities. |

After deploying the network, two additional folders will be created:

| Folder         | Content                       |
|----------------|-------------------------------|
|channels| Channel configurations and genesis blocks. |
|organizations| The channel MSP, consisting of public cryptographic material for each of the organizations. In production environment, all of the contents inside this folder should be present in every single peer. The content of this folder is only used in *configtx.yaml*. |

---

  ## 3. Deploying the network
	
Start by opening a terminal at *Blockopoly/src*. Deploying the network with the preconfigured settings for the proposed work is a seamless process, as all necessary commands are encapsulated within scripts provided in the repository. Before running any script, ensure it is executable by modifying its permissions with the *chmod* command, in this case: `chmod +x script.sh`

Then, booting the network is as simple as running one single command: `./script.sh boot`

Behind the scenes, this script will use the configuration files to generate the cryptographic material for each organization's Certificate Authorities (CAs), register and enroll the peers, orderers and admins, create the genesis block and channel configurations, and finally launch Docker containers for each of the peers and orderers. A CLI container will also be deployed, to facilitate the next steps. 
In a production environment, the script's commands would require **individual execution** on each network node.

(UML diagram)

The default network is composed of 4 endorsing organizations - the User Registry (UR), the Land Registry (LR), a Governmental Institution (GOV) and a Bank (B1). In the current version, the Ordering Service is comprised of only one ordering node, belonging to a single ordering organization (OS1). Because of this, there is no consensus algorithm in the current version - the consensus type is set to *solo*. Additionally, TLS is not enabled for the time being, as it would only introduce unnecessary complexity for a development/testing environment. However, enabling TLS is a (fundamental) requirement on a production environment.  

For the final version, we aim to bring TLS and use the Raft consensus algorithm to the network.


<details>
<summary>Adding Organizations</summary>

  ### 3.1. Adding Organizations
 If you wish to add an additional organization to the network ...
</details>

---

  ## 4. Installing the Chaincode

The process of creating the channel and installing the chaincode is similar to the previous one, as we will make use of the scripts provided in the repository, at *Blockopoly/src/cli-scripts*. In a production environment, the scripts' commands would require individual execution on each network node. In the testing environment, the commands can either be run directly on the host machine, or in an auxiliary CLI container. The ... assume ... to be run inside the CLI container, which was already deployed on the previous step.

To access the terminal of this container, run `./script.sh cli`

At the working directory of this container we have access to all the files needed to proceed. 
(TODO directory tree structure)
The *chaincode* folder contains the source code for the smart contracts, which is written in Go. The *scripts* folder contains the scripts that automate the process of creating the channel and deploying the chaincode. The *requests.sh* script is used to interact with the chaincode, and it is the main tool for testing the network.

To seamlessly deploy the chaincode, go inside the *scripts* folder (`cd scripts`) and run the following command: `. script.sh` 
This step will take a few minutes, as it will compile and install the chaincode on every peer and instantiate it on the channel.

You are now ready to interact with the network. The next section will guide you through the process of testing the network. 

You can exit the CLI container by using the shortcut `Ctrl+d` when you are done with the testing. The container will still be running in the background, and you can access it again by running `./script.sh cli` in the host machine's terminal.

---

  ## 5. Testing the Network

Currently, Blockopoly's business logic is still in development, and the chaincode is not yet fully functional. However, the network is already set up and ready to be tested.
You can interact with the network by running the `requests.sh` script, which is located in the *cli-scripts* folder. On the CLI container, this script is available inside the *scripts* folder. It contains a collection of commands that interact with the chaincode, and it is the main tool for testing the network.

Start by initializing the ledger with some initial data. Run the following command: `. requests.sh init`

This command will create an initial set of assets, which can be retrieved by running the following command: `. requests.sh queryAll`

New assets can be created by running the following command: `. requests.sh create <assetID> <owner> <value>`
 

---

  ## 6. Logging and Monitoring (Optional)

At *Blockopoly/src* you can find the *logspout.sh* script, which deploys a Logspout container to monitor the logs of the network's containers. This is an optional step, but it can be useful to monitor the network's activity and debug any issues that may arise.

To deploy the Logspout container, **open a new terminal** at *Blockopoly/src* and run the following command: `./logspout.sh`

---

<details>

<summary>stuff</summary>

## Ignore the following content, it is just a placeholder for now.

## UML diagrams

You can render UML diagrams using [Mermaid](https://mermaidjs.github.io/). For example, this will produce a sequence diagram:

```mermaid
sequenceDiagram
Alice ->> Bob: Hello Bob, how are you?
Bob-->>John: How about you John?
Bob--x Alice: I am good thanks!
Bob-x John: I am good thanks!
Note right of John: Bob thinks a long<br/>long time, so long<br/>that the text does<br/>not fit on a row.

Bob-->Alice: Checking with John...
Alice->John: Yes... John, how are you?
```

And this will produce a flow chart:

```mermaid
graph LR
A[Square Rect] -- Link text --> B((Circle))
A --> C(Round Rect)
B --> D{Rhombus}
C --> D
```
</details>