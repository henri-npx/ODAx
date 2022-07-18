import { HardhatUserConfig } from "hardhat/types";
import { task } from "hardhat/config";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@shardlabs/starknet-hardhat-plugin";
import "@typechain/starknet";
import { ExpectedEnvType } from "./test/helpers";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
const env = process.env as ExpectedEnvType;

const config: HardhatUserConfig = {
	// defaultNetwork: "hardhat",
	solidity: {
		version: "0.8.4",
		settings: {
			optimizer: {
				enabled: true,
				runs: 100,
			},
		},
	},
	starknet: {
		dockerizedVersion: "0.9.0", // alternatively choose one of the two venv options below
		// uses (my-venv) defined by `python -m venv path/to/my-venv`
		// venv: "path/to/my-venv",

		// uses the currently active Python environment (hopefully with available Starknet commands!)
		// venv: "active",
		network: "integrated-devnet",
		wallets: {
			OpenZeppelin: {
				accountName: "OpenZeppelin",
				modulePath:
					"starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount",
				accountPath: "~/.starknet_accounts",
			},
		},
	},
	networks: {
		devnet: {
			url: "http://127.0.0.1:5050",
		},
		integratedDevnet: {
			url: "http://127.0.0.1:5050",
			// venv: "active",
			// dockerizedVersion: "<DEVNET_VERSION>",
		},
		hardhat: {},
	},

	// mocha: {
	// 	bail: false,
	// 	timeout: "600s",
	// },
	typechain: {
		outDir: "typechain"
	}
};

export default config;
