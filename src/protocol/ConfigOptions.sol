// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

library ConfigOptions {
    // NEVER EVER CHANGE THE ORDER OF THESE!
    // You can rename or append. But NEVER change the order.
    enum Addresses {
        ReignAdmin,
        ReignCoin,
        USDCToken,
        SeniorPool,
        PoolImplAddress,
        CollateralToken,
        OpportunityManager,
        InvestorContract,
        ReignTreasury,
        ReignKeeper,
        IdentityToken
    }

    enum Numbers {
        LeverageRatio,
        ReignFee,
        OverDueFee,
        JuniorSubpoolFee,
        SeniorPoolFundLockinMonths,
        WriteOffDays,
        AdjustmentOffset
    }
}
