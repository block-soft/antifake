pragma solidity ^0.4.7;


import "./Database.sol";


contract Product {

	address public DATABASE_CONTRACT;


	bytes32 public title;
	bool public registered;

	function Product(bytes32 _title, address _DATABASE_CONTRACT) {
		title = _title;
		registered = true;

		DATABASE_CONTRACT = _DATABASE_CONTRACT;
		Database database = Database(DATABASE_CONTRACT);
		database.addProduct(this);
	}

	function check() constant returns (bool) {
		return false;
	}

	function register() constant returns (bool) {
		return false;
	}
}