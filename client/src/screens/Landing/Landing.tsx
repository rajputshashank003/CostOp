import LandingHeader from "./components/LandingHeader";
import HeroSection from "./components/HeroSection";
import CostWorkflow from "./components/CostWorkflow";
import FeaturesGrid from "./components/FeaturesGrid";
import LandingFooter from "./components/LandingFooter";
import LandingContext from "./context";
import useLanding from "./useLanding";

const LandingComp = () => {
    return (
        <div className="min-h-screen bg-emerald-50 text-slate-900 overflow-x-hidden">
            <LandingHeader />

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <HeroSection />
                <CostWorkflow />
                <FeaturesGrid />
            </main>

            <LandingFooter />
        </div>
    );
};

export default function Landing() {
    const value = useLanding();
    return (
        <LandingContext.Provider value={value}>
            <LandingComp />
        </LandingContext.Provider>
    );
}
