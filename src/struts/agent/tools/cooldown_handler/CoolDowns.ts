// author = shokkunn

export default class CooldownManager {
    private static cooldowns: Map<string, Map<string, number>> = new Map();

    /**
     * @name isOnCooldown
     * @param {string} userId the user id
     * @param {string} toolId the tool id
     * @returns {boolean} whether the user is on cooldown
     */
    public static isOnCooldown(userId: string, toolId: string): boolean {
        const userCooldowns = this.cooldowns.get(userId);
        if (!userCooldowns) return false;

        const expiry = userCooldowns.get(toolId);
        if (!expiry || expiry < Date.now()) {
            // remove expired cooldown
            userCooldowns.delete(toolId);
            return false;
        }

        return true;
    }

    /**
     * @name setCooldown
     * @param {string} userId the user id
     * @param {string} toolId the tool id
     * @param {number} durationMs the duration in milliseconds
     */
    public static setCooldown(userId: string, toolId: string, durationMs: number): void {
        let userCooldowns = this.cooldowns.get(userId);
        if (!userCooldowns) {
            userCooldowns = new Map();
            this.cooldowns.set(userId, userCooldowns);
        }
        
        userCooldowns.set(toolId, Date.now() + durationMs);
    }
}