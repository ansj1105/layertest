const logUserAccess = require('../middlewares/logUserAccess');

router.get("/me", logUserAccess, (req, res) => {
  if (req.session.user) {
    return res.json({ user: req.session.user });
  } else {
    return res.status(401).json({ error: "unauthenticated" });
  }
});
