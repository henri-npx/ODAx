%lang starknet

@contract_interface
namespace IStarkSwapPair:
    func getTokenA() -> (tokenA : felt):
    end

    func getTokenB() -> (tokenB : felt):
    end

    func get_input_price(token1_amount : felt, token1_reserve : felt, token2_reserve : felt) -> (
        res : felt
    ):
    end

    func get_output_price(token2_amount : felt, token1_reserve : felt, token2_reserve : felt) -> (
        res : felt
    ):
    end

    func poolTokenBalance(token_id : felt) -> (balance : felt):
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
