import { changeImageColor } from './changeImageColor.js';

// envelope.png 색상을 rgb(0 136 73)로 변경
async function changeEnvelopeColor() {
    try {
        console.log('envelope.png 색상 변경 시작...');

        await changeImageColor(
            './envelope.png',           // 원본 이미지 경로
            'rgb(0 136 73)',          // 변경할 색상
            './envelope_green.png'     // 출력 파일명
        );

        console.log('✅ envelope.png 색상 변경 완료!');
    } catch (error) {
        console.error('❌ 색상 변경 실패:', error);
    }
}

// 브라우저에서 실행할 경우
if (typeof window !== 'undefined') {
    // 페이지 로드 후 실행
    window.addEventListener('load', () => {
        // 버튼 클릭 시 실행
        const button = document.createElement('button');
        button.textContent = 'Envelope 색상 변경';
        button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #008849;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      z-index: 1000;
    `;

        button.addEventListener('click', changeEnvelopeColor);
        document.body.appendChild(button);
    });
}

// Node.js에서 실행할 경우
if (typeof window === 'undefined') {
    const fs = require('fs');
    const path = require('path');

    // canvas 패키지가 설치되어 있는지 확인
    try {
        const { createCanvas, loadImage } = require('canvas');

        async function changeEnvelopeColorNode() {
            try {
                const canvas = createCanvas(0, 0);
                const ctx = canvas.getContext('2d');

                // 이미지 경로 확인
                const imagePath = path.join(__dirname, 'envelope.png');
                const outputPath = path.join(__dirname, 'envelope_green.png');

                if (!fs.existsSync(imagePath)) {
                    console.error('❌ envelope.png 파일을 찾을 수 없습니다.');
                    return;
                }

                console.log('envelope.png 색상 변경 시작...');

                const img = await loadImage(imagePath);

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // 목표 색상: rgb(0 136 73)
                const targetRGB = { r: 0, g: 136, b: 73 };

                // 각 픽셀의 색상 변경
                for (let i = 0; i < data.length; i += 4) {
                    // 알파값이 0이 아닌 픽셀만 처리 (투명하지 않은 픽셀)
                    if (data[i + 3] > 0) {
                        // 원본 색상이 어두운 경우에만 변경 (흰색 부분은 유지)
                        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        if (brightness < 200) { // 임계값 조정 가능
                            data[i] = targetRGB.r;     // Red
                            data[i + 1] = targetRGB.g; // Green
                            data[i + 2] = targetRGB.b; // Blue
                            // Alpha는 그대로 유지
                        }
                    }
                }

                // 변경된 이미지 데이터를 Canvas에 다시 그리기
                ctx.putImageData(imageData, 0, 0);

                // 파일로 저장
                const buffer = canvas.toBuffer('image/png');
                fs.writeFileSync(outputPath, buffer);

                console.log('✅ envelope.png 색상 변경 완료!');
                console.log(`📁 저장된 파일: ${outputPath}`);
            } catch (error) {
                console.error('❌ 이미지 처리 중 오류:', error);
            }
        }

        // 실행
        changeEnvelopeColorNode();

    } catch (error) {
        console.error('❌ canvas 패키지가 설치되지 않았습니다.');
        console.log('📦 설치 명령어: npm install canvas');
    }
}

export { changeEnvelopeColor }; 