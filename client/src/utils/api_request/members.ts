import utils from './utils';

export const membersApi = {
    get_all: () => {
        return utils.request({
            url: `/members`,
            method: 'GET'
        });
    },
    invite: (email: string) => {
        return utils.request({
            url: `/members/invite`,
            method: 'POST',
            data: { email }
        });
    },
    revoke: (id: string | number) => {
        return utils.request({
            url: `/members/invite/${id}`,
            method: 'DELETE'
        });
    }
};
