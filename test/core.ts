import { expect } from "chai";
import starknet, { Abi, Call, FunctionAbi, Invocation, RawCalldata, Signature } from "starknet"
import { BigNumber } from "ethers";
import { starknet as hardhatStarknet, ethers, } from "hardhat";
import { StarknetContract, StarknetContractFactory, StringMap, Wallet, ArgentAccount } from "hardhat/types/runtime";
import { DexTokens, ensureEnvVar, ExpectedEnvType, getContract, PairData, Pow18, Pow6, TIMEOUT } from "./helpers";
import { Log } from '../scripts/helpers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import hardhat from 'hardhat';
import { uint256 } from 'starknet';
import BN from "bn.js";
import fs from "fs";
import fetch from "cross-fetch"

global.fetch = fetch

import {
    Account,
    Contract,
    defaultProvider,
    Provider,
    ec,
    json,
    number,
} from "starknet";
import { Numeric } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";
import { compileCalldata } from "starknet/dist/utils/stark";
import { bigNumberishArrayToDecimalStringArray, toBN } from "starknet/dist/utils/number";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
const env = process.env as ExpectedEnvType;

// ODA Configuration
const JediSwapRouterAddress = "0x012b063b60553c91ed237d8905dff412fba830c5716b17821063176c6c073341";
const StarkSwapRouterAddress = "0x07432d8a0d3f44c8b73a572417d7454c3fcac29ee9ae884b3b1ea872c32d2922";

// const ERC20ABI: Abi = [{
//     "inputs": [
//         {
//             "name": "spender",
//             "type": "felt"
//         },
//         {
//             "name": "amount",
//             "type": "Uint256" // Uint256 !
//         }
//     ],
//     "name": "approve",
//     "outputs": [
//         {
//             "name": "success",
//             "type": "felt"
//         }
//     ],
//     "type": "function"
// }]


const ERC20ABI: Abi = [
    {
        "members": [
            {
                "name": "low",
                "offset": 0,
                "type": "felt"
            },
            {
                "name": "high",
                "offset": 1,
                "type": "felt"
            }
        ],
        "name": "Uint256",
        "size": 2,
        "type": "struct"
    },
    {
        "inputs": [
            {
                "name": "name",
                "type": "felt"
            },
            {
                "name": "symbol",
                "type": "felt"
            },
            {
                "name": "recipient",
                "type": "felt"
            }
        ],
        "name": "constructor",
        "outputs": [],
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "name",
                "type": "felt"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "symbol",
                "type": "felt"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "totalSupply",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "decimals",
                "type": "felt"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "account",
                "type": "felt"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "owner",
                "type": "felt"
            },
            {
                "name": "spender",
                "type": "felt"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "remaining",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "recipient",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "sender",
                "type": "felt"
            },
            {
                "name": "recipient",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "spender",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "spender",
                "type": "felt"
            },
            {
                "name": "added_value",
                "type": "Uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "spender",
                "type": "felt"
            },
            {
                "name": "subtracted_value",
                "type": "Uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "recipient",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "user",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "name": "burn",
        "outputs": [],
        "type": "function"
    }
]

describe("Starknet", function () {

    this.timeout(TIMEOUT);
    let account: Account;
    let router: StarknetContract;
    let periphery: StarknetContract;

    const pairData: PairData[] = []

    it.only("should connect to an existing Argent account", async function () {
        const keyPair = ec.getKeyPair(env.STARKNET_MAINNET_ACCOUNT_PRIVATE_KEY)
        account = new Account(
            defaultProvider,
            env.STARKNET_MAINNET_ACCOUNT_ADDRESS.toLowerCase(
            ),
            keyPair
        );
        // const account2 = await hardhatStarknet.getAccountFromAddress(
        //     env.STARKNET_MAINNET_ACCOUNT_ADDRESS,
        //     env.STARKNET_MAINNET_ACCOUNT_PRIVATE_KEY,
        //     "Argent"
        // )
    });

    it.skip("should compile the project and instanciate a provider", async function () {
        await hardhat.run("starknet-compile", {
            paths: ["contracts/router.cairo"]
        });
        await hardhat.run("starknet-compile", {
            paths: ["contracts/periphery.cairo"]
        });
        // const provider = new Provider({ baseUrl: env.INFURA_STARKNET_GOERLI })
        // const block = await defaultProvider.getBlock();
        // const provider = new Provider({ network: "goerli-alpha" })
        // const provider = new Provider({
        //     baseUrl: 'https://alpha4.starknet.io',
        //     feederGatewayUrl: 'feeder_gateway',
        //     gatewayUrl: 'gateway'
        // })
        // const block = await provider.getBlock();
        // const code = await provider.getCode("0x012b063b60553c91ed237d8905dff412fba830c5716b17821063176c6c073341");
        // console.dir(block)
    });

    it.skip("should setup an account", async function () {
        // const signers = await ethers.getSigners();
        // owner = signers[0];
        // account = await starknet.deployAccount("OpenZeppelin", {
        //     privateKey: env.STARKNET_MAINNET_ACCOUNT_PRIVATE_KEY,
        // });
        // OpenZeppelin and Argent accounts have some differences:
        // See https://github.com/Shard-Labs/starknet-hardhat-plugin#multicalls
        // Argent account needs to be initialized after deployment. This has to be done with another funded account.
        // Argent account offers guardian functionality. The guardian is by default not set (the guardian key is undefined), but if you want to change it, cast the account to ArgentAccount and execute setGuardian.

        // account = <ArgentAccount>await starknet.getAccountFromAddress(
        //     ensureEnvVar("STARKNET_MAINNET_ACCOUNT_ADDRESS"),
        //     ensureEnvVar("STARKNET_MAINNET_ACCOUNT_PRIVATE_KEY"),
        //     "Argent"
        // )

        // Log.info("Account :", account.address)
        // Log.info("PrivKey :", account.privateKey)

    });

    it.skip("should deploy the Router and the Periphery", async function () {
        const routerFactory = await hardhatStarknet.getContractFactory("router");
        const peripheryFactory = await hardhatStarknet.getContractFactory("periphery");
        router = await routerFactory.deploy({ owner: account.address, jediExchange: JediSwapRouterAddress, starkswapExchange: StarkSwapRouterAddress });
        periphery = await peripheryFactory.deploy({ routerJediSwap: JediSwapRouterAddress });
        const routerOwner: BigInt = (await router.call("getOwner"))["owner"];
        Log.info("Owner   :", routerOwner.toString(16)) // BigInt - https://www.rapidtables.com/convert/number/decimal-to-hex.html
        Log.info("Router  :", router.address.toString())
        Log.info("Helper  :", periphery.address.toString())
        // ..
        const name = await router.call("name");
        Log.info("Router Name :", name["name"]);
    });

    // Fail with : yarn hardhat test test/core.ts --starknet-network alpha
    // Work with : yarn hardhat test test/core.ts --starknet-network integrated-devnet
    // Got it, alpha is actually Goerli xD
    // it.skip("should add Jedi exchange", async function () {
    //     const tx1 = await account.invoke(router, "addExchange", {
    //         _exchange: JediSwapRouterAddress
    //     })
    //     Log.info("Tx:", tx1)
    //     const tx2 = await account.invoke(router, "addExchange", {
    //         _exchange: StarkSwapRouterAddress
    //     })
    //     Log.info("Tx:", tx2)
    // });


    it.skip("should iterate on every exchange", async function () {
        const exchangesLength: BigInt = (await router.call("getExchangesLength"))["length"];
        Log.info("exchangesLength :", exchangesLength.toString())
        for (let x = 0; x < Number(exchangesLength); x++) {
            const exchange = (await router.call("getExchanges", {
                _index: 0
            }))["exchange"];
            Log.info("exchange[" + x + "]:", exchange)
            // const { balance: initBal } = await account.call(...); ToDo 
        }
    });

    it.skip("should instanciate Jedi Router", async function () {
        const jediRouterFactory = await hardhatStarknet.getContractFactory("contracts/dexes/jedi/IJediRouter.cairo");
        const jediRouter = jediRouterFactory.getContractAt(JediSwapRouterAddress); // address of a previously deployed contract
        const abi = jediRouter.getAbi();
        Log.info(abi)
        const jediFactory = await jediRouter.call("factory");
    });

    it.skip("should request data from periphery from JediSwap", async function () {
        const res = await periphery.call("getJediPairs");
        const pairs = res["all_pairs"];
        const size = Number(res["all_pairs_len"]);
        const MAX = 3
        for (let x = 0; x < size; x++) {

            if (x > MAX) break; // DEV

            const pair = pairs[x] as string;
            const pairInfo = await periphery.call("getJediPairInfo", {
                pair: pair
            })
            const reserve0 = uint256.uint256ToBN(pairInfo["reserve0"]);
            const reserve1 = uint256.uint256ToBN(pairInfo["reserve1"]);
            const token0 = pairInfo["token0"]
            const token1 = pairInfo["token1"]
            const decimalsToken0 = pairInfo["decimals0"]
            const decimalsToken1 = pairInfo["decimals1"]
            Log.info("pair[" + x + "]: address  :", pair);
            Log.info("pair[" + x + "]: reserve0 :", reserve0.toString());
            Log.info("pair[" + x + "]: reserve1 :", reserve1.toString());
            Log.info("pair[" + x + "]: token0   :", token0);
            Log.info("pair[" + x + "]: token1   :", token1);
            Log.info("pair[" + x + "]: decimalsToken0   :", decimalsToken0);
            Log.info("pair[" + x + "]: decimalsToken1   :", decimalsToken1);
            const currentPair = {
                reserve0: reserve0,
                reserve1: reserve1,
                token0: token0,
                token1: token1,
                decimalsToken0: Number(decimalsToken0),
                decimalsToken1: Number(decimalsToken1),
            }
            pairData.push(currentPair);
        }
    });

    it.skip("should request a quote for a simple swap with Jedi supported tokens", async function () {
        const targetPair = pairData[0];
        const tokenIn = targetPair.token0;
        const tokenOut = targetPair.token1;
        const amountInToken0 = uint256.bnToUint256(1 * (10 ** targetPair.decimalsToken0));
        Log.info("Calling with ...")
        Log.info("- tokenIn:", tokenIn)
        Log.info("- tokenOut:", tokenOut)
        Log.info("- amountInToken0:", amountInToken0["low"].toString())
        Log.info("- amountInToken0:", uint256.uint256ToBN(amountInToken0).toString())
        const res = await router.call("getOptimaLExchange", {
            _tokenIn: tokenIn,
            _tokenOut: tokenOut,
            _amountIn: amountInToken0, // Uint256
        })
        // Starknet propose uint256ToBN & bnToUint256
        const amountOut = res["amountOut"] as uint256.Uint256;
        Log.info("getOptimaLExchange: ", uint256.uint256ToBN(amountOut).toString());
        Log.info("getOptimaLExchange: ", res["exchangeIndex"]);
    });



    it.only("should approve and execute a swap ", async function () {
        // ...
        // const commonTokenIn = DexTokens.ether.address.toLowerCase();
        // const commonTokenOut = DexTokens.usdc.address.toLowerCase();
        // const tmp0 = Pow18 / BigInt(100); // Hardcoded : 0.01 ETHER
        // const tmp1 = tmp0.toString();
        // const amountInTokenInAsBN = new BN(tmp1);
        // const amountInTokenIn = uint256.bnToUint256(amountInTokenInAsBN);
        // Log.info("commonTokenIn       : ", commonTokenIn);
        // Log.info("commonTokenOut      : ", commonTokenOut);
        // Log.info("amountInTokenIn.low : ", amountInTokenIn.low.toString());
        // const accountOZ = await starknet.deployAccount("OpenZeppelin", {
        //     privateKey: env.STARKNET_MAINNET_ACCOUNT_PRIVATE_KEY,
        // });

        const wethAddress = DexTokens.ether.address.toLowerCase();
        const erc20Factory: StarknetContractFactory = await hardhatStarknet.getContractFactory("ERC20");
        const ether = await erc20Factory.getContractAt(wethAddress);

        const balance = await ether.call("balanceOf", {
            account: account.address
        });
        Log.info("balanceOf       : ", balance);

        const contract = new Contract(ERC20ABI, ether.address.toLowerCase(), defaultProvider);

        const approveRawTx: Call = {
            contractAddress: contract.address.toLowerCase(),
            entrypoint: "approve",
            calldata: compileCalldata({
                spender: JediSwapRouterAddress,
                amount: {
                    type: "struct",
                    ...uint256.bnToUint256("42")
                }
            })
        }
        console.log(approveRawTx);

        const tx = await account.execute(approveRawTx);

        console.log(tx);

        // execute(calls: Call | Call[], abis?: Abi[] | undefined, transactionsDetail?: InvocationsDetails): Promise<AddTransactionResponse>;
        // export declare type Call = Omit<Invocation, 'signature'>;

        // type Invocation = {
        //     contractAddress: string;
        //     entrypoint: string;
        //     calldata?: RawCalldata;
        //     signature?: Signature;
        // };







        // const estimatedGasFees = await ether.estimateFee("approve", {
        //     spender: StarkSwapRouterAddress, // router.address,
        //     amount: amountInTokenIn
        // })
        // console.log(estimatedGasFees);

        // const tx = await ether.invoke("approve", {
        //     spender: StarkSwapRouterAddress, // router.address,
        //     amount: amountInTokenIn
        // }, {
        //     maxFee: BigInt(10000000000000000000)
        // })
        // console.log(tx);

        // export interface InvokeOptions {
        //     signature?: Array<Numeric>;
        //     wallet?: Wallet;
        //     nonce?: Numeric;
        //     maxFee?: Numeric;
        // }



        // -- v2 -- KO
        // const weth = DexTokens.ether.address;
        // const wETHContract = getContract(weth, "./abis/ERC20.json");
        // const res = await wETHContract.balance_of(env.STARKNET_MAINNET_ACCOUNT_ADDRESS)
        // console.log(wETHContract);
        // console.log(res);

        Log.info("env.account        : ", env.STARKNET_MAINNET_ACCOUNT_ADDRESS);
        Log.info("env.account pKey   : ", env.STARKNET_MAINNET_ACCOUNT_PRIVATE_KEY);
        Log.info("account.address    : ", account.address);
        // Log.info("balanceOf       : ", balance);
        // Log.info("balanceOf b2       : ", b2["balance"]["low"]);

        // Approve ToDo

        // Execute
        // const tx = account.invoke(router, "executeSwap", {
        //     _tokenIn: commonTokenIn,
        //     _tokenOut: commonTokenOut,
        //     _amountIn: amountInTokenIn, // Uint256
        // })
    });

    it("should request a quote for a simple swap with DEX's commonly supported tokens", async function () {
        // ...

    });

    // it.only("should test random stuff", async () => {
    //     const res = {
    //         low: 7980221609764751777n,
    //         high: 0n
    //     }
    //     console.log(res["low"] / Pow18);
    //     console.log(res["high"].toString());
    //     console.log(BigInt(res["low"]));
    //     console.log(BigInt(res["high"]));
    //     const x = starknet.bigIntToShortString(res["low"])
    //     const x2 = starknet.shortStringToBigInt("1234")
    //     console.log(x);
    //     console.log(x2);
    //     console.log(starknet.bigIntToShortString(x2));
    // })

});
