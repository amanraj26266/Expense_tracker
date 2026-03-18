import { apiRequest } from './http';

export async function loginApi({ email, password }) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function registerCompanyApi({ companyName, adminName, email, password }) {
  return apiRequest('/api/auth/register-company', {
    method: 'POST',
    body: { companyName, adminName, email, password },
  });
}

export async function meApi(token) {
  return apiRequest('/api/auth/me', { token });
}
