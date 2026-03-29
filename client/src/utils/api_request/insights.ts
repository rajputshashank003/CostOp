import utils from './utils';
import { METHODS } from '../constants';

export const insightsApi = {
    getDuplicates: () => {
        return utils.request({
            url: `/insights/duplicates`,
            method: METHODS.GET,
            response_array: true,
        });
    },
    getUnusedSeats: () => {
        return utils.request({
            url: `/insights/unused-seats`,
            method: METHODS.GET,
            response_array: true,
        });
    },
};
