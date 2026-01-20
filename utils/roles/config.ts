
import { GovernmentType, GovConfig } from '../../types';

export const GOV_CONFIGS: Record<GovernmentType, GovConfig> = {
    left: { tax: 0.25, welfare: 0.30, interest: 0.10, rentIVA: 0.30 },
    right: { tax: -0.20, welfare: -0.30, interest: 0, rentIVA: 0.30 },
    authoritarian: { tax: 0.10, welfare: -0.20, interest: 0.05, rentIVA: 0.30 },
    libertarian: { tax: -1, welfare: 0, interest: -0.05, rentIVA: 0 },
    anarchy: { tax: 0, welfare: 0, interest: 0, rentIVA: 0 }
};
