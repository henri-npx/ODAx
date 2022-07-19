ODAX is an on-chain DEX Aggregator.

Since there is not many DEXes with available documentation for the moment on StarkNet we are only JEDISWAP and STARKSWAP.

Presentation : https://www.loom.com/share/68b747cddf5f4c5fadaab12d2888d7f6

WHY ?

We have made this project for this hackathon because we believe on-chain DEX Aggregator is needed in the crypto ecosystem. Using centralized is relying on centralized entities and it's may not be as secured as a decentralized solution. Some DEX Aggregators solutions exists in EVM compatible chain like the one done by Yield Yak team on Avalanche. But with such application on EVM compatible chains you are quickly limited by the computation cost itself. This is not the case with StarkNet and Cairo.

HOW ?

For this hackathon since we are limited in time we only implemented an MVP of this DEX Aggregator. We are comparing prices we could get through our two DEX (JEDISWAP and STARKSWAP) and then perform the swap on the cheapiest DEX.

Detailed process:

1. Get the pair address from each DEX.
2. Compute the price of the asset we want to swap on each pair.
3. Get the cheapiest price from all DEXes
4. Perform the swap on the chosen DEX router.

In our tests we are using Starknetjs and ArgentX Wallet.

Possible improvements:

A lot of improvements can be done on our algorithm to chose best swaps. We have made a lot of research on centralized DEX Aggregators like Paraswap and think it could be possible to reproduce such a product in a decentralized way thanks to StarkNet. We could improve the main algorithm that helps us to swap our token. Pair liquidity also needs to be taken into account. Choosing the perfect route to perform a swap on many DEXes has a lot of similarities with the traveling salesman problem, there is no perfect solutions but we can implement really performant algorithms to resolve it and StarkNet computations possibilities allows it.

Also another issue that was limiting us in our application is the disparities in price between DEXes on Testnet. Since those are not real assets, price are not arbitraged and present big differences. We could have implemented a simple algorithm based on liquidity if prices were close to each other but it is not possible right now with current state. On mainnet it will much more efficient.

There is also a lack of convention on DEXes structure. On EVM compatible chains a lot of DEXes are using the same interfaces so it is easier to write readable code that can apply to a lot of different DEXes
