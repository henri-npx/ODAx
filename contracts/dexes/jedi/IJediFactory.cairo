%lang starknet

from starkware.cairo.common.uint256 import Uint256

# https://bip.so/@meshfinance/Router-tAUIf/public

@contract_interface
namespace IJediFactory:
    func get_pair(token0 : felt, token1 : felt) -> (pair : felt):
    end

    func get_all_pairs() -> (all_pairs_len : felt, all_pairs : felt*):
    end
end
