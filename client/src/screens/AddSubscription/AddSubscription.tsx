import { useContext } from "react";
import AddSubscriptionContext from "./context";
import useAddSubscriptions from "./useAddSubscriptions";
import FormHeader from "./components/FormHeader";
import ToolDetailsCard from "./components/ToolDetailsCard";
import ScopeAndPlanCard from "./components/ScopeAndPlanCard";
import AccessConfigCard from "./components/AccessConfigCard";
import DatePicker from "../../components/DatePicker/DatePicker";

const AddSubscriptionComp = () => {
    const {
        navigate,
        originRequest,
        isRequestMode,
        isLoading,
        formData,
        setFormData,
        categories,
        isAddingCategory,
        setIsAddingCategory,
        newCategoryName,
        setNewCategoryName,
        teams,
        isAddingTeam,
        setIsAddingTeam,
        newTeamName,
        setNewTeamName,
        availableMembers,
        filteredMembers,
        designationFilter,
        setDesignationFilter,
        handleChange,
        handleCategoryChange,
        handleAddNewCategory,
        handleTeamChange,
        handleAddNewTeam,
        toggleUserAssignment,
        handleSelectAllVisible,
        handleSubmit,
    } = useContext(AddSubscriptionContext);

    return (
        <div className="max-w-4xl mx-auto pb-12 pt-4 px-4">
            <FormHeader isRequestMode={isRequestMode} originRequest={originRequest} />

            <form onSubmit={handleSubmit} className="space-y-6">

                <ToolDetailsCard
                    formData={formData}
                    categories={categories}
                    isAddingCategory={isAddingCategory}
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                    setIsAddingCategory={setIsAddingCategory}
                    setFormData={setFormData}
                    handleChange={handleChange}
                    handleCategoryChange={handleCategoryChange}
                    handleAddNewCategory={handleAddNewCategory}
                />

                <ScopeAndPlanCard
                    formData={formData}
                    teams={teams}
                    isAddingTeam={isAddingTeam}
                    newTeamName={newTeamName}
                    setNewTeamName={setNewTeamName}
                    setIsAddingTeam={setIsAddingTeam}
                    setFormData={setFormData}
                    handleTeamChange={handleTeamChange}
                    handleAddNewTeam={handleAddNewTeam}
                />

                <AccessConfigCard
                    formData={formData}
                    filteredMembers={filteredMembers}
                    designationFilter={designationFilter}
                    setDesignationFilter={setDesignationFilter}
                    setFormData={setFormData}
                    toggleUserAssignment={toggleUserAssignment}
                    handleSelectAllVisible={handleSelectAllVisible}
                />

                {/* START DATE */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold">
                        <DatePicker
                            value={formData.start_date}
                            onChange={(d) => setFormData((p: any) => ({ ...p, start_date: d }))}
                        />
                    </div>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                    {formData.pricing_model === "per_seat" &&
                        formData.access_type === "all_members" &&
                        availableMembers.length > formData.seat_count && !isRequestMode ? (
                        <button type="button" disabled className="px-8 py-3 bg-slate-200 text-slate-400 cursor-not-allowed font-bold rounded-xl flex items-center justify-center min-w-[180px]">
                            Not Enough Seats
                        </button>
                    ) : (
                        <button type="submit" disabled={isLoading} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center min-w-[180px]">
                            {isLoading
                                ? <span className="w-5 h-5 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin" />
                                : isRequestMode ? "Submit Request" : "Track Subscription"
                            }
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

const AddSubscription = () => {
    const value = useAddSubscriptions();

    return (
        <AddSubscriptionContext.Provider value={value}>
            <AddSubscriptionComp />
        </AddSubscriptionContext.Provider>
    );
};

export default AddSubscription;