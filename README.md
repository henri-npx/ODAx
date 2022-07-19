ODAx is an on-chain DEX Aggregator on Starknet Goerli.

Since there is not many DEXes with available documentation for the moment on StarkNet we are only JEDISWAP and STARKSWAP.

📹 Video presentation : https://www.loom.com/share/4aa2b9ce9dbf4ec2badbb0b677c91e16
📜 Deployed contract : https://goerli.voyager.online/contract/0x0169bd4420670f6bf0c644bb0c1ae43c1c8b12e7f149908c758b786d776e722e#writeContract


### Contact

Henri Berger
Telegram: MersonaX
Mail: hberger@coinshares.com

### Why ODAx ?

We have made this project for this hackathon because we believe on-chain DEX Aggregator is needed in the crypto ecosystem. Using centralized is relying on centralized entities and it's may not be as secured as a decentralized solution. Some DEX Aggregators solutions exists in EVM compatible chain like the one done by Yield Yak team on Avalanche. But with such application on EVM compatible chains you are quickly limited by the computation cost itself. This is not the case with StarkNet and Cairo.

### How ODAx ?

For this hackathon since we are limited in time we only implemented an MVP of this DEX Aggregator. We are comparing prices we could get through our two DEX (JEDISWAP and STARKSWAP) and then perform the swap on the cheapiest DEX.

Detailed process:

1. Get the pair address from each DEX.
2. Compute the price of the asset we want to swap on each pair.
3. Get the cheapiest price from all DEXes
4. Perform the swap on the chosen DEX router.

In our tests we are using Starknetjs and ArgentX Wallet.

A lot of improvements can be done on our algorithm to chose best swaps.

We have made a lot of research on centralized DEX Aggregators like Paraswap and think it could be possible to reproduce such a product in a decentralized way thanks to StarkNet.
We could improve the main algorithm that helps us to swap our token.Pair liquidity also needs to be taken into account. Choosing the perfect route to perform a swap on many DEXes has a lot of similarities with the traveling salesman problem, there is no perfect solutions but we can implement really performant algorithms to resolve it and StarkNet computations possibilities allows it.

Also another issue that was limiting us in our application is the disparities in price between DEXes on Testnet. Since those are not real assets, price are not arbitraged and present big differences. We could have implemented a simple algorithm based on liquidity if prices were close to each other but it is not possible right now with current state. On mainnet it will much more efficient
There is also a lack of convention on DEXes structure. On EVM compatible chains a lot of DEXes are using the same interfaces so it is easier to write readable code that can apply to a lot of different DEXes

We already took some inspiration of Paraswap, 1inch, Dodo and Yak.

Special thanks to Yalek from ArgentX for helping us, he helped us a lot ! We've never coded with ArgentX before, neither in Cairo by the way. 

### Usage

Have Docker installed and booted
Have Node and Yarn installed
Env variable are commited so no need to configure them (don't abuse my private key please !)

    yarn hardhat test test/core.ts --starknet-network alpha


### Proof of work

➜  StarknetODA git:(master) ✗ yarn hardhat test test/core.ts --starknet-network alpha
    Starknet plugin using dockerized environment (shardlabs/cairo-cli:0.9.0-arm)
    Using network alpha at https://alpha4.starknet.io

    Starknet
    🔑 env.account        :  0x059E1CbdD07823aeB9DA52cb7BE4102C9012cbe9AB05349EB2bCE7cb7103a3B2
    🔑 env.account pKey   :  286924204142771639435557759619532125609016188385690265174806257430593456391
    👨‍💻 account.address    :  0x059e1cbdd07823aeb9da52cb7be4102c9012cbe9ab05349eb2bce7cb7103a3b2
    ✔ should connect to an existing Argent account
    Compiling /Users/henri/Desktop/CoinShares/StarknetODA/contracts/router.cairo
	    Succeeded
    Compiling /Users/henri/Desktop/CoinShares/StarknetODA/contracts/periphery.cairo
	    Succeeded

    ✔ should compile the project and instanciate a provider (7114ms)
    ✔ should setup an account [DEPRECATED]
        📜 Router  : 0x0169bd4420670f6bf0c644bb0c1ae43c1c8b12e7f149908c758b786d776e722e
        📜 Router Name : 68101120651031038211111711610111445118484649n
    ✔ should deploy the Router and the Periphery  (126583ms)
    - should add Jedi exchange
        exchangesLength : 2
        🔄 exchange[0]: 528330283628715324117473561763116327110398297690851013171802704612289884993n
        🔄 exchange[1]: 528330283628715324117473561763116327110398297690851013171802704612289884993n
    ✔ should iterate on every exchange (4213ms)
    - should request a quote for a simple swap with Jedi supported tokens
        💶 BalanceOf account before (ether): 344822631268735757n
        💶 BalanceOf account before (dai): 5508279653276110186n
        ✅ approveRawTx       :
        {
            contractAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
            entrypoint: 'approve',
            calldata: [
                '639138057133303383148075429564677080184485510303844328127894112020777038382',
                '424200000000000000000000000',
                '0'
            ]
        }
        ✅ txApprove.address       :  undefined
        ✅ txApprove.transaction_hash       :  0x21260d2c2f18ff20d115fa4696850b2428b3af69790a43beab031297d58ce66
        🕰 Waiting ACCEPTED_ON_L2 : 0x21260d2c2f18ff20d115fa4696850b2428b3af69790a43beab031297d58ce66
        ✅ Waiting period done !
    ✔ should approve (111482ms)
        ➤ amountInToken0  (ether):  25000000000000000
        ✅ executeRawTx       :
        {
        contractAddress: '0x0169bd4420670f6bf0c644bb0c1ae43c1c8b12e7f149908c758b786d776e722e',
        entrypoint: 'executeSwap',
        calldata: [
            '2087021424722619777119509474943472645767659996348769578120564519014510906823',
            '1767481910113252210994791615708990276342505294349567333924577048691453030089',
            '25000000000000000',
            '0'
        ]
        }
        ✅ txSwap.address       :  undefined
        ✅ txSwap.class_hash       :  undefined
        ✅ txSwap.code       :  TRANSACTION_RECEIVED
        ✅ txSwap.transaction_hash       :  0x4f972e55fcef08ada79a22f7198a8f478a10214366078846db93e8024e1d0cb
        🕰 Waiting txSwap ACCEPTED_ON_L2 : 0x4f972e55fcef08ada79a22f7198a8f478a10214366078846db93e8024e1d0cb
        ✅ Waiting period done !
        💶 BalanceOf account after (ether): 319785511568401678n
        💶 BalanceOf account after (dai): 8192806651950926030n
    ✔ should execute a swap (83354ms)

