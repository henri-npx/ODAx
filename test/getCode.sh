export STARKNET_NETWORK=alpha-goerli
export STARKNET_WALLET=starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount
# https://www.cairo-lang.org/docs/hello_starknet/intro.html
# starknet get_code --contract_address "0x012b063b60553c91ed237d8905dff412fba830c5716b17821063176c6c073341"
starknet get_full_contract --contract_address "0x012b063b60553c91ed237d8905dff412fba830c5716b17821063176c6c073341"
