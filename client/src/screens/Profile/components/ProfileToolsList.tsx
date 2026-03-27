import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import map from "lodash/map";
import SubscriptionCard from "../../Home/components/SubscriptionCard";

interface ProfileToolsListProps {
    subscriptions: any[];
    isLoading: boolean;
}

const ProfileToolsList = ({ subscriptions, isLoading }: ProfileToolsListProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {map([1, 2, 3], i => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 h-48 animate-pulse border border-slate-200"></div>
                ))}
            </div>
        );
    }

    if (subscriptions.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <Layers size={32} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-2">No Assigned Tools</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                    You haven't been assigned any software seats yet. When you are added to a team or organization tool, it will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {map(subscriptions, (sub) => (
                <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <SubscriptionCard
                        sub={sub}
                        onArchiveClick={() => { }}
                        onAssignClick={() => { }}
                        isProfileView={true}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default ProfileToolsList;
