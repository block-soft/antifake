try {
    var url = 'https://ropsten.infura.io/2m0g6KR1H1ImBwBz2zVz';
    var web3 = new Web3(new Web3.providers.HttpProvider(url));
	
    window.addEventListener('load', function () {
		Contract.init('0xc1bd41c8f5c801ffe1b7f48e052ea4f8c4264341');
    });
} catch (e) {
    alert(e.toString())
}


var Contract = {
	loaded : false,
    init: function (address) {
         Contract.loaded = web3.eth.contract(abi).at(address);		 
		 Contract.finish();
    },
    finish: function () {
        $('#loading_boxes').hide();
        $('#loaded_boxes').show();
    },
	check: function() {
		var code = $('#code').val();
		var txt = '';
		if (!code) {
			txt = 'введите код';
		} else {
			$('#code_result').html('идет отправка');
			var result = Contract.loaded.checkItem(code);
			if (result == 0) {
				txt = '<span style="color:red">нет такого продукта (не покупайте!)</span>';
			} else if (result == 1) {
				txt = '<span style="color:green">продукт подлинный (можно покупать)</span>';
			} else if (result == 2) {
				txt = '<span style="color:orange">продукт уже куплен (сообщите нам о адресе магазина!)</span>';
			} else {
				txt = '<span style="color:red">неизвестный продукт</span>';
			}
		}
		$('#code_result').html(txt);
	},
	send: function() {
		var code = $('#code1').val();
		var secret = $('#secret1').val();
		var txt = '';
		if (!code || !secret) {
			txt = 'введите код и секретный код';
		} else {
			$('#code_result1').html('идет отправка');
			var result = Contract.loaded.checkItem(code);
			if (result == 0) {
				txt = '<span style="color:red">нет такого продукта (не покупайте!)</span>';
			} else if (result == 1) {
				//continue
				var result = Contract.loaded.getPublicForSecretFor(secret);
				if (result != code) {
					txt = '<span style="color:red">секретный код не подходит (не выбрасывайте чек, требуйте обмена или возврата денег! сообщите нам о адресе магазина!)</span>';
				} else {
					sendToDaemon(code,secret);
					txt = '<span style="color:green">продукт подлинный, идет отправка</span>';
				}
			} else if (result == 2) {
				txt = '<span style="color:orange">продукт уже куплен (сообщите нам о адресе магазина!)</span>';
			} else {
				txt = '<span style="color:red">неизвестный продукт</span>';
			}
		}
		$('#code_result1').html(txt);
	}
};

sendToDaemon = function(code,secret) {
	var request = new XMLHttpRequest();
		request.open('POST', 'http://localhost:7898', true);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		request.onreadystatechange = function() {
			if (this.readyState != 4) return;
			var result = JSON.parse(this.responseText);
			if (result.code == 200) {
				$('#code_result1').html('продукт подлинный и будет зарегистрирован в течении 5 минут');
			} else {
				$('#code_result1').html(result.message);
			}
		};
		request.send('code=' + encodeURIComponent(code)
			+ '&secret=' + encodeURIComponent(secret));
		return false;
}

var abi = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "pubkey",
          "type": "bytes32"
        }
      ],
      "name": "addItem",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "pubkey",
          "type": "bytes32"
        }
      ],
      "name": "checkItem",
      "outputs": [
        {
          "name": "a",
          "type": "uint8"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "secret",
          "type": "bytes32"
        }
      ],
      "name": "getPublicForSecretFor",
      "outputs": [
        {
          "name": "pubkey",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "pubkey",
          "type": "bytes32"
        },
        {
          "name": "secret",
          "type": "bytes32"
        }
      ],
      "name": "updateItem",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "inputs": [],
      "payable": false,
      "type": "constructor"
    },
    {
      "payable": false,
      "type": "fallback"
    }
];