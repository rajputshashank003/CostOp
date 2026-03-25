import utils from './utils';

export const usersApi = {
    get_profile_subscriptions: () => {
        return utils.request({ url: `/users/profile/subscriptions`, method: 'GET' });
    }
};
