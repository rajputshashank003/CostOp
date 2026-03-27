import utils from './utils';
import { METHODS } from '../constants';

export const usersApi = {
    get_profile_subscriptions: () => {
        return utils.request({ url: `/users/profile/subscriptions`, method: METHODS.GET });
    },
    onboard: (data: { team_name: string; designation: string }) => {
        return utils.request({ url: `/users/onboard`, method: METHODS.PATCH, data });
    },
};
