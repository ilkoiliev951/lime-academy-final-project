export const COMMANDS = {
    LOCK:  'lock',
    CLAIM: 'claim',
    BURN: 'burn',
    RELEASE: 'release',
} as const;

type CommandKey = keyof typeof COMMANDS;

export const COMMAND_ELEMENT_COUNT_DICT: Record<CommandKey, number> = {
    LOCK: 4,
    CLAIM: 5, // stands for mint
    BURN: 4,
    RELEASE: 5,
};