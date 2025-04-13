// auth/session.js
router.get("/me", (req, res) => {
    if (req.session.user) {
      return res.json({ user: req.session.user });
    } else {
      return res.status(401).json({ error: "unauthenticated" });
    }
  });
  