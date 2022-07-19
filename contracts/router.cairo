%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.starknet.common.syscalls import call_contract
from starkware.cairo.common.uint256 import (
    Uint256,
    uint256_le,
    uint256_eq,
    uint256_mul,
    uint256_signed_div_rem,
)
from starkware.starknet.common.syscalls import (
    get_contract_address,
    get_caller_address,
    get_block_timestamp,
)

from contracts.ownable import Ownable

from contracts.erc20.IERC20 import IERC20
from contracts.dexes.jedi.IJediPair import IJediPair
from contracts.dexes.jedi.IJediRouter import IJediRouter
from contracts.dexes.jedi.IJediFactory import IJediFactory

from contracts.dexes.starkswap.IStarkSwapPair import IStarkSwapPair
from contracts.dexes.starkswap.IStarkSwapRouter import IStarkSwapRouter

from starkware.cairo.common.math_cmp import (
    is_in_range,
    is_le,
    is_le_felt,
    is_nn,
    is_nn_le,
    is_not_zero,
)

# Get number of exchange currently supported
@storage_var
func exchangesLength() -> (length : felt):
end

# Get an exchange address
@storage_var
func exchanges(_exchangeIndex : felt) -> (exchange : felt):
end

@external
func name{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (name : felt):
    return (68101120651031038211111711610111445118484649)  # "DexAggRouter-v0.1" ASCII Encoded
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    owner : felt, jediExchange : felt, starkswapExchange : felt
):
    exchangesLength.write(0)
    Ownable.initializer(owner)
    addExchange(jediExchange)  # Tmp
    addExchange(starkswapExchange)  # Tmp
    return ()
end

# >>>>> VIEW STORAGE <<<<<<

@view
func getExchangesLength{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    length : felt
):
    let (length) = exchangesLength.read()
    return (length)
end

@view
func getExchanges{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    _index : felt
) -> (exchange : felt):
    let (exchange) = exchanges.read(_index)
    return (exchange)
end

@view
func getOwner{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    owner : felt
):
    let (owner) = Ownable.owner()
    return (owner)
end

# >>>>> VIEW - COMPUTE <<<<<<

@view
func getStarkReserve{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    poolAddress : felt, tokenaddress : felt
) -> (reserve : Uint256):
    let (reserve) = IERC20.balanceOf(contract_address=tokenaddress, account=poolAddress)
    return (reserve)
end

@view
func getStarkReserve2{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    poolAddress : felt
) -> (reserve : Uint256):
    let (reserve) = IStarkSwapPair.poolTokenBalance(poolAddress, 2)
    return (reserve)
end

@view
func getStarkinputPrice2{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    poolAddress : felt, amount : Uint256
) -> (price : Uint256):
    let (reserve1) = IStarkSwapPair.poolTokenBalance(poolAddress, 1)
    let (reserve2) = IStarkSwapPair.poolTokenBalance(poolAddress, 2)
    let (price) = IStarkSwapPair.get_input_price(poolAddress, amount, reserve1, reserve2)
    return (price)
end

@external
func addExchange{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    _exchange : felt
):
    # Ownable.assert_only_owner()
    let (length) = exchangesLength.read()
    exchanges.write(length, _exchange)
    exchangesLength.write(length + 1)
    return ()
end

# Get amount out for one exchange
# Each exchange implement
@view
func getAmountOut{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    _exchangeIndex : felt, _tokenIn : felt, _tokenOut : felt, _amountIn : Uint256
) -> (amountOut : Uint256, exchangeIndex : felt):
    alloc_locals

    # JediSwap
    if _exchangeIndex == 0:
        let (addr) = exchanges.read(_exchangeIndex)
        let (factory) = IJediRouter.factory(contract_address=addr)
        # ToDo Return if null
        let (pair) = IJediFactory.get_pair(factory, _tokenIn, _tokenOut)
        let (reserve0, reserve1, block_timestamp_last) = IJediPair.get_reserves(
            contract_address=pair
        )
        let (res) = IJediRouter.get_amount_out(addr, _amountIn, reserve0, reserve1)
        return (res, _exchangeIndex)
    end
    # StarkSwap
    if _exchangeIndex == 1:
        let (local addr) = exchanges.read(_exchangeIndex)
        let (local pairAddress) = IStarkSwapRouter.getPair(addr, _tokenIn, _tokenOut)
        let (tokenA) = IStarkSwapPair.getTokenA(pairAddress)
        let reserveB : Uint256 = IStarkSwapPair.poolTokenBalance(pairAddress, 2)
        let reserveA : Uint256 = IStarkSwapPair.poolTokenBalance(pairAddress, 1)
        if _tokenIn == tokenA:
            let (price) = IStarkSwapPair.get_input_price(pairAddress, _amountIn, reserveA, reserveB)
            return (price, _exchangeIndex)
        else:
            let (price) = IStarkSwapPair.get_output_price(
                pairAddress, _amountIn, reserveA, reserveB
            )
            return (price, _exchangeIndex)
        end
    end

    # Error to Handle
    return (Uint256(0, 0), 0)
end

# AmountOut = Output, start at 0
# optimaLIndex = OptimaL Index, start at 0
# We use them to get keep the value accross multiple recursive calls that overwrite local memory
# _currentIndex : felt      : Index of the exchange
# _tokenIn : felt           : Token sold
# _tokenOut : felt          : Token bought
# _amountIn : Uint256       : Amout of token sold
# amountOut : Uint256       : Expected amout out
# optimaLIndex : felt       : Final return of best exchange

func _optimaLAmountOut{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    _currentIndex : felt,
    _tokenIn : felt,
    _tokenOut : felt,
    _amountIn : Uint256,
    amountOut : Uint256,
    optimaLIndex : felt,
) -> (amountOut : Uint256, exchangeIndex : felt):
    alloc_locals
    let (length) = exchangesLength.read()
    # We don't passe here at first call
    if _currentIndex == length:
        return (amountOut, optimaLIndex)
    end
    let (res, _exchangeIndex) = getAmountOut(_currentIndex, _tokenIn, _tokenOut, _amountIn)
    let (isExchangeOutputLower) = uint256_le(res, amountOut)
    if isExchangeOutputLower == 1:
        return _optimaLAmountOut(
            _currentIndex + 1, _tokenIn, _tokenOut, _amountIn, amountOut, optimaLIndex
        )  # res < amountOut
    else:
        return _optimaLAmountOut(
            _currentIndex + 1, _tokenIn, _tokenOut, _amountIn, res, _exchangeIndex
        )  # res > amountOut
    end
end

@view
func getOptimaLExchange{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    _tokenIn : felt, _tokenOut : felt, _amountIn : Uint256
) -> (amountOut : Uint256, exchangeIndex : felt):
    let (amountOut, exchangeIndex) = _optimaLAmountOut(
        0, _tokenIn, _tokenOut, _amountIn, Uint256(0, 0), 0
    )
    return (amountOut, exchangeIndex)
end

# >>>>> WRITE FUNCTIONS <<<<<

func _executeSwapOnExchange{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    _exchangeIndex : felt, _tokenIn : felt, _tokenOut : felt, _amountIn : Uint256
):
    alloc_locals

    tempvar syscall_ptr2 : felt* = syscall_ptr
    tempvar pedersen_ptr = pedersen_ptr
    tempvar range_check_ptr = range_check_ptr

    let (local exchange) = exchanges.read(_exchangeIndex)
    let (local success) = IERC20.approve(_tokenIn, exchange, _amountIn)
    let (local caller) = get_caller_address()

    let (block_timestamp) = get_block_timestamp()
    # %{ print(ids.current_block) %} # WTF We can print stuff ? See Discord
    # JediSwap
    if _exchangeIndex == 0:
        tempvar syscall_ptr = syscall_ptr
        tempvar pedersen_ptr = pedersen_ptr
        tempvar range_check_ptr = range_check_ptr

        let (swapPath : felt*) = alloc()
        assert swapPath[0] = _tokenIn
        assert swapPath[1] = _tokenOut
        IJediRouter.swap_exact_tokens_for_tokens(
            exchange, _amountIn, Uint256(42, 0), 2, swapPath, caller, block_timestamp + 4200000
        )
        tempvar syscall_ptr = syscall_ptr
        tempvar pedersen_ptr = pedersen_ptr
        tempvar range_check_ptr = range_check_ptr

        return ()
        # StarkSwap
    else:
        if _exchangeIndex == 1:
            tempvar syscall_ptr = syscall_ptr
            tempvar pedersen_ptr = pedersen_ptr
            tempvar range_check_ptr = range_check_ptr
            let (pairAddress) = IStarkSwapRouter.getPair(exchange, _tokenIn, _tokenOut)
            let (tokenA) = IStarkSwapPair.getTokenA(pairAddress)
            if _tokenIn == tokenA:
                tempvar syscall_ptr = syscall_ptr
                tempvar pedersen_ptr = pedersen_ptr
                tempvar range_check_ptr = range_check_ptr
                # Approve
                let (pairAddressA) = IStarkSwapRouter.getPair(exchange, _tokenIn, _tokenOut)
                let (local success) = IERC20.approve(_tokenIn, pairAddressA, _amountIn)
                # Execute
                IStarkSwapPair.exactTokenAtoMinTokenB(
                    pairAddressA, _amountIn, Uint256(1, 0), caller
                )
                return ()
            else:
                tempvar syscall_ptr = syscall_ptr
                tempvar pedersen_ptr = pedersen_ptr
                tempvar range_check_ptr = range_check_ptr
                # Approve
                let (pairAddressB) = IStarkSwapRouter.getPair(exchange, _tokenOut, _tokenIn)
                let (local success) = IERC20.approve(_tokenIn, pairAddressB, _amountIn)
                # Execute
                IStarkSwapPair.exactTokenBtoMinTokenA(
                    pairAddressB, _amountIn, Uint256(1, 0), caller
                )
                return ()
            end
        end
        return ()
    end
end

@external
func executeSwap{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    _tokenIn : felt, _tokenOut : felt, _amountIn : Uint256
):
    alloc_locals
    let (caller) = get_caller_address()
    let (contract_address) = get_contract_address()
    let (local success) = IERC20.transferFrom(_tokenIn, caller, contract_address, _amountIn)
    if success == 1:
        let (amountOut, exchangeIndex) = _optimaLAmountOut(
            0, _tokenIn, _tokenOut, _amountIn, Uint256(0, 0), 0
        )
        # let (isAmountOutZero) = uint256_eq(0, amountOut)
        # if isAmountOutZero == 0:
        _executeSwapOnExchange(exchangeIndex, _tokenIn, _tokenOut, _amountIn)
        # end
        return ()
    else:
        with_attr error_message("Transfer did not succeed"):
            assert success = 1
        end
    end
    return ()
end

@external
func transferOwnership{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    newOwner : felt
):
    Ownable.transfer_ownership(newOwner)
    return ()
end

@external
func renounceOwnership{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
    Ownable.renounce_ownership()
    return ()
end
