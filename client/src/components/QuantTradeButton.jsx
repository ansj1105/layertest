import { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';

const QuantTradeButton = ({ amount, onTrade, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedTrade = useDebounce(1000); // 1초 디바운스

  const handleTrade = async () => {
    if (isLoading || disabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quant-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError('중복 요청입니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError(data.error || '거래 중 오류가 발생했습니다.');
        }
        return;
      }

      if (data.success) {
        onTrade?.(data);
        // 성공 후 버튼 비활성화 (추가 거래 방지)
        setTimeout(() => setIsLoading(false), 2000);
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      // 에러가 아닌 경우에만 로딩 상태 해제
      if (!error) {
        setTimeout(() => setIsLoading(false), 1000);
      }
    }
  };

  const debouncedHandleTrade = debouncedTrade(handleTrade);

  return (
    <div className="space-y-2">
      <button
        onClick={debouncedHandleTrade}
        disabled={isLoading || disabled}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isLoading || disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>거래 중...</span>
          </div>
        ) : (
          `거래 시작 (${amount} USDT)`
        )}
      </button>
      
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default QuantTradeButton; 