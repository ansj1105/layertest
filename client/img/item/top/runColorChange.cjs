#!/usr/bin/env node

// envelope.png 색상을 rgb(0 136 73)로 변경하는 실행 스크립트

const fs = require('fs');
const path = require('path');

// canvas 패키지 설치 확인 및 설치
function checkAndInstallCanvas() {
    try {
        require('canvas');
        console.log('✅ canvas 패키지가 이미 설치되어 있습니다.');
        return true;
    } catch (error) {
        console.log('📦 canvas 패키지를 설치합니다...');
        const { execSync } = require('child_process');
        try {
            execSync('npm install canvas', { stdio: 'inherit' });
            console.log('✅ canvas 패키지 설치 완료!');
            return true;
        } catch (installError) {
            console.error('❌ canvas 패키지 설치 실패:', installError.message);
            return false;
        }
    }
}

// 이미지 색상 변경 함수 (개선된 알고리즘)
async function changeEnvelopeColor() {
    try {
        const { createCanvas, loadImage } = require('canvas');

        // 파일 경로 설정
        const imagePath = path.join(__dirname, 'envelope.png');
        const outputPath = path.join(__dirname, 'envelope_green.png');

        // 원본 파일 존재 확인
        if (!fs.existsSync(imagePath)) {
            console.error('❌ envelope.png 파일을 찾을 수 없습니다.');
            console.log(`📁 찾는 경로: ${imagePath}`);
            return;
        }

        console.log('🎨 envelope.png 색상 변경 시작...');
        console.log(`📁 원본 파일: ${imagePath}`);
        console.log(`📁 출력 파일: ${outputPath}`);

        const canvas = createCanvas(0, 0);
        const ctx = canvas.getContext('2d');

        const img = await loadImage(imagePath);

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // 목표 색상: rgb(0 136 73)
        const targetRGB = { r: 0, g: 136, b: 73 };

        let changedPixels = 0;
        let totalPixels = 0;

        // 각 픽셀의 색상 변경 (개선된 알고리즘)
        for (let i = 0; i < data.length; i += 4) {
            // 알파값이 0이 아닌 픽셀만 처리 (투명하지 않은 픽셀)
            if (data[i + 3] > 0) {
                totalPixels++;

                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // 밝기 계산
                const brightness = (r + g + b) / 3;

                // 색상 변경 조건 개선
                // 1. 완전히 흰색이 아닌 픽셀 (RGB 모두 255가 아닌 경우)
                // 2. 밝기가 240 미만인 픽셀 (더 많은 픽셀 포함)
                // 3. 또는 원본이 회색 계열인 픽셀
                const isNotWhite = !(r === 255 && g === 255 && b === 255);
                const isDarkEnough = brightness < 240;
                const isGrayish = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30;

                if (isNotWhite && (isDarkEnough || isGrayish)) {
                    // 색상 변경 방식 개선
                    // 원본 색상의 밝기를 유지하면서 목표 색상으로 변경
                    const originalBrightness = brightness / 255;

                    data[i] = Math.round(targetRGB.r * originalBrightness);     // Red
                    data[i + 1] = Math.round(targetRGB.g * originalBrightness); // Green
                    data[i + 2] = Math.round(targetRGB.b * originalBrightness); // Blue
                    // Alpha는 그대로 유지

                    changedPixels++;
                }
            }
        }

        // 변경된 이미지 데이터를 Canvas에 다시 그리기
        ctx.putImageData(imageData, 0, 0);

        // 파일로 저장
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);

        console.log('✅ envelope.png 색상 변경 완료!');
        console.log(`📊 총 픽셀 수: ${totalPixels}`);
        console.log(`📊 변경된 픽셀 수: ${changedPixels}`);
        console.log(`📊 변경 비율: ${((changedPixels / totalPixels) * 100).toFixed(2)}%`);
        console.log(`📁 저장된 파일: ${outputPath}`);
        console.log(`🎨 변경된 색상: rgb(${targetRGB.r} ${targetRGB.g} ${targetRGB.b})`);

    } catch (error) {
        console.error('❌ 이미지 처리 중 오류:', error);
    }
}

// 메인 실행 함수
async function main() {
    console.log('🚀 envelope.png 색상 변경 도구 시작');
    console.log('='.repeat(50));

    // canvas 패키지 확인 및 설치
    if (!checkAndInstallCanvas()) {
        console.error('❌ canvas 패키지 설치에 실패했습니다.');
        process.exit(1);
    }

    // 색상 변경 실행
    await changeEnvelopeColor();

    console.log('='.repeat(50));
    console.log('🎉 작업 완료!');
}

// 스크립트 실행
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { changeEnvelopeColor }; 