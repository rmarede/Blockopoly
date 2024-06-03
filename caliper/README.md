
## 1. Prerequisites

Install the following node modules globally (using the `-g` flag) or locally inside the *Blockopoly/caliper* folder, depending on your preference:
```
npm install --only=prod @hyperledger/caliper-cli@0.6.0

```

## 2. Directory Structure

Before proceeding, it is important to familiarize yourself with the repository's directory structure to navigate and understand the setup efficiently.

| Folder         | Content                       |
|----------------|-------------------------------|
|compose| Docker Compose files to deploy the benchmarking clients. |
|networks| Files containing information regarding network type, accounts to be used during the benchmark, and the pre-deployed smart contracts. |
|workloads| The benchmarking scenarios to be executed. |
|benchmarks| Files containing benchmarking option such as worker number, workloads to be executed, transaction number and tx/s. |
|scripts | A collection of scripts to automate the process of booting the benchmarking clients and running the benchmarks. |
|connectors| A custom version of Caliper's ethereum connector, modified to fit the solution's requirements. This connector will replace the original one once the benchmarking containers are started. |


## 3. Running the benchmarks

Running the benchmarks is a straightforward process, as the scripts provided automate all the previously manual steps. Start by booting the besu network and deploying the smart contracts (with `./run.sh deploy`), as described in the user guide at *Blockopoly/besu*. 

Then, open a new terminal at *Blockopoly/caliper*. Before running any script, ensure it is executable by modifying its permissions with the *chmod* command, in this case: `chmod +x run.sh`
Then, running the benchmarks is as simple as running the command `./run.sh`.

