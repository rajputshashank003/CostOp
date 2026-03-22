import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const useLanding = () => {
    const authContext = useContext(AuthContext);
    const isAuthenticated = authContext?.isAuthenticated;

    return {
        isAuthenticated,
    };
};

export default useLanding;
