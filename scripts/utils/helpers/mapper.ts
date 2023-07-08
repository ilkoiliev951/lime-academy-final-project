import {TokensBridgedResponseDTO} from "../dtos/TokensBridgedResponseDTO";


export function mapBurnEventsToUserTransferredResponse (events, result) {
    if (events) {
        events.map(event => result.push(new TokensBridgedResponseDTO(
            event.tokenSymbol,
            event.tokenAddress,
            event.amount,
            event.userAddress,
            event.chainId,
            '11155111',
            event.timestamp,
            event.releasedOnSource
        )));
    }
}

export function mapLockEventsToUserTransferredResponse (events, result) {
    if (events) {
        events.map(event => result.push(new TokensBridgedResponseDTO(
            event.tokenSymbol,
            event.tokenAddress,
            event.amount,
            event.userAddress,
            event.chainId,
            '5',
            event.timestamp,
            event.claimedOnTarget
        )));
    }
}