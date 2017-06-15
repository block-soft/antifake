var UiAlerts = {
    div: $('#info_alerts'),
    messages: [],
    messagesCount: 0,

    show: function () {
        var html = '';
        var min_i = UiAlerts.messagesCount - 5;
        if (min_i < 0) min_i = 0;
        for (var i = UiAlerts.messagesCount - 1; i >= min_i; i--) {
            var message = UiAlerts.messages[i];
            html += '<div class="alert alert-' + message.class + '">' + message.text + '</div> ';
        }
        ;
        UiAlerts.div.html(html);
    },
    _add: function (css, title, message) {
        UiAlerts.messages.push({
            class: css, text: '<b>' + title + '</b> ' + message
        });
        UiAlerts.messagesCount++;
        UiAlerts.show();
    },
    addInfo: function (title, message) {
        UiAlerts._add('info', title, message);
    },
    addError: function (title, message) {
        UiAlerts._add('danger', title, message);
    },
    addSuccess: function (title, message) {
        UiAlerts._add('success', title, message);
    }
};

var testProductName = 'myTestProduct';

try {
    var url = "http://localhost:8545";
    var web3 = new Web3(new Web3.providers.HttpProvider(url));

    var adminAccount = web3.eth.accounts[0];
    var customerAccount = web3.eth.accounts[1];

    $('#admin_account').html(adminAccount);
    $('#customer_account').html(customerAccount);

    window.addEventListener('load', function () {
        //deploy contract, not needed in real mode
        UiAlerts.addSuccess('web3', 'loaded')
        ContractsInit.createDatabase();
    });

} catch (e) {
    UiAlerts.addError('web3', e.toString())
}

var Contracts = {
    database: false,
    productFactory: false,
    productFactoryAddress: false,
    productContract: false
};

var ContractsInit = {
    createDatabase: function () {
        $.getJSON('../truf/build/contracts/Database.json', function (json) {
            var tmpContract = web3.eth.contract(json.abi);
            Contracts.database = tmpContract.new({
                    from: adminAccount,
                    data: json.unlinked_binary,
                    gas: 4100000
                },
                function (e, contract) {
                    if (e) {
                        UiAlerts.addError('createDatabase', e.toString());
                    } else {
                        if (contract.address) {
                            UiAlerts.addSuccess('createdDatabase', contract.address);
                            $('#database_contract').html(contract.address);
                            ContractsInit.createProductFactory();
                        }
                    }
                });
        });
    },
    createProductFactory: function () {
        $.getJSON('../truf/build/contracts/ProductFactory.json', function (json) {
            var tmpContract = web3.eth.contract(json.abi);
            Contracts.productFactory = tmpContract.new({
                    from: adminAccount,
                    data: json.unlinked_binary,
                    gas: 4100000
                },
                function (e, contract) {
                    if (e) {
                        UiAlerts.addError('createProductFactory', e.toString());
                    } else {
                        if (contract.address) {
                            UiAlerts.addSuccess('createdProductFactory', contract.address);
                            $('#product_factory_contract').html(contract.address);
                            Contracts.productFactoryAddress = contract.address;
                            ContractsInit.createProduct();
                        }
                    }
                });
        });
    },
    createProduct: function () {
        $.getJSON('../truf/build/contracts/Product.json', function (json) {
            Contracts.productContract = web3.eth.contract(json.abi);
            Products.createProduct(testProductName, true);
            ContractsInit.finish();
        });
    },
    finish: function () {
        $('#loading_boxes').hide();
        $('#loaded_boxes').show();
    }
};

var Products = {
    txHashes: new Array(),

    createProduct: function (productName, firstTime) {

        Contracts.productFactory.createProduct.estimateGas(
            productName,
            Contracts.database.address,
            {
                from: adminAccount
            },
            function (e, gas) {
                if (e) {
                    UiAlerts.addError('createProductGas', e.toString());
                } else {
                    Contracts.productFactory.createProduct(
                        productName,
                        Contracts.database.address,
                        {
                            from: adminAccount,
                            gas: gas
                        },
                        function (e, productHash) {
                            if (e) {
                                UiAlerts.addError('createProduct', e.toString());
                            } else {
                                UiAlerts.addSuccess('createdProduct', testProductName + '<br/>' + productHash);
                                Products.txHashes.push(productHash);
                                $('#product_hashes').append('<span>' + productHash + '</span><br/>');
                                $('#product_check').val(productHash);
                                if (firstTime) {
                                    setTimeout(function(){
                                        Products.checkProduct(productHash);
                                    }, 60);
                                }
                            }
                        });
                }
            }
        );
    },
    _subCheckProduct: function (productHash, divID) {
        try {
            var transaction = web3.eth.getTransaction(productHash);
        } catch (e) {
            UiAlerts.addError('getProductTransaction', e.toString())
            return false;
        }
        if (!transaction) {
            $(divID).html('<div style="color:red">wrong product public number ' + productHash + '</div>');
            return false;
        }
        if (transaction.from != adminAccount) {
            $(divID).html('<div style="color:red">wrong product manufacturer ' + transaction.from + '</div>');
            return false;
        }
        if (transaction.to != Contracts.productFactoryAddress) {
            $(divID).html('<div style="color:red">wrong product factory ' + transaction.to + '</div>');
            return false;
        }
        UiAlerts.addSuccess('checkedProductTransaction', 'addresses of contracts are valid<br/>' + productHash);

        return true;
    },

    checkProduct: function (productHash, divID) {
        if (!Products._subCheckProduct(productHash, divID)) {
            return false;
        }
        try {
            Contracts.database.checkProduct(
                productHash,
                {
                    from: customerAccount,
                    gas: 810000
                },
                function (e, productCheckResult) {
                    if (e) {
                        UiAlerts.addError('checkProductRegistration', e.toString());
                    } else if (productCheckResult) {
                        UiAlerts.addSuccess('checkedProductRegistration', productHash);
                        $(divID).html('<div style="color:green">product is valid (can buy and register)</div>');
                        $('#product_check2').val(productHash);
                    } else {
                        UiAlerts.addError('checkedProductRegistration', productHash);
                        $(divID).html('<div style="color:red">product is registered</div>');
                    }
                });
        } catch (e) {
            UiAlerts.addError('checkProduct', e.toString())
            return false;
        }
    },

    registerProduct: function (productHash, productSecret) {
        if (!Products._subCheckProduct(productHash, '#product_register_result')) {
            return false;
        }
        try {
            Contracts.database.registerProduct(
                productHash,
                {
                    from: customerAccount,
                    gas: 810000
                },
                function (e, productRegisterResult) {
                    if (e) {
                        UiAlerts.addError('registerProduct', e.toString());
                    } else if (productRegisterResult) {
                        UiAlerts.addSuccess('registerProduct', productHash);
                        $('#product_register_result').html('<div style="color:green">product registration done ' + productRegisterResult + '</div>');
                        $('#product_check3').val(productHash);
                    } else {
                        UiAlerts.addError('registerProduct', productHash);
                        $('#product_register_result').html('<div style="color:red">product registration error</div>');
                    }
                });
        } catch (e) {
            UiAlerts.addError('registerProduct', e.toString())
            return false;
        }
    },
}