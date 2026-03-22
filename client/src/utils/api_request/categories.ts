import utils from './utils';

export const categoriesApi = {
    get_all: () => {
        return utils.request({
            url: `/categories`,
            method: 'GET',
            response_array: true
        });
    },
    create: (payload: { name: string }) => {
        return utils.request({
            url: `/categories`,
            method: 'POST',
            data: payload
        });
    }
};
