const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 데이터베이스 연결 설정
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vietcoin'
};

async function createTables() {
    let connection;

    try {
        // 데이터베이스 연결
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        // 데이터베이스 생성
        await connection.execute('CREATE DATABASE IF NOT EXISTS vietcoin');
        console.log('✅ 데이터베이스 생성 완료');

        // vietcoin 데이터베이스 사용
        await connection.execute('USE vietcoin');

        // SQL 파일들 읽기
        const sqlDir = __dirname;
        const files = fs.readdirSync(sqlDir).filter(f => f.endsWith('.sql')).sort();

        for (const file of files) {
            try {
                const filePath = path.join(sqlDir, file);
                const sqlContent = fs.readFileSync(filePath, 'utf8');

                // SQL 문장들을 분리하여 실행
                const statements = sqlContent
                    .split(';')
                    .map(stmt => stmt.trim())
                    .filter(stmt => stmt.length > 0);

                for (const statement of statements) {
                    if (statement.trim()) {
                        await connection.execute(statement);
                    }
                }

                console.log(`✅ ${file} 실행 완료`);
            } catch (error) {
                console.error(`❌ ${file} 실패:`, error.message);
            }
        }

    } catch (error) {
        console.error('데이터베이스 연결 오류:', error.message);
        console.log('\n💡 해결 방법:');
        console.log('1. XAMPP를 설치하고 MySQL을 시작하세요');
        console.log('2. 또는 MySQL을 설치하고 PATH에 등록하세요');
        console.log('3. 데이터베이스 연결 정보를 확인하세요');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createTables(); 