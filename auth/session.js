const logUserAccess = require('../middlewares/logUserAccess');

router.get("/me", logUserAccess, (req, res) => {
  console.log("🔍 요청 쿠키:", req.headers.cookie);
  console.log("🔍 세션 객체:", req.session);
  console.log("🔍 세션 사용자:", req.session.user);
  if (req.session.user) {
    return res.json({ user: req.session.user });
  } else {
    return res.status(401).json({ error: "unauthenticated" });
  }
});
