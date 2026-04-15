import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
});

export async function getCollection() {
    const response = await api.get("/collection");
    return response.data.releases ?? [];
}

export async function getWantlist() {
    const response = await api.get("/wantlist");
    return response.data.releases ?? [];
}

export default api;
