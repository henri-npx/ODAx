%lang starknet

@contract_interface
namespace IStarkSwapRouter:
    func getPair(token_a_address : felt, token_b_address : felt) -> (pair : felt):
    end
    func allPairs(index : felt) -> (pair : felt):
    end
    func allPairsLength() -> (all_pairs_length : felt):
    end
    # func getAllPairs() -> (felt*):
    # end
end
