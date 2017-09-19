//https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#eth-contract
	
var fs = require('fs');

const contract_data = JSON.parse(
	fs.readFileSync('../0.contracts/build/contracts/Products.json')
);
if (typeof(contract_data.abi) !== 'object') {
	throw new Error('not abi');
}

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var manufacturer_address;
var manufacturer_contract;

web3.eth.getAccounts(function(err, accounts) { 
	console.log('Connected to Geth console', accounts[0]);
	manufacturer_address = accounts[0];

	manufacturer_contract = new web3.eth.Contract(contract_data.abi);
	manufacturer_contract.deploy({
		data: contract_data.unlinked_binary,
		arguments: []
	})
	.send({
		from: manufacturer_address,
		gas: 1500000,
		gasPrice: '30000000000000'
	}, function(error, transactionHash){
		
	})
	.on('error', function(error){
		console.log('error', error);
	})
	.on('transactionHash', function(transactionHash){
		console.log('transactionHash', transactionHash);
	})
	.on('receipt', function(receipt){
	   console.log('receipt', receipt.contractAddress);
	})
	.on('confirmation', function(confirmationNumber, receipt){
		console.log('confirmation', confirmationNumber);
	})
	.then(function(new_contract){
		console.log('--deployed--');
		manufacturer_contract.defaultAccount = manufacturer_address;
		manufacturer_contract = new_contract;
		console.log(new_contract.options.address)
		generateKeys();
	});
});

generateKeys = function () {
	var secret_key = web3.utils.randomHex(32);

    console.log('--generating--');
    console.log(secret_key);
    console.log('->');
    manufacturer_contract.methods.getPublicForSecretFor(secret_key).call()
	.then(function (public_key) {
        console.log(public_key);
        saveKey(secret_key, public_key);
    });
}

saveKey = function (secret_key, public_key) {
    console.log('--saving--');
    console.log('->');
    manufacturer_contract.methods.addItem(public_key).send({
		from : manufacturer_address,
		gas: 150000
	})
	.then(function (done) {
        console.log(done);
        console.log('--done--');
		fs.writeFileSync('toPrint.txt', ' secret : ' + secret_key + "\n public : " + public_key);
    });
}

