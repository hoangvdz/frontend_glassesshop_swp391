import { loginApi } from "../api/authApi"


export const login = async(email, password) => {
    const user = await loginApi(email, password);

    localStorage.setItem("currentUser", JSON.stringify(user));

    window.dispatchEvent(new Event("storage"));

    return user;
}