import utils from './utils';

export const metricsApi = {
    get_summary: () => {
        return utils.request({
            url: `/metrics`,
            method: 'GET'
        });
    }
};
