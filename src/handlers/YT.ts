import { AsyncNedb } from "nedb-async";
import {
  PendleYieldTokenContext,
  TransferEvent,
} from "../types/eth/pendleyieldtoken.js";
import { MISC_CONSTS, PENDLE_POOL_ADDRESSES } from "../consts.js";
import { ShareMapping } from "../helper.js";
import { readAllUserERC20Balances, readAllYTPositions } from "../multicall.js";
import { EthContext } from "@sentio/sdk/eth";

const db = new AsyncNedb({
  filename: "/data/pendle-accounts-yt.db",
  autoload: true,
});

type AccountSnapshot = {
  _id: string;
};

db.persistence.setAutocompactionInterval(60 * 1000);

export async function handleYTTransfer(
  evt: TransferEvent,
  _: PendleYieldTokenContext
) {
  for (let addr of [evt.args.from, evt.args.to]) {
    const newSnapshot: AccountSnapshot = {
      _id: addr.toLowerCase(),
    };
    await db.asyncUpdate({ _id: newSnapshot._id }, newSnapshot, { upsert: true });
  }
}

export async function takeYTSnapshot(ctx: EthContext): Promise<ShareMapping> {
  const allUsers = (await db.asyncFind<AccountSnapshot>({})).map((x) => x._id);
  const [allYTBalances, allYTDatas] = await Promise.all([
    readAllUserERC20Balances(ctx, allUsers, PENDLE_POOL_ADDRESSES.YT),
    readAllYTPositions(ctx, allUsers)
  ])
  const result: ShareMapping = {};
  const treasury = PENDLE_POOL_ADDRESSES.TREASURY;

  for (let i = 0; i < allUsers.length; i++) {
    if (allUsers[i] === MISC_CONSTS.ZERO_ADDRESS) {
      continue;
    }

    if (allYTDatas[i].lastPYIndex === 0n) {
      continue;
    }

    const impliedSy = allYTBalances[i] * MISC_CONSTS.ONE_E18 / allYTDatas[i].lastPYIndex + allYTDatas[i].accruedInterest;
    const feeShare = impliedSy * 3n / 100n;
    result[allUsers[i]] = impliedSy - feeShare;

    result[treasury] = result[treasury] || 0n;
    result[treasury] += feeShare;
  }
  return result;
}