import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3003;
export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-key-2026';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@jurixis.com.br';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin-secure-password-2026';
export const MAIL_DOMAIN = process.env.MAIL_DOMAIN || 'jurixis.com.br';
export const STALWART_API_URL = process.env.STALWART_API_URL || 'http://localhost:8080';
export const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL || '';
export const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || '';
