/** `#rgb` / `#rrggbb` / `rgb(r, g, b)` → channels; `null` when the syntax is unknown. */
export function parseRgb(color: string): [number, number, number] | null {
    const value = color.trim();
    if (value.startsWith('#')) {
        const hex = value.slice(1);
        const full = hex.length === 3 ? hex.replace(/./g, char => char + char) : hex;
        if (!/^[0-9a-f]{6}$/i.test(full)) return null;
        return [0, 2, 4].map(offset => parseInt(full.slice(offset, offset + 2), 16)) as [
            number,
            number,
            number
        ];
    }
    const channels = value.match(/\d+/g);
    return channels && channels.length >= 3
        ? [Number(channels[0]), Number(channels[1]), Number(channels[2])]
        : null;
}

/** Perceived brightness of a resolved theme colour — the presets only use near-black or near-white. */
export function isLightColor(color: string): boolean {
    const rgb = parseRgb(color);
    if (!rgb) return true;
    return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000 > 128;
}
