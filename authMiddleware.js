// authMiddleware.js
const {jwtDecode} = require('jwt-decode');

function getUserIdFromToken(authorizationHeader) {
    try {
      // Ensure authorizationHeader is a string
      if (typeof authorizationHeader !== 'string') {
        throw new Error('Authorization header is not a string');
      }
  
      const tokenParts = authorizationHeader.trim().split(' ');
  
      // Ensure the correct format of the authorization header
      if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        throw new Error('Invalid format of the authorization header');
      }
  
      const token = tokenParts[1];
  
      // Decode the token and return the userId
      const decodedToken = jwtDecode(token);
      return decodedToken.userId;
    } catch (error) {
      console.error('Error in getUserIdFromToken:', error.message);
      throw new Error('Error decoding token');
    }
  }

  
function jwtMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  try {
    const userId = getUserIdFromToken(authHeader);
    req.userId = userId; // Attach the userId to the request object for later use
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { jwtMiddleware, getUserIdFromToken };
