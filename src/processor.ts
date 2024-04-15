import { ERC20Processor } from '@sentio/sdk/eth/builtin'
import { PENDLE_POOL_ADDRESSES, CONFIG, MISC_CONSTS } from './consts.js'
import { handleSYTransfer, takeSYSnapshot } from './handlers/SY.js'
import { PendleYieldTokenProcessor } from './types/eth/pendleyieldtoken.js'
import { handleYTTransfer, takeYTSnapshot } from './handlers/YT.js'
import { PendleMarketProcessor, getPendleMarketContractOnContext } from './types/eth/pendlemarket.js'
import { addLpUsers, handleLPTransfer, takeLPSnapshot } from './handlers/LP.js'
import { EQBBaseRewardProcessor } from './types/eth/eqbbasereward.js'
import { GLOBAL_CONFIG } from "@sentio/runtime";
import { getSumShareMapping, getUnixTimestamp } from './helper.js'

GLOBAL_CONFIG.execution = {
  sequential: true,
};

ERC20Processor.bind({
  address: PENDLE_POOL_ADDRESSES.SY,
  startBlock: PENDLE_POOL_ADDRESSES.START_BLOCK,
  name: "Pendle Pool SY",
  network: CONFIG.BLOCKCHAIN
}).onEventTransfer(async (evt, ctx) => {
  await handleSYTransfer(evt, ctx);
})


PendleYieldTokenProcessor.bind({
  address: PENDLE_POOL_ADDRESSES.YT,
  startBlock: PENDLE_POOL_ADDRESSES.START_BLOCK,
  name: "Pendle Pool YT",
  network: CONFIG.BLOCKCHAIN

}).onEventTransfer(async (evt, ctx) => {
  await handleYTTransfer(evt, ctx);
}).onTimeInterval(async (blk, ctx) => {
  const timestamp = getUnixTimestamp(ctx.timestamp);
  const userShares = getSumShareMapping(
    await takeSYSnapshot(ctx),
    await takeYTSnapshot(ctx),
    ...await Promise.all(PENDLE_POOL_ADDRESSES.LPs.map(async (lp) => {
      if (ctx.blockNumber < lp.startBlock) return {};
      return await takeLPSnapshot(ctx, lp.address);
    }))
  );

  for (const user in userShares) {
    ctx.eventLogger.emit("UserDailyShare", {
      user,
      share: userShares[user],
      recordedAt: timestamp,
    })
  }
}, CONFIG.SNAPSHOT_FREQUENCY);

for (let LP of PENDLE_POOL_ADDRESSES.LPs) {
  PendleMarketProcessor.bind({
    address: LP.address,
    startBlock: LP.startBlock,
    name: "Pendle Pool LP",
    network: CONFIG.BLOCKCHAIN
  }).onEventTransfer(async (evt, ctx) => {
    await handleLPTransfer(evt, ctx);
  })
}


for (let eqbStaking of PENDLE_POOL_ADDRESSES.EQB_STAKING) {
  EQBBaseRewardProcessor.bind({
    address: eqbStaking,
    name: "Equilibria Base Reward",
    network: CONFIG.BLOCKCHAIN
  }).onEventStaked(async (evt, ctx) => {
    await addLpUsers(evt.args._user);
  })
}

for (let penpieReceiptToken of PENDLE_POOL_ADDRESSES.PENPIE_RECEIPT_TOKENS) {
  ERC20Processor.bind({
    address: penpieReceiptToken,
    name: "Penpie Receipt Token",
    network: CONFIG.BLOCKCHAIN
  }).onEventTransfer(async (evt, ctx) => {
    await addLpUsers(evt.args.from);
    await addLpUsers(evt.args.to);
  });
}

