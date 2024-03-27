pragma solidity ^0.8.0;

// alt names: GlobalStateRegistry, EnvironmentController
// State Machine Pattern? 
contract EnvironmentController {

    mapping(string => string) private env;

    enum Mode { Active, Paused, Dev }
    Mode private mode = Mode.Dev; 

    constructor(string[] memory _keys, string[] memory _values) {
        require(_keys.length == _values.length, "EnvironmentController: keys and values length mismatch");

        for (uint256 i = 0; i < _keys.length; i++) {
            env[_keys[i]] = _values[i];
        }
    }

    function set(string memory _key, string memory _value) public virtual {
        env[_key] = _value;
    }

    function get(string memory _key) public view virtual returns (string memory) {
        return env[_key];
    }

    function getMode() public view virtual returns (Mode) {
        return mode;
    }

    function setMode(Mode _mode) public virtual {
        mode = _mode;
    }

}
