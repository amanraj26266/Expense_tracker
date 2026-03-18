import { apiRequest } from './http';

export async function getUsersApi(token) {
  const payload = await apiRequest('/api/users', { token });
  return payload.users || [];
}

export async function createUserApi(token, { name, email, password, role }) {
  const payload = await apiRequest('/api/users', {
    method: 'POST',
    token,
    body: { name, email, password, role },
  });
  return payload.user;
}
