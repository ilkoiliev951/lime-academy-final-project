export const COMMANDS = {
    LOCK:  'lock',
    CLAIM: 'claim',
    BURN: 'burn',
    RELEASE: 'release',
} as const;

type CommandKey = keyof typeof COMMANDS;

export const COMMAND_ELEMENT_COUNT_DICT: Record<CommandKey, number> = {
    LOCK: 7,
    CLAIM: 6,
    BURN: 5,
    RELEASE: 5,
};