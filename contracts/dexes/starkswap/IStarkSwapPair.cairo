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

    func maxTokenAToExactTokenB(max_token_a_amount : felt, token_b_amount : felt, recipient : felt):
    end

    func exactTokenAToMinTokenB(token_a_amount : felt, min_token_b_amount : felt, recipient : felt):
    end

    func maxTokenBToExactTokenA(max_token_b_amount : felt, token_a_amount : felt, recipient : felt):
    end

    func exactTokenBToMinTokenA(token_b_amount : felt, min_token_a_amount : felt, recipient : felt):
    end
end
