import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'pixel_secret_key');
    req.user = verified;
    req.admin = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token no válido' });
  }
};
