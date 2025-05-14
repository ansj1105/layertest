export default function NotificationPopup({ list, onClose }) {
  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-white rounded shadow-lg z-50 w-96 max-w-full p-4 space-y-4 border">
      <h3 className="text-lg font-bold border-b pb-2">📢 시스템 알림</h3>
      {list.map(item => (
        <div key={item.id} className="border-b pb-2 mb-2">
          <h4 className="font-semibold">{item.title}</h4>
          <p className="text-sm text-gray-700">{item.content}</p>
        </div>
      ))}
      <button
        className="w-full mt-2 bg-red-500 text-white py-1 rounded hover:bg-red-600"
        onClick={onClose}
      >
        닫기
      </button>
    </div>
  );
}
