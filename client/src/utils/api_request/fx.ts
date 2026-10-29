import utils from './utils';
import { METHODS } from '../constants';

export interface FxRates {
    base: 'USD';
    rates: Record<string, number>;
    source: 'live' | 'fallback';
    updated_at: string;
}

export const fxApi = {
    get_rates: (): Promise<FxRates> => {
        return utils.request({
            url: '/fx/rates',
            method: METHODS.GET,
            show_error: false,
        });
    },
};
