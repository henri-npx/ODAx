%lang starknet

from starkware.cairo.common.uint256 import Uint256, uint256_le, uint256_eq

@contract_interface
namespace IStarkSwapPair:
    func getTokenA() -> (tokenA : felt):
    end

    func getTokenB() -> (tokenB : felt):
    end

    func get_input_price(
        token1_amount : Uint256, token1_reserve : Uint256, token2_reserve : Uint256
    ) -> (res : Uint256):
    end

    func get_output_price(
        token2_amount : Uint256, token1_reserve : Uint256, token2_reserve : Uint256
    ) -> (res : Uint256):
    end

    func poolTokenBalance(token_id : felt) -> (balance : Uint256):
    end

    func maxTokenAtoExactTokenB(
        max_token_a_amount : Uint256, token_b_amount : Uint256, recipient : felt
    ):
    end

    func exactTokenAtoMinTokenB(
        token_a_amount : Uint256, min_token_b_amount : Uint256, recipient : felt
    ):
    end

    func maxTokenBtoExactTokenA(
        max_token_b_amount : Uint256, token_a_amount : Uint256, recipient : felt
    ):
    end

    func exactTokenBtoMinTokenA(
        token_b_amount : Uint256, min_token_a_amount : Uint256, recipient : felt
    ):
    end
end
