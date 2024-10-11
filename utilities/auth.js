module.exports = {
  ensureAuth: (req, res, next) => {
    if (req.session.user === undefined) {
      res.status(401).json({ message: 'You are not authorized.' });
    } else {
      return next();
    }
  },
};
