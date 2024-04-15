# Pendle Sentio Balance Snapshot

## Methodology

Pendle system wraps `UniETH (BedRock ETH)` into an ERC5115 token `SY`.

`SY` can then be used in Pendle's system to:
- Tokenize into `PT` and `YT`, where `YT` holders are entitled to all interests and rewards.
- Supply into Pendle's AMM to receive `LP` token.

`LP` token can then be deposited into Liquid Lockers platform (Penpie, Equilibira, StakeDAO) to enhance their yield.

## Set up 

All configurations for the market can be found in `/src/consts.ts`.

```ts
export const CONFIG = {
    BLOCKCHAIN: EthChainId.ETHEREUM,
    SNAPSHOT_FREQUENCY: 24 * 60, // 1 day in minute
}

export const PENDLE_POOL_ADDRESSES = {
    SY: "0xac0047886a985071476a1186be89222659970d65",
    YT: "0xfb35fd0095dd1096b1ca49ad44d8c5812a201677",
    LP: "0xf32e58f92e60f4b0a37a69b95d642a471365eae8",
    START_BLOCK: 18969500,
    ...
}
```

## Usage

User snapshot for the configured frequency is recorded `Event Log` tab of Sentio project, which can be fetched/viewed in `Data Studio` with a simple SQL query. 

An easy way to do get the latest result of user snapshot is to use this query:

```sql
select user, share,  block_number  from `UserDailyShare` where  block_number = (select max( block_number ) from `UserDailyShare`)
```

Please note that Sentio processor might be unstable, causing delay in data processing. It's necessary to check if the latest blocknumber fits your expectation.