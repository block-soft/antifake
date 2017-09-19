//https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#eth-contract
	
var fs = require('fs');

const contract_data = JSON.parse(
	fs.readFileSync('../0.contracts/build/contracts/Products.json')
);
if (typeof(contract_data.abi) !== 'object') {
	throw new Error('not abi');
}

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(
	'https://ropsten.infura.io/2m0g6KR1H1ImBwBz2zVz'
));

var manufacturer_address = '0x7eC536287F36fAfE585E0e8201F363caD10Ca308';
var manufacturer_private = '726f290e97aeb7a9ac181fb4c0e10be474e09eace154416403d3d579c14ebc73';
var manufacturer_contract;
var contract_address = '0xc1bd41c8f5c801ffe1b7f48e052ea4f8c4264341';

var manufacturer_account = web3.eth.accounts.privateKeyToAccount(manufacturer_private);
if (manufacturer_account.address != manufacturer_address) {
	throw new Error('wtf with private key');
}
web3.eth.accounts.wallet.add(manufacturer_private)

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
	.on('confirmation', function(confirmationNumber, receipt){
		console.log('confirmation', confirmationNumber);
	})
	.then(function (done) {
        console.log(done);
        console.log('--done--');
		fs.writeFileSync('toPrint.txt', ' secret : ' + secret_key + "\n public : " + public_key);
    });
}


if (contract_address) {
	manufacturer_contract = new web3.eth.Contract(contract_data.abi, contract_address, {
		from: manufacturer_address, // default from address
		gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
	});
	generateKeys();
} else {	
	manufacturer_contract = new web3.eth.Contract(contract_data.abi);
	manufacturer_contract.deploy({
		data: contract_data.unlinked_binary,
		arguments: []
	})
	.send({
		from: manufacturer_address,
		gas: 150000000,
		gasPrice: '30000000'
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
}
