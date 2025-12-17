const { PricingRule, Court, Equipment, Coach } = require('../models');

class PricingService {
    static async calculatePrice({ courtId, date, startTime, endTime, equipmentIds, coachId }) {
        const court = await Court.findById(courtId);
        if (!court) throw new Error('Court not found');

        let totalPrice = 0;
        const durationHours = this.calculateDuration(startTime, endTime);

        let hourlyRate = court.basePrice;

        // Apply Logic:
        // 1. Base Multipliers (Peak, Weekend)
        // 2. Adders (Equipment, Coach)

        const rules = await PricingRule.find({});
        const dayOfWeek = new Date(date).getDay(); // 0-6

        // Apply Multipliers first to the court base rate
        // Note: Logic allows stacking. E.g. Base * Peak * Weekend

        for (const rule of rules) {
            if (rule.adjustmentType === 'MULTIPLIER') {
                if (this.isRuleApplicable(rule, startTime, endTime, dayOfWeek, court.type)) {
                    hourlyRate *= rule.value;
                }
            }
        }

        totalPrice += hourlyRate * durationHours;

        // Apply Fixed Costs (Equipment)
        if (equipmentIds && equipmentIds.length > 0) {
            for (const item of equipmentIds) {
                // Assuming item is object { id, quantity } or just id
                // For simplified logic assuming passed ID exists
                const equipment = await Equipment.findById(item.item);
                if (equipment) {
                    totalPrice += equipment.price * (item.quantity || 1);
                }
            }
        }

        // Apply Coach
        if (coachId) {
            const coach = await Coach.findById(coachId);
            if (coach) {
                totalPrice += coach.hourlyRate * durationHours;
            }
        }

        // Apply Adders if any (Global surcharges? keeping simple for now)

        return Math.ceil(totalPrice); // Round up
    }

    static calculateDuration(start, end) {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        return (endH + endM / 60) - (startH + startM / 60);
    }

    static isRuleApplicable(rule, start, end, day, resourceType) {
        // Weekend Check
        if (rule.type === 'WEEKEND') {
            return rule.conditions.days.includes(day);
        }

        // Peak Hour Check (simplified: if ANY overlap, apply? or weighted? 
        // Spec says "Peak hours (6-9 PM) -> higher rate". 
        // Usually split billing is better, but for simplicity, let's say if start is in peak.
        // Or better: Checking overlap.

        if (rule.type === 'PEAK_HOUR') {
            const ruleStart = this.timeToDecimal(rule.conditions.startTime);
            const ruleEnd = this.timeToDecimal(rule.conditions.endTime);
            const slotStart = this.timeToDecimal(start);
            const slotEnd = this.timeToDecimal(end);

            // Check overlap
            return Math.max(ruleStart, slotStart) < Math.min(ruleEnd, slotEnd);
        }

        return false;
    }

    static timeToDecimal(time) {
        const [h, m] = time.split(':').map(Number);
        return h + m / 60;
    }
}

module.exports = PricingService;
