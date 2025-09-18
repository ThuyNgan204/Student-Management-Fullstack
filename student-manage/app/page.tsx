export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ul className="space-y-2">
        <li><a href="/students" className="text-blue-600 hover:underline">Quản lý Sinh viên</a></li>
        <li><a href="/teachers" className="text-blue-600 hover:underline">Quản lý Giảng viên</a></li>
        <li><a href="/courses" className="text-blue-600 hover:underline">Quản lý Môn học</a></li>
        {/* ... */}
      </ul>
    </div>
  );
}
