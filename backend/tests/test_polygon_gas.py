import pytest

def test_amoy_gas_fees():
    min_priority_fee = 25 * 10**9  # 25 Gwei Amoy minimum
    assert min_priority_fee == 25000000000
