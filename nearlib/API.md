# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [KeyPair](#keypair)
    -   [Parameters](#parameters)
    -   [getPublicKey](#getpublickey)
    -   [getSecretKey](#getsecretkey)
    -   [fromRandomSeed](#fromrandomseed)
    -   [encodeBufferInBs58](#encodebufferinbs58)
        -   [Parameters](#parameters-1)
-   [Account](#account)
    -   [Parameters](#parameters-2)
    -   [createAccount](#createaccount)
        -   [Parameters](#parameters-3)
    -   [createAccountWithRandomKey](#createaccountwithrandomkey)
        -   [Parameters](#parameters-4)
    -   [viewAccount](#viewaccount)
        -   [Parameters](#parameters-5)
-   [Near](#near)
    -   [Parameters](#parameters-6)
    -   [callViewFunction](#callviewfunction)
        -   [Parameters](#parameters-7)
    -   [scheduleFunctionCall](#schedulefunctioncall)
        -   [Parameters](#parameters-8)
    -   [deployContract](#deploycontract)
        -   [Parameters](#parameters-9)
    -   [getTransactionStatus](#gettransactionstatus)
        -   [Parameters](#parameters-10)
    -   [loadContract](#loadcontract)
        -   [Parameters](#parameters-11)
    -   [createDefaultConfig](#createdefaultconfig)
        -   [Parameters](#parameters-12)

## KeyPair

This class provides key pair functionality (generating key pairs, encoding key pairs).

### Parameters

-   `publicKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `secretKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### getPublicKey

Get the public key.

### getSecretKey

Get the secret key.

### fromRandomSeed

Generate a new keypair from a random seed

### encodeBufferInBs58

Encode a buffer as string using bs58

#### Parameters

-   `buffer` **[Buffer](https://nodejs.org/api/buffer.html)** 

## Account

Near account and account related operations.

### Parameters

-   `nearClient`  

### createAccount

Creates a new account with a given name and key,

#### Parameters

-   `newAccountId` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** id of the new account.
-   `publicKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** public key to associate with the new account
-   `amount` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** amount of tokens to transfer from originator account id to the new account as part of the creation.
-   `originator`  
-   `originatorAccountId` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** existing account on the blockchain to use for transferring tokens into the new account

### createAccountWithRandomKey

Creates a new account with a new random key pair. Returns the key pair to the caller. It's the caller's responsibility to
manage this key pair.

#### Parameters

-   `newAccountId` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** id of the new account
-   `amount` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** amount of tokens to transfer from originator account id to the new account as part of the creation.
-   `originatorAccountId` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** existing account on the blockchain to use for transferring tokens into the new account

### viewAccount

#### Parameters

-   `accountId` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** id of the account to look up

## Near

Javascript library for interacting with near.

### Parameters

-   `nearClient` **NearClient** 

### callViewFunction

Calls a view function. Returns the same value that the function returns.

#### Parameters

-   `sender` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** account id of the sender
-   `contractAccountId` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** account id of the contract
-   `methodName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** method to call
-   `args` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** arguments to pass to the method

### scheduleFunctionCall

Schedules an asynchronous function call. Returns a hash which can be used to
check the status of the transaction later.

#### Parameters

-   `amount` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** amount of tokens to transfer as part of the operation
-   `originator`  
-   `contractId`  
-   `methodName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** method to call
-   `args` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** arguments to pass to the method
-   `sender` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** account id of the sender
-   `contractAccountId` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** account id of the contract

### deployContract

Deploys a smart contract to the block chain

#### Parameters

-   `originator`  
-   `contractId`  
-   `wasmByteArray`  
-   `sender` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** account id of the sender
-   `contractAccountId` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** account id of the contract
-   `wasmArray` **[Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)** wasm binary

### getTransactionStatus

Get a status of a single transaction identified by the transaction hash.

#### Parameters

-   `transactionHash` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** unique identifier of the transaction

### loadContract

Load given contract and expose it's methods.

Every method is taking named arguments as JS object, e.g.:
`{ paramName1: "val1", paramName2: 123 }`

View method returns promise which is resolved to result when it's available.
State change method returns promise which is resolved when state change is succesful and rejected otherwise.

Note that `options` param is only needed temporary while contract introspection capabilities are missing.

#### Parameters

-   `contractAccountId` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** contract account name
-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** object used to pass named parameters
    -   `options.sender` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** account name of user which is sending transactions
    -   `options.viewMethods` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** list of view methods to load (which don't change state)
    -   `options.changeMethods` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** list of methods to load that change state

Returns **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** object with methods corresponding to given contract methods.

### createDefaultConfig

Generate a default configuration for nearlib

#### Parameters

-   `nodeUrl` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** url of the near node to connect to (optional, default `'http://localhost:3030'`)