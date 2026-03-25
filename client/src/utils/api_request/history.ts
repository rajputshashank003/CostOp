import utils from "./utils";

export const historyApi = {
    get_spends: async (months: number | "custom" = 6, start?: string, end?: string) => {
        const query = new URLSearchParams();
        query.append('months', months.toString());
        if (start) query.append('start', start);
        if (end) query.append('end', end);

        return utils.request({
            url: `/history/spends?${query.toString()}`,
            method: "GET",
        });
    },
    get_department_spends: async () => {
        return utils.request({
            url: `/history/department-spends`,
            method: "GET",
        });
    }
};
