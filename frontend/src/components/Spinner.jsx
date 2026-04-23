export default function Spinner({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  );
}