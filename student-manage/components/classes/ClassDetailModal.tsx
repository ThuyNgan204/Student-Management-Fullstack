export default function ClassDetail({ academicClass }: any) {
  return (
    <div className="space-y-2">
      <p><b>Tên lớp:</b> {academicClass.class_name}</p>
      <p><b>Mã lớp:</b> {academicClass.class_code}</p>
      <p><b>Niên khóa:</b> {academicClass.cohort}</p>
      <p><b>Ngành học:</b> {academicClass.majors?.major_name ?? "N/A"}</p>
      <p>
        <b>Giảng viên phụ trách:</b>{" "}
        {academicClass.lecturers
          ? `${academicClass.lecturers.last_name} ${academicClass.lecturers.first_name}`
          : "Chưa phân công"}
      </p>
    </div>
  );
}
