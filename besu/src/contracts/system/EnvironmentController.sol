pragma solidity ^0.8.0;

// alt names: GlobalStateRegistry, EnvironmentController
// State Machine Pattern? 
contract EnvironmentController {

    mapping(string => string) private _env;

    constructor(string[] memory keys, string[] memory values) {
        require(keys.length == values.length, "EnvironmentController: keys and values length mismatch");

        for (uint256 i = 0; i < keys.length; i++) {
            _env[keys[i]] = values[i];
        }
    }

    function set(string memory key, string memory value) public virtual {
        _env[key] = value;
    }

    function get(string memory key) public view virtual returns (string memory) {
        return _env[key];
    }

}
