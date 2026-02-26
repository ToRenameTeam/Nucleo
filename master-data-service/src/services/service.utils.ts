export function isValidResourceCode(code: string, prefix: string): boolean {
    const pattern = new RegExp(`^${prefix}-\\d{3}$`);
    return pattern.test(code);
}

export function formatEnumLabel(value: string): string {
    return value
        .split('_')
        .map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}