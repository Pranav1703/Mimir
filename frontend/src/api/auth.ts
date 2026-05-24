import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL ?? "http://127.0.0.1:3002",
  withCredentials: true,
});

export interface User {
  username: string;
}

export async function login(username: string, password: string): Promise<User> {
  const { data } = await api.post("/user/login", { username, password });
  return { username: data.user };
}

export async function signup(username: string, password: string): Promise<void> {
  await api.post("/user/signup", { username, password });
}

export async function logout(): Promise<void> {
  await api.post("/user/logout");
}

export async function getMe(): Promise<User> {
  const { data } = await api.get("/user/me");
  return { username: data.username };
}
