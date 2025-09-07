import http from './http';

export function signup(payload) {
  // payload: {name?, email, password, role} -> match your SignUpRequestDto
  return http.post('/auth/signup', payload);
}

export function login(payload) {
  // backend returns { accessToken: '...' }; refresh cookie is set by server
  return http.post('/auth/login', payload);
}
