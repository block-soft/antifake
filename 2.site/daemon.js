var express = require('express');

var app = express();

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	// Pass to next layer of middleware
	next();
});

//init once
app.listen(7898, function() {
	console.log('Listening on port 7898...')
})

//some default
app.get('/', function (req, res) {
	res.send('hello');
});

//post data processing
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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

var confirmer_address = '0x8d942C348e8844C4e926e0A4602F3d9DA5f5158A';
var confirmer_private = '9cc7a88b2062a9c321ec36841eb6aaccad0a1ddd9eb66c25d1863f9a89e2f250';
var contract_address = '0xc1bd41c8f5c801ffe1b7f48e052ea4f8c4264341';

var confirmer_account = web3.eth.accounts.privateKeyToAccount(confirmer_private);
if (confirmer_account.address != confirmer_address) {
	throw new Error('wtf with private key');
}
web3.eth.accounts.wallet.add(confirmer_private);

var manufacturer_contract = new web3.eth.Contract(contract_data.abi, contract_address, {
	from: confirmer_address, // default from address
	gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
});

updateKey = function(secret_key, public_key) {
    console.log('--updating--');
    console.log('->');
    manufacturer_contract.methods.updateItem(public_key, secret_key).send({
		from : confirmer_address,
		gas: 150000,
	})
	.on('confirmation', function(confirmationNumber, receipt){
		console.log('confirmation', confirmationNumber);
	})
	.then(function (done) {
        console.log(done);
        console.log('--done--');
		fs.writeFileSync('done.txt', ' secret : ' + secret_key + "\n public : " + public_key);
		res.send('DONE');
    });
}

app.post('/', function (req, res) {
	console.log('Post processing', req.body);
	var secret_key = req.body.secret;
	var public_key = req.body.code;
	if (!secret_key || !public_key) {
		res.send('Params missing');
	} else {
		console.log('--checking--');
		console.log(secret_key);
		console.log('->');
		manufacturer_contract.methods.checkItem(public_key).call()
		.then(function (result) {	
			console.log('--status--');
			console.log(result);
			if (result != 1) {
				res.send('Error status is ' + result);
			} else {
				manufacturer_contract.methods.getPublicForSecretFor(secret_key).call()
				.then(function (public_key2) {
					console.log(public_key2);
					if (public_key2 != public_key) {
						res.send('Error secret key not good');
					} else {
						updateKey(secret_key, public_key);
					}
				});
			}
		});
	}
	
});