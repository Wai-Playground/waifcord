// author = shokkunn

/**
 * Misc utilities
 */
export default class StageUtilitiesClass {
    public static async stringDirectedAt(str: string) {
        const sentEndings = /[.!?]/;
        const splitSent = str.split(sentEndings).map(s => s.trim()).filter(s => s.length > 0);
    }
}