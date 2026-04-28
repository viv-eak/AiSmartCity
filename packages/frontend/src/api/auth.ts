import client from "./client";

export async function login(email: string, password: string) {
  const { data } = await client.post("/auth/login", { email, password });
  return data;
}

export async function register(name: string, email: string, password: string) {
  const { data } = await client.post("/auth/register", {
    name,
    email,
    password,
  });
  return data;
}
