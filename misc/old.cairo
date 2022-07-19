# struct QuoteAnswer:
#     member tokenIn : felt
#     member tokenOut : felt
#     member amountIn : felt
#     member amountOut : felt
#     member execution : SwapExec*
# end

struct SwapExec:
    member exchange : felt
    member amountIn : felt
    member next : SwapExec*
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    owner : felt, jediExchange : felt, starkswapExchange : felt
):
    exchangesLength.write(0)
    Ownable.initializer(owner)
    addExchange(jediExchange)  # Tmp
    addExchange(starkswapExchange)  # Tmp
    let (exchange) = getExchanges(0)
    assert exchange = jediExchange
    let (exchange) = getExchanges(1)
    assert exchange = starkswapExchange
    let (length) = exchangesLength.read()
    assert length = 2
    addExchange(starkswapExchange)  # Tmp
    return ()
end

if _tokenIn == tokenA:
    let (price) = IStarkSwapPair.get_input_price(pairAddress, _amountIn, reserveA, reserveB)  # Possible error with .low
    # let (part1, carry1) = uint256_mul(_amountIn, Uint256(10000, 0))
    # let (part2, carry2) = uint256_mul(price, Uint256(10000, 0)) // inutile en fait
    # let (res1, div) = uint256_signed_div_rem(part1, part2)
    return (price, _exchangeIndex)
else:
    let (price) = IStarkSwapPair.get_output_price(pairAddress, _amountIn, reserveA, reserveB)  # Possible error with .low
    # let (part1, carry1) = uint256_mul(_amountIn, Uint256(10000, 0))  # pb de decimals entre token In et token Out
    # let (part2, carry2) = uint256_mul(price, Uint256(10000, 0))
    # let (res2, div) = uint256_signed_div_rem(part1, part2)
    return (price, _exchangeIndex)
end
