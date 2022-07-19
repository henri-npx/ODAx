import { Abi, Call } from "starknet"
import fs from "fs";
import { starknet as hardhatStarknet, ethers, } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { DexTokens, ExpectedEnvType, PairData, TIMEOUT } from "./helpers";
import { Log } from '../scripts/helpers';
import hardhat from 'hardhat';
import { uint256 } from 'starknet';
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
import { compileCalldata } from "starknet/dist/utils/stark";

import BN from "bn.js";
import { Numeric } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";
import { bigNumberishArrayToDecimalStringArray, toBN } from "starknet/dist/utils/number";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
const env = process.env as ExpectedEnvType;

// ODA Configuration
const JediSwapRouterAddress = "0x012b063b60553c91ed237d8905dff412fba830c5716b17821063176c6c073341";
const StarkSwapRouterAddress = "0x07432d8a0d3f44c8b73a572417d7454c3fcac29ee9ae884b3b1ea872c32d2922";

const ERC20ABI = json.parse(
    fs.readFileSync("./abis/ERC20.json").toString("ascii")
);

const QUICK_MODE = false

describe("Starknet", function () {

    this.timeout(TIMEOUT);

    let account: Account;
    let router: StarknetContract;
    let periphery: StarknetContract;
    let pairData: PairData[] = []

    it("should connect to an existing Argent account", async function () {
        const keyPair = ec.getKeyPair(env.STARKNET_MAINNET_ACCOUNT_PRIVATE_KEY)
        account = new Account(
            defaultProvider,
            env.STARKNET_MAINNET_ACCOUNT_ADDRESS.toLowerCase(
            ),
            keyPair
        );
        Log.info("env.account        : ", env.STARKNET_MAINNET_ACCOUNT_ADDRESS);
        Log.info("env.account pKey   : ", env.STARKNET_MAINNET_ACCOUNT_PRIVATE_KEY);
        Log.info("account.address    : ", account.address);
    });

    it("should compile the project and instanciate a provider", async function () {
        if (!QUICK_MODE) {

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
        }

    });

    it("should setup an account [DEPRECATED]", async function () {
        if (!QUICK_MODE) {
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
        }
    });

    it("should deploy the Router and the Periphery ", async function () {
        if (!QUICK_MODE) {
            const routerFactory = await hardhatStarknet.getContractFactory("router");
            const peripheryFactory = await hardhatStarknet.getContractFactory("periphery");
            router = await routerFactory.deploy({ owner: account.address, jediExchange: JediSwapRouterAddress, starkswapExchange: StarkSwapRouterAddress });
            periphery = await peripheryFactory.deploy({ routerJediSwap: JediSwapRouterAddress });
            const routerOwner: BigInt = (await router.call("getOwner"))["owner"];
            Log.info("Owner   :", routerOwner.toString(16)) // BigInt - https://www.rapidtables.com/convert/number/decimal-to-hex.html
            Log.info("Router  :", router.address.toString())
            Log.info("Helper  :", periphery.address.toString())
            const name = await router.call("name");
            Log.info("Router Name :", name["name"]);
        }
    });

    it.skip("should add Jedi exchange", async function () {
        if (!QUICK_MODE) {
            // Fail with : yarn hardhat test test/core.ts --starknet-network alpha
            // Work with : yarn hardhat test test/core.ts --starknet-network integrated-devnet
            // Got it, alpha is actually Goerli xD
            // const tx1 = await account.invoke(router, "addExchange", {
            //     _exchange: JediSwapRouterAddress
            // })
            // Log.info("Tx:", tx1)
            // const tx2 = await account.invoke(router, "addExchange", {
            //     _exchange: StarkSwapRouterAddress
            // })
            // Log.info("Tx:", tx2)
        }
    });

    it("should iterate on every exchange", async function () {
        if (!QUICK_MODE) {
            const exchangesLength: BigInt = (await router.call("getExchangesLength"))["length"];
            Log.info("exchangesLength :", exchangesLength.toString())
            for (let x = 0; x < Number(exchangesLength); x++) {
                const exchange = (await router.call("getExchanges", {
                    _index: 0
                }))["exchange"];
                Log.info("exchange[" + x + "]:", exchange)
            }
        }
    });

    it("should instanciate Jedi Router [TODO]", async function () {
        // const jediRouterFactory = await hardhatStarknet.getContractFactory("contracts/dexes/jedi/IJediRouter.cairo");
        // const jediRouter = jediRouterFactory.getContractAt(JediSwapRouterAddress); // address of a previously deployed contract
        // const abi = jediRouter.getAbi();
        // Log.info(abi)
        // const jediFactory = await jediRouter.call("factory");
    });

    it("should request data from periphery from JediSwap", async function () {
        if (!QUICK_MODE) {
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
        }
    });

    it("should request a quote for a simple swap with Jedi supported tokens", async function () {
        if (!QUICK_MODE) {
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
        }
    });

    it("should approve", async function () {

        const wethAddress = DexTokens.ether.address.toLowerCase();
        const ERC20Factory: StarknetContractFactory = await hardhatStarknet.getContractFactory("ERC20");
        const wethContract = await ERC20Factory.getContractAt(wethAddress);
        const balance = await wethContract.call("balanceOf", { account: account.address });
        Log.info("balanceOf       : ", balance["balance"]["low"]);
        const contract = new Contract(ERC20ABI, wethContract.address.toLowerCase(), defaultProvider);

        const approveRawTx: Call = {
            contractAddress: contract.address.toLowerCase(),
            entrypoint: "approve",
            calldata: compileCalldata({
                spender: router.address,// JediSwapRouterAddress,
                amount: {
                    type: "struct",
                    ...uint256.bnToUint256("424200000000000000000000000")
                }
            })
        }

        Log.info("approveRawTx       : ", approveRawTx);
        const txApprove = await account.execute(approveRawTx);
        Log.info("txApprove.address       : ", txApprove.address);
        Log.info("txApprove.class_hash       : ", txApprove.class_hash);
        Log.info("txApprove.code       : ", txApprove.code);
        Log.info("txApprove.transaction_hash       : ", txApprove.transaction_hash);
        Log.info("Waiting ACCEPTED_ON_L2 :", txApprove.transaction_hash);
        await defaultProvider.waitForTransaction(txApprove.transaction_hash);
        Log.info("Waiting period done !");
    });

    it("should execute a swap", async function () {

        const commonTokenIn = DexTokens.ether.address.toLowerCase();
        const commonTokenOut = DexTokens.dai.address.toLowerCase();

        // const amountInToken0 = uint256.bnToUint256(1 * (10 ** DexTokens.ether.decimals));
        const amountInToken0 = "25000000000000000"
        Log.info("amountInToken0  : ", amountInToken0);

        const executeRawTx: Call = {
            contractAddress: router.address.toLowerCase(),
            // contractAddress: "0x0669948a474547935c6e2744f312bf39c2bc3cbff45fa0c66a75be1a7b9b84e1".toLowerCase(),
            entrypoint: "executeSwap",
            calldata: compileCalldata({
                _tokenIn: commonTokenIn,
                _tokenOut: commonTokenOut,
                amount: {
                    type: "struct",
                    ...uint256.bnToUint256(amountInToken0)
                }
            })
        }

        // 1. Test without Starkswap
        // 2. Test with removed Starkswap Cairo Line of code one by one

        // NB : don't recompile
        Log.info("executeRawTx       : ", executeRawTx);
        const txSwap = await account.execute(executeRawTx);
        Log.info("txSwap.address       : ", txSwap.address);
        Log.info("txSwap.class_hash       : ", txSwap.class_hash);
        Log.info("txSwap.code       : ", txSwap.code);
        Log.info("txSwap.transaction_hash       : ", txSwap.transaction_hash);

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

    });

    it("should request a quote for a simple swap with DEX's commonly supported tokens", async function () {
        // ...
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
