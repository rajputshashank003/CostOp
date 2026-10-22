import { METHODS } from '../constants';
import utils from './utils';

export const authApi = {
    verify_google_token: (credential: string, inviteToken?: string) => {
        return utils.request({
            url: `/auth/google`,
            method: METHODS.POST,
            data: { credential, invite_token: inviteToken }
        });
    },
    login_with_email: (email: string, password: string) => {
        return utils.request({
            url: `/auth/login`,
            method: METHODS.POST,
            data: { email, password }
        });
    },
    signup_with_email: (name: string, email: string, password: string, inviteToken?: string) => {
        return utils.request({
            url: `/auth/signup`,
            method: METHODS.POST,
            data: { name, email, password, invite_token: inviteToken }
        });
    }
};
