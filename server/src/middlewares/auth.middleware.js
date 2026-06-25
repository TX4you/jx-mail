import jwt from 'jsonwebtoken';
import { JWT_SECRET, KEYCLOAK_BASE_URL, KEYCLOAK_REALM } from '../config/env.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no Token.' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatado.' });
  }

  // 1. Try Keycloak authentication if configured
  if (KEYCLOAK_BASE_URL && KEYCLOAK_REALM) {
    try {
      const userInfoUrl = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
      const response = await fetch(userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userInfo = await response.json();
        req.user = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name || userInfo.preferred_username || userInfo.email,
          provider: 'keycloak'
        };
        return next();
      }
    } catch (err) {
      console.warn('Keycloak auth failed, falling back to local JWT:', err.message);
    }
  }

  // 2. Fallback to local JWT authentication
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || 'Administrador',
      provider: 'local'
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};
export default authenticate;
