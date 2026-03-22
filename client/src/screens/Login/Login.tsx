import LoginBranding from "./components/LoginBranding";
import LoginBox from "./components/LoginBox";
import LoginContext from "./context";
import useLogin from "./useLogin";

const LoginComp = () => {
    return (
        <div className="flex min-h-screen bg-white">
            <LoginBranding />
            <LoginBox />
        </div>
    );
};

export default function Login() {
    const value = useLogin();
    return (
        <LoginContext.Provider value={value}>
            <LoginComp />
        </LoginContext.Provider>
    );
}
