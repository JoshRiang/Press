import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('Not authorized, token missing');
      err.statusCode = 401;
      throw err;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user_id = decoded.user_id;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      const error = new Error('Not authorized, invalid token');
      error.statusCode = 401;
      next(error);
      return;
    }
    next(err);
  }
};
