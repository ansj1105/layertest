const db = require('../db');
module.exports = async function logUserAccess(req, res, next) {
  if (req.session?.user) {
    const userId = req.session.user.id;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await db.user_access_logs.create({
      user_id: userId,
      ip_address: ip,
      user_agent: userAgent,
    });
    try {
        await db.query(
          'INSERT INTO user_access_logs (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
          [userId, ip, req.headers['user-agent']]
        );
      } catch (err) {
        console.error("❌ 접속 기록 저장 실패:", err.message);
      }
    // 최근 24시간 내 중복 로그인 기록 확인
    const logs = await db.user_access_logs.findAll({
      where: {
        user_id: userId,
        created_at: { [db.Sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      group: ['ip_address', 'user_agent'],
    });

    if (logs.length > 3) {
      req.session.user.is_suspicious = true; // 위험 계정으로 마킹
    }
  }

  next();
};
