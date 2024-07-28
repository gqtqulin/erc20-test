import { GuideDAOToken } from "../typechain-types";

async function withDecimals(gui: GuideDAOToken, value: bigint): Promise<bigint> {
    return value * 10n ** await gui.decimals();
}

export {
    withDecimals
}