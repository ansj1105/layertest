const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SQL_DIR = __dirname; // 현재 .js와 같은 디렉토리
const MYSQL_USER = 'root';
const MYSQL_PASSWORD = ''; // 공백 비밀번호

const files = fs.readdirSync(SQL_DIR).filter(f => f.endsWith('.sql')).sort();

files.forEach(file => {
    const filePath = path.join(SQL_DIR, file);
    const cmd = MYSQL_PASSWORD
        ? `mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} < "${filePath}"`
        : `mysql -u ${MYSQL_USER} < "${filePath}"`;

    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(`❌ ${file} 실패:`, stderr);
        } else {
            console.log(`✅ ${file} 실행 완료`);
        }
    });
});
