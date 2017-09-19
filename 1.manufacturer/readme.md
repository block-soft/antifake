# Создание кода на стороне производителя

## Установка

npm install web3

## Запуск

node generator.js 

## Контракт в тестовой сети

https://ropsten.etherscan.io/address/0xc1bd41c8f5c801ffe1b7f48e052ea4f8c4264341

с поправкой на использование infura нод - у них адрес по-другому генерируется, поэтому создаем контракт тоже через них (тк к производителю под которым мы создавали контракт в mew мы не получим доступ по этому приватному ключу...)

- адрес "производителя для infura" - 0x7eC536287F36fAfE585E0e8201F363caD10Ca308

- приватный ключ - 726f290e97aeb7a9ac181fb4c0e10be474e09eace154416403d3d579c14ebc73

- https://ropsten.etherscan.io/address/0x7eC536287F36fAfE585E0e8201F363caD10Ca308

## Для дополнительных тестов

https://ropsten.etherscan.io/address/0x45a728f342e8f2a019f77899730f2973a36b6d61#code

- адрес "производителя для mew" - 0x33BDc3912BFED78E3b859F23BDAE4C414CB91EB1

- приватный ключ - 726f290e97aeb7a9ac181fb4c0e10be474e09eace154416403d3d579c14ebc73

- https://ropsten.etherscan.io/address/0x33BDc3912BFED78E3b859F23BDAE4C414CB91EB1

- адрес "отправки подтверждений" - 0x981E8b390aDc58542D80BFb6854C4b3fD6DF520C

- приватный ключ - 9cc7a88b2062a9c321ec36841eb6aaccad0a1ddd9eb66c25d1863f9a89e2f250

## Запуск для локальных тестов

testrpc

node generator-testrpc.js 