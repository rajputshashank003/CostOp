import utils from './utils';

export const authApi = {
    verify_google_token: (credential: string, inviteToken?: string) => {
        return utils.request({
            url: `/auth/google`,
            method: 'POST',
            data: { credential, invite_token: inviteToken }
        });
    }
};
