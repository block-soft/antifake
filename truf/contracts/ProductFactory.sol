pragma solidity ^0.4.7;

import "./Product.sol";
import "./Database.sol";

contract ProductFactory {

	address public DATABASE_CONTRACT;

	function ProductFactory() {
		//nothing to construct
	}

	function() {
		//no eth to the address
		throw;
	}

	function createProduct(bytes32 _title, address DATABASE_CONTRACT) returns (address) {
		return new Product(_title, DATABASE_CONTRACT);
	}
}