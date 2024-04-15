import { EthContext } from "@sentio/sdk/eth";
import { getMulticallContractOnContext, Multicall2 } from "./types/eth/multicall.js";
import { MISC_CONSTS, PENDLE_POOL_ADDRESSES } from "./consts.js";
import { getERC20ContractOnContext } from "@sentio/sdk/eth/builtin/erc20";
import { getPendleMarketContractOnContext } from "./types/eth/pendlemarket.js";
import { getPendleYieldTokenContractOnContext } from "./types/eth/pendleyieldtoken.js";

export async function readAllUserActiveBalances(
    ctx: EthContext,
    lpAddress: string,
    allAddresses: string[]
): Promise<bigint[]> {
    const multicall = getMulticallContractOnContext(
        ctx,
        PENDLE_POOL_ADDRESSES.MULTICALL
    );
    const market = getPendleMarketContractOnContext(
        ctx,
        lpAddress
    );

    const allCalls: Promise<Multicall2.ResultStructOutput[]>[] = [];
    for (let i = 0; i < allAddresses.length; i += MISC_CONSTS.MULTICALL_BATCH) {
        const batch = allAddresses.slice(i, i + MISC_CONSTS.MULTICALL_BATCH);
        const calls = batch.map((address) => {
            return {
                target: market.address,
                callData: market.rawContract.interface.encodeFunctionData(
                    "activeBalance",
                    [address]
                ),
            };
        });
        allCalls.push(multicall.callStatic.tryAggregate(true, calls));
    }

    const callOutputs = (await Promise.all(allCalls)).flat();
    return callOutputs.map((d) => {
        return BigInt(d.returnData);
    });
}

export async function readAllUserERC20Balances(
    ctx: EthContext,
    allAddresses: string[],
    tokenAddress: string
): Promise<bigint[]> {
    const multicall = getMulticallContractOnContext(
        ctx,
        PENDLE_POOL_ADDRESSES.MULTICALL
    );
    const erc20 = getERC20ContractOnContext(ctx, tokenAddress);
    const allCalls: Promise<Multicall2.ResultStructOutput[]>[] = [];
    for (let i = 0; i < allAddresses.length; i += MISC_CONSTS.MULTICALL_BATCH) {
        const batch = allAddresses.slice(i, i + MISC_CONSTS.MULTICALL_BATCH);
        const calls = batch.map((address) => {
            return {
                target: erc20.address,
                callData: erc20.rawContract.interface.encodeFunctionData("balanceOf", [
                    address,
                ]),
            };
        });
        allCalls.push(multicall.callStatic.tryAggregate(true, calls));
    }
    const callOutputs = (await Promise.all(allCalls)).flat();
    return callOutputs.map((d) => {
        return BigInt(d.returnData);
    });
}

export async function readAllYTPositions(ctx: EthContext, allUserAddresses: string[]): Promise<{
    lastPYIndex: bigint;
    accruedInterest: bigint;
}[]> {

    const multicall = getMulticallContractOnContext(
        ctx,
        PENDLE_POOL_ADDRESSES.MULTICALL
    );
    const yt = getPendleYieldTokenContractOnContext(ctx, PENDLE_POOL_ADDRESSES.YT);
    const allCalls: Promise<Multicall2.ResultStructOutput[]>[] = [];
    for (let i = 0; i < allUserAddresses.length; i += MISC_CONSTS.MULTICALL_BATCH) {
        const batch = allUserAddresses.slice(i, i + MISC_CONSTS.MULTICALL_BATCH);
        const calls = batch.map((address) => {
            return {
                target: yt.address,
                callData: yt.rawContract.interface.encodeFunctionData("userInterest", [address]),
            };
        });
        allCalls.push(multicall.callStatic.tryAggregate(true, calls));
    }
    const callOutputs = (await Promise.all(allCalls)).flat();
    return callOutputs.map((d) => {
        const data = yt.rawContract.interface.decodeFunctionResult("userInterest", d.returnData);
        return {
            lastPYIndex: BigInt(data[0]),
            accruedInterest: BigInt(data[1]),
        };
    })
}