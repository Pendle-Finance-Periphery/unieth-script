import { PENDLE_POOL_ADDRESSES } from "./consts.js";
import os from "os"

export type ShareMapping = Record<string, bigint>;

export function isPendleAddress(addr: string) {
    addr = addr.toLowerCase();
    return addr == PENDLE_POOL_ADDRESSES.SY ||
        addr == PENDLE_POOL_ADDRESSES.YT ||
        PENDLE_POOL_ADDRESSES.LPs.some((lp) => lp.address == addr);
}

// @TODO: to modify this when liquid lockers launch
export function isLiquidLockerAddress(addr: string) {
    addr = addr.toLowerCase();
    return PENDLE_POOL_ADDRESSES.LIQUID_LOCKERS.some((liquidLockerInfo) => liquidLockerInfo.address == addr);
}

export function getUnixTimestamp(date: Date) {
    return Math.floor(date.getTime() / 1000);
}

export function getSumShareMapping(...shareMappings: ShareMapping[]): ShareMapping {
    const result: ShareMapping = {};
    for (const shareMapping of shareMappings) {
        for (const [addr, share] of Object.entries(shareMapping)) {
            result[addr] = (result[addr] || 0n) + share;
        }
    }
    return result;
}

export function isSentioInternalError(err: any): boolean {
    if (
      err.code === os.constants.errno.ECONNRESET ||
      err.code === os.constants.errno.ECONNREFUSED ||
      err.code === os.constants.errno.ECONNABORTED ||
      err.toString().includes('ECONNREFUSED') ||
      err.toString().includes('ECONNRESET') ||
      err.toString().includes('ECONNABORTED')
    ) {
      return true;
    }
    return false;
  }
  