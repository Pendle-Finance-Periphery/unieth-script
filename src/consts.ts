import { EthChainId } from '@sentio/sdk/eth'



export const MISC_CONSTS = {
    ONE_E18: BigInt("1000000000000000000"),
    ONE_DAY_IN_MINUTE: 60 * 24,
    ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
    MULTICALL_BATCH: 250,
}

export const CONFIG = {
    BLOCKCHAIN: EthChainId.ETHEREUM,
    SNAPSHOT_FREQUENCY: 24 * 60, // 1 day in minute
}

export const PENDLE_POOL_ADDRESSES = {
    SY: "0xc430db19339a3051192233b4c49f9ab3dc6d16b7",
    YT: "0x5ae176bbcb9a4461aeeeb97c90c2a80c2078006a",
    LPs: [
        {
            address: "0xbce250b572955c044c0c4e75b2fa8016c12cabf9",
            startBlock: 19289158,
        },
        {
            address: "0x38100a480dbed278b0fe57ba80a75498a7dc5bb1",
            startBlock: 19537421
        }     
    ],
    START_BLOCK: 19289158,
    TREASURY: "0x8270400d528c34e1596ef367eedec99080a1b592",
    PENPIE_RECEIPT_TOKENS: [
        "0x8bd67dd27c379de76753e2e552f4614b0ae4327a",
        "0xb86f1ee5094e1ae3fec9c7d9ce61e5deaed7e3c2",
    ],
    EQB_STAKING: [
        "0x59802239640d082d030cd45854a142e2f696545e",
        "0x4e7322911261afe0b9e89d47fc249c148330c2af",
    ],
    MULTICALL: "0xca11bde05977b3631167028862be2a173976ca11",
    LIQUID_LOCKERS: [
        {
            // penpie
            address: "0x6e799758cee75dae3d84e09d40dc416ecf713652",
            receiptToken: "0xb86f1ee5094e1ae3fec9c7d9ce61e5deaed7e3c2",
        },
        {
            // equilibira
            address: "0x64627901dadb46ed7f275fd4fc87d086cff1e6e3",
            receiptToken: "0x59802239640d082d030cd45854a142e2f696545e",
        },
        {
            // penpie
            address: "0x6e799758cee75dae3d84e09d40dc416ecf713652",
            receiptToken: "0x8bd67dd27c379de76753e2e552f4614b0ae4327a",
        },
        {
            // equilibira
            address: "0x64627901dadb46ed7f275fd4fc87d086cff1e6e3",
            receiptToken: "0x4e7322911261afe0b9e89d47fc249c148330c2af",
        }
    ]
}