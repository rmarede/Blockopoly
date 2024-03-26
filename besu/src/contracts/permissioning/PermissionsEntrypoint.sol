pragma solidity ^0.8.0;

contract PermissionsEntrypoint {

    // TODO : ou se faz uma flag isBooted, com metodos para lhe dar update, ou se verifica se os outros contratos ja foram inicializados
    // atraves de dar pre deploy do serviceResolver (e popular estado inicial) e verificar se os contratos == address(0)
    
    address constant private ENVIRONMENT_CONTROLLER_ADDRESS = 0x0000000000000000000000000000000000001111;

    function transactionAllowed(address _sender, address _target, uint256 _value, uint256 _gasPrice, uint256 _gasLimit, bytes calldata _payload) 
    external view returns (bool) {
        
        //if(getContractAddress(RULES_CONTRACT) == address(0)) {
        //    return true;
        //}

        //return AccountRulesProxy(registry[RULES_CONTRACT]).transactionAllowed(sender, target, value, gasPrice, gasLimit, payload);

        return true;
    }


    function connectionAllowed(string calldata _enodeId, string calldata _ip, uint16 _port) external view returns (bool) {
        //if (!networkBoot){
        //    return true;
        //}
        //return nodeManager.connectionAllowed(_enodeId, _ip, _port);
        return true;
    }
}