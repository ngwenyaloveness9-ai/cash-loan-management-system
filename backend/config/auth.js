module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'super_secret_key',
  jwtExpiresIn: '1d'
};
