import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');
  console.log(token);

  try {
    // promisify, transforma uma função que precisa de callback para utilizar
    // async await
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    console.log(decoded);

    req.userId = decoded.id; // Id do user autenticado
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
