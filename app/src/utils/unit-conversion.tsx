export function bigIntToFloatString(value: bigint): string {
    return (Number(value)/100).toFixed(2);
}

export function numberToFloatString(value: number): string {
    return (value/100).toFixed(2);
}

export function bigIntToFloat(value: bigint): number {
    return parseFloat((Number(value)/100).toFixed(2));
}
