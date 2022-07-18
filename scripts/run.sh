source ./.env
echo $INFURA_STARKNET_MAINNET
echo $INFURA_STARKNET_GOERLI
curl $INFURA_STARKNET_MAINNET -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"starknet_blockNumber","params":[],"id":1}'

# https://docs.infura.io/infura/networks/starknet/how-to
# https://docs.infura.io/infura/networks/starknet/json-rpc-methods
