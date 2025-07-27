/**
 * PNG 이미지의 색상을 변경하는 함수
 * @param {string} imagePath - 이미지 경로
 * @param {string} targetColor - 변경할 색상 (예: "rgb(0 136 73)")
 * @param {string} outputPath - 출력 파일 경로
 */
function changeImageColor(imagePath, targetColor, outputPath) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function () {
            // Canvas 크기를 이미지 크기로 설정
            canvas.width = img.width;
            canvas.height = img.height;

            // 이미지를 Canvas에 그리기
            ctx.drawImage(img, 0, 0);

            // 이미지 데이터 가져오기
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // 목표 색상을 RGB 값으로 파싱
            const targetRGB = parseRGB(targetColor);

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

            // Canvas를 이미지로 변환
            canvas.toBlob((blob) => {
                // 파일로 저장 (브라우저 환경에서만 가능)
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = outputPath || 'envelope_modified.png';
                a.click();
                URL.revokeObjectURL(url);
                resolve('이미지 색상 변경 완료!');
            }, 'image/png');
        };

        img.onerror = function () {
            reject('이미지 로드 실패');
        };

        img.src = imagePath;
    });
}

/**
 * RGB 문자열을 객체로 파싱하는 함수
 * @param {string} rgbString - "rgb(r g b)" 형식의 문자열
 * @returns {object} RGB 객체
 */
function parseRGB(rgbString) {
    const match = rgbString.match(/rgb\((\d+)\s+(\d+)\s+(\d+)\)/);
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        };
    }
    throw new Error('잘못된 RGB 형식입니다. "rgb(r g b)" 형식을 사용해주세요.');
}

// 사용 예시
// changeImageColor('./envelope.png', 'rgb(0 136 73)', './envelope_modified.png')
//   .then(result => console.log(result))
//   .catch(error => console.error(error));

// Node.js 환경에서 사용할 경우 (파일 시스템 접근)
if (typeof window === 'undefined') {
    const fs = require('fs');
    const { createCanvas, loadImage } = require('canvas');

    async function changeImageColorNode(imagePath, targetColor, outputPath) {
        try {
            const canvas = createCanvas(0, 0);
            const ctx = canvas.getContext('2d');
            const img = await loadImage(imagePath);

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            const targetRGB = parseRGB(targetColor);

            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] > 0) {
                    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    if (brightness < 200) {
                        data[i] = targetRGB.r;
                        data[i + 1] = targetRGB.g;
                        data[i + 2] = targetRGB.b;
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);

            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(outputPath, buffer);

            console.log('이미지 색상 변경 완료!');
        } catch (error) {
            console.error('이미지 처리 중 오류:', error);
        }
    }

    // Node.js에서 실행
    // changeImageColorNode('./envelope.png', 'rgb(0 136 73)', './envelope_modified.png');
}

export { changeImageColor, parseRGB }; 