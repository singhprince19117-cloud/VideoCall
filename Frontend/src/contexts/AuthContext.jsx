import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

// Use the clean, explicit base URL path
const client = axios.create({
    baseURL: "http://localhost:3000/api/v1/users"
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const router = useNavigate();

    const handleRegister = async (name, userName, password) => {
        try {
            // Match the precise relative path format
            let request = await client.post("/register", { name, userName, password });
            if (request.status === httpStatus.CREATED) return request.data.message;
        } catch (err) { throw err; }
    };

    const handleLogin = async (userName, password) => {
        try {
            // Match the precise relative path format
            let request = await client.post("/login", { userName, password });

            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                if (request.data.user) setUserData(request.data.user);
                router("/home");
            }
        } catch (err) { throw err; }
    };

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            return request.data;
        } catch (err) { throw err; }
    };

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", { meeting_code: meetingCode }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            return request.data;
        } catch (e) { throw e; }
    };

    const data = { userData, setUserData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin };

    return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};