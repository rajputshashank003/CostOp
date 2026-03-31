import utils from './utils';
import { METHODS } from '../constants';

export const notificationsApi = {
    get_all: () => {
        return utils.request({ url: '/notifications', method: METHODS.GET });
    },
    mark_read: (id: number) => {
        return utils.request({ url: `/notifications/${id}/read`, method: METHODS.PATCH, show_error: false });
    },
    mark_all_read: () => {
        return utils.request({ url: '/notifications/read-all', method: METHODS.PATCH, show_error: false });
    },
    delete: (id: number) => {
        return utils.request({ url: `/notifications/${id}`, method: METHODS.DELETE, show_error: false });
    },
};
