import utils from './utils';
import { METHODS } from '../constants';

export const categoriesApi = {
    get_all: () => {
        return utils.request({
            url: `/categories`,
            method: METHODS.GET,
            response_array: true
        });
    },
    create: (payload: { name: string }) => {
        return utils.request({
            url: `/categories`,
            method: METHODS.POST,
            data: payload
        });
    }
};
