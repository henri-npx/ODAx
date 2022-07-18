import BN from "bn.js";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract, uint256 } from 'starknet';
import fs from 'fs';


/** 15 min */
export const TIMEOUT = 900_000;

export const Pow6 = BigInt(10) ** BigInt(6)
export const Pow18 = BigInt(10) ** BigInt(18)

export type ExpectedEnvType = NodeJS.ProcessEnv & {
    ALCHEMY_ETHEREUM_GOERLI: string;
    INFURA_STARKNET_MAINNET: string;
    INFURA_STARKNET_GOERLI: string;
    STARKNET_MAINNET_ACCOUNT_ADDRESS: string;
    STARKNET_MAINNET_ACCOUNT_PRIVATE_KEY: string;
};

export interface PairData {
    reserve0: BN;
    reserve1: BN;
    token0: string;
    token1: string;
    decimalsToken0: number;
    decimalsToken1: number;
}
export interface Uint256 {
    low: BigNumberish;
    high: BigNumberish;
}

export interface Token {
    name: string;
    address: string;
    decimals: number;
}


// const StarkSwap_LAN_BAR_LP_Address = "0x04c0139b643f42b32711a7fa870cb66ff15396181e6ff1693e7dc5390f8e73a1"
// const StarkSwap_LAN_Address = "0x03bbfc5f909187acae55466ccd89b60fdbefa7f9e2cc6c36476b77c522548175"
// const StarkSwap_BAR_Address = "0x06262afee0366ca716347bde824f1a6a81937f59be15ae261ea0b76018ba9c6c"
// const StarkSwap_ETH_Address = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
// const StarkSwap_DAI_Address = "0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9"
// const StarkSwap_WBTC_Address = "0x12d537dc323c439dc65c976fad242d5610d27cfb5f31689a0a319b8be7f3d56"
// const StarkSwap_USDC_Address = "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426"

export const DexTokens: Record<string, Token> = {
    "ether": {
        name: "ether",
        decimals: 18,
        address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
        // L1 Address : 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
    },
    "usdc": {
        name: "usdc",
        decimals: 6,
        address: "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426"
        // L1 Address : 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
    },
    "wbtc": {
        name: "wbtc",
        decimals: 8,
        address: "0x012d537dc323c439dc65c976fad242d5610d27cfb5f31689a0a319b8be7f3d56"
        // L1 Address : 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
    },
    "dai": {
        name: "dai",
        decimals: 18,
        address: "0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9"
        // L1 Address : 0x6B175474E89094C44Da98b954EedeAC495271d0F
    }
}

// Compare https://www.starkswap.co/app/pool/all with Jedi liquidity through voyager pool inspection

export const OK_TX_STATUSES = ["PENDING", "ACCEPTED_ON_L2", "ACCEPTED_ON_L1"];

export function expectFeeEstimationStructure(fee: any) {
    console.log("Estimated fee:", fee);
    expect(fee).to.haveOwnProperty("amount");
    expect(typeof fee.amount).to.equal("bigint");
    expect(fee.unit).to.equal("wei");
}

export function ensureEnvVar(varName: string): string {
    if (!process.env[varName]) {
        throw new Error(`Env var ${varName} not set or empty`);
    }
    return process.env[varName] as string;
}

export const getContract = (address: string, name: "./abis/Account.json" | "./abis/ERC20.json"): Contract => {
    const compiled = JSON.parse(
        fs.readFileSync(name).toString("ascii")
    );
    return new Contract(compiled.abi, address);
}

/**
 * Receives a hex address, converts it to bigint, converts it back to hex.
 * This is done to strip leading zeros.
 * @param address a hex string representation of an address
 * @returns an adapted hex string representation of the address
 */
function adaptAddress(address: string) {
    return "0x" + BigInt(address).toString(16);
}

/**
 * Expects address equality after adapting them.
 * @param actual
 * @param expected
 */
export function expectAddressEquality(actual: string, expected: string) {
    expect(adaptAddress(actual)).to.equal(adaptAddress(expected));
}

export const stringToHex = (str: string) => {
    //converting string into buffer
    let bufStr = Buffer.from(str, 'utf8');
    //with buffer, you can convert it into hex with following code
    return bufStr.toString('hex');

}

