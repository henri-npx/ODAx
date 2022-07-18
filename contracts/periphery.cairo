%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256

from contracts.erc20.IERC20 import IERC20
from contracts.dexes.jedi.IJediPair import IJediPair
from contracts.dexes.jedi.IJediRouter import IJediRouter
from contracts.dexes.jedi.IJediFactory import IJediFactory

@storage_var
func routerJedi() -> (router : felt):
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    routerJediSwap : felt
):
    routerJedi.write(routerJediSwap)
    return ()
end

@view
func getJediPairs{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    all_pairs_len : felt, all_pairs : felt*
):
    let (router) = routerJedi.read()
    let (factory) = IJediRouter.factory(router)
    let (all_pairs_len, all_pairs) = IJediFactory.get_all_pairs(factory)
    return (all_pairs_len, all_pairs)
end

@view
func getJediPairInfo{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    pair : felt
) -> (
    reserve0 : Uint256,
    reserve1 : Uint256,
    token0 : felt,
    token1 : felt,
    decimals0 : felt,
    decimals1 : felt,
):
    let (reserve0, reserve1, block_timestamp_last) = IJediPair.get_reserves(pair)
    let (token0) = IJediPair.token0(pair)
    let (token1) = IJediPair.token1(pair)
    let (decimals0) = IERC20.decimals(token0)
    let (decimals1) = IERC20.decimals(token1)
    return (reserve0, reserve1, token0, token1, decimals0, decimals1)
end
