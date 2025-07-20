const { exec } = require('child_process');

const sql = `
CREATE DATABASE IF NOT EXISTS vietcoin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'vietcoin'@'localhost' IDENTIFIED BY 'vietcoin1234!';
GRANT ALL PRIVILEGES ON vietcoin.* TO 'vietcoin'@'localhost';
FLUSH PRIVILEGES;
`;

exec(`mysql -u root -e "${sql}"`, (err, stdout, stderr) => {
    if (err) {
        console.error('❌ 실행 실패:', stderr);
        return;
    }
    console.log('✅ 성공:', stdout);
});
