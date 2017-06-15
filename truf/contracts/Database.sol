pragma solidity ^0.4.7;

import "./Owned.sol";
import "./Product.sol";

contract Database is Owned {

	address[] public products;

	mapping ( address => Product ) productByAddress;

	function Database() {
		//nothing to construct
	}

	function () {
		//no eth to the address
		throw;
	}

	function addProduct(address productAddress) {
		products.push(productAddress);
	}

	function checkProduct(address productAddress) returns (bool) {
		Product product = Product(productAddress);
		return product.check();
	}
	function registerProduct(address productAddress) returns (bool) {
		Product product = Product(productAddress);
		return product.register();
	}
}