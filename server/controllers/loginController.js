const login = (req, res, next) => {
  // TODO: authenticate using active directory
  req.session.username = req.body.username;
  console.log(req.session);
  res.status(200).json(req.session.username);
};

module.exports = {
  login,
};
