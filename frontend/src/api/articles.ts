import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL ?? "http://127.0.0.1:3002",
  withCredentials: true,
});

export async function getTitles(): Promise<string[]> {
  const { data } = await api.get("/titles");
  return data;
}
