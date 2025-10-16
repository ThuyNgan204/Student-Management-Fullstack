const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker/locale/vi');

const prisma = new PrismaClient();
const truncate = (str, max) => (str ? String(str).slice(0, max) : null);

async function main() {
  console.log("Seeding database...");

  // Xóa dữ liệu cũ
  await prisma.grades.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.class_section.deleteMany();
  await prisma.major_courses.deleteMany();
  await prisma.courses.deleteMany();
  await prisma.user_account.deleteMany();
  await prisma.students.deleteMany();
  await prisma.academic_class.deleteMany();
  await prisma.lecturers.deleteMany();
  await prisma.majors.deleteMany();
  await prisma.departments.deleteMany();

  // Reset sequence
  await prisma.$executeRawUnsafe(`
    DO $$ DECLARE
        seq RECORD;
    BEGIN
        FOR seq IN
            SELECT sequence_name FROM information_schema.sequences
            WHERE sequence_schema = 'public'
        LOOP
            EXECUTE 'ALTER SEQUENCE "' || seq.sequence_name || '" RESTART WITH 1';
        END LOOP;
    END $$;
  `);

  console.log("Database cleared and sequences reset!");

  const STUDENT_STATUS = ["Đang học", "Bảo lưu", "Tốt nghiệp", "Thôi học"];
  const ENROLLMENT_STATUS = ["Đang học", "Hủy", "Hoàn thành"];
  const SEMESTER_OPTIONS = ["1", "2", "Hè"];
  const GENDER_OPTIONS = ["Nam", "Nữ"];

  // ===== Departments =====
  const departmentsData = [
    { code: "CNTT", name: "Công nghệ thông tin" },
    { code: "KT", name: "Kinh tế" },
    { code: "QT", name: "Quản trị" },
    { code: "DL", name: "Du lịch" },
    { code: "NN", name: "Ngôn ngữ" },
  ];
  const departments = await Promise.all(
    departmentsData.map((d) =>
      prisma.departments.create({
        data: {
          department_code: truncate(d.code, 20),
          department_name: truncate(d.name, 100),
        },
      })
    )
  );

  // ===== Majors =====
  const majorsData = [
    ["CNTT", "Công nghệ thông tin", 0],
    ["HTTT", "Hệ thống thông tin", 0],
    ["KT", "Kế toán", 1],
    ["TC", "Tài chính", 1],
    ["QT", "Quản trị kinh doanh", 2],
    ["MK", "Marketing", 2],
    ["DLT", "Du lịch", 3],
    ["KH", "Khách sạn", 3],
    ["TA", "Tiếng Anh", 4],
    ["TQ", "Tiếng Trung", 4],
  ];
  const majors = await Promise.all(
    majorsData.map(([code, name, depIdx]) =>
      prisma.majors.create({
        data: {
          major_code: truncate(code, 20),
          major_name: truncate(name, 100),
          department_id: departments[depIdx].department_id,
        },
      })
    )
  );

  // ===== Lecturers =====
  const lecturerNames = [
    ["Nguyễn Văn", "An", "Nam"],
    ["Trần Thị", "Bình", "Nữ"],
    ["Lê Minh", "Cường", "Nam"],
    ["Phạm Thị", "Dung", "Nữ"],
    ["Hoàng Văn", "Hưng", "Nam"],
    ["Đặng Thị", "Lan", "Nữ"],
    ["Vũ Minh", "Quân", "Nam"],
    ["Bùi Thị", "Nga", "Nữ"],
    ["Ngô Văn", "Phúc", "Nam"],
    ["Đỗ Thị", "Hoa", "Nữ"],
  ];
  const lecturers = [];
  for (let i = 0; i < lecturerNames.length; i++) {
    const [first, last, gen] = lecturerNames[i];
    const l = await prisma.lecturers.create({
      data: {
        lecturer_code: `GV${i + 1}`,
        first_name: last,
        last_name: first,
        gender: gen,
        department_id: departments[i % departments.length].department_id,
        email: `gv${i + 1}@university.edu.vn`,
        phone: `09${faker.number.int({ min: 10000000, max: 99999999 })}`,
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
        position: "Giảng viên",
      },
    });
    lecturers.push(l);
  }

  // ===== Academic Classes =====
  const academicClasses = [];
  let classCount = 1;
  for (const major of majors) {
    const nClass = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < nClass; i++) {
      const c = await prisma.academic_class.create({
        data: {
          class_code: `${major.major_code}${String(classCount).padStart(2, "0")}`,
          class_name: `${major.major_name} Lớp ${classCount}`,
          cohort: "2023",
          major_id: major.major_id,
          lecturer_id: lecturers[faker.number.int({ min: 0, max: lecturers.length - 1 })].lecturer_id,
        },
      });
      academicClasses.push(c);
      classCount++;
    }
  }

  // ===== Students =====
  const students = [];
  for (let i = 1; i <= 70; i++) {
    const gender = faker.helpers.arrayElement(GENDER_OPTIONS);

    // ✅ Name Fix (Họ + Tên đệm + Tên chính chuẩn Việt Nam)
    const fullFirstName = faker.person.firstName(); // Ví dụ "Ánh Dương"
    const parts = fullFirstName.split(" ");

    const firstNameVN = parts[parts.length - 1]; // Dương
    const middleNameVN = parts.slice(0, -1).join(" "); // Ánh

    const lastName = faker.person.lastName(); // Nguyễn
    const lastWithMiddle = middleNameVN ? `${lastName} ${middleNameVN}` : lastName; // Nguyễn Ánh

    const major = majors[i % majors.length];
    const classCandidates = academicClasses.filter((c) => c.major_id === major.major_id);
    const academicClassId = classCandidates.length
      ? classCandidates[faker.number.int({ min: 0, max: classCandidates.length - 1 })].academic_class_id
      : null;

    const student = await prisma.students.create({
      data: {
        student_code: `SV${String(i).padStart(3, "0")}`,
        first_name: firstNameVN,        // "Dương"
        last_name: lastWithMiddle,      // "Nguyễn Ánh"
        gender,
        dob: faker.date.birthdate({ min: 18, max: 23, mode: "age" }),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
        phone: `09${faker.number.int({ min: 10000000, max: 99999999 })}`,
        email: `sv${i}@student.university.edu.vn`,
        cohort: "2023",
        status: faker.helpers.arrayElement(STUDENT_STATUS),
        major_id: major.major_id,
        academic_class_id: academicClassId,
      },
    });
    students.push(student);
  }

  // ===== Courses =====
  const courseNames = [
    "Cơ sở dữ liệu",
    "Lập trình web",
    "Mạng máy tính",
    "Kế toán tài chính",
    "Marketing căn bản",
  ];
  const courses = [];
  const usedCodes = new Set();

  for (const dep of departments) {
    for (let i = 0; i < 2; i++) {
      let code;
      do {
        code = `${dep.department_code}C${faker.number.int({ min: 1, max: 99 })}`;
      } while (usedCodes.has(code));
      usedCodes.add(code);

      const c = await prisma.courses.create({
        data: {
          course_code: code,
          course_name: faker.helpers.arrayElement(courseNames),
          credits: 3,
          department_id: dep.department_id,
        },
      });
      courses.push(c);
    }
  }

  // ===== NEW: Major-Courses (liên kết majors ↔ courses) =====
  const majorCourses = [];
  for (const major of majors) {
    // Mỗi major học 2-3 môn trong cùng khoa
    const deptCourses = courses.filter(c => c.department_id === major.department_id);
    const selectedCourses = faker.helpers.arrayElements(deptCourses, faker.number.int({ min: 2, max: 3 }));

    for (const course of selectedCourses) {
      const mc = await prisma.major_courses.create({
        data: {
          major_id: major.major_id,
          course_id: course.course_id,
        },
      });
      majorCourses.push(mc);
    }
  }

  // ===== Class Sections =====
  const classSections = [];
  for (const course of courses) {
    const count = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < count; i++) {
      const section = await prisma.class_section.create({
        data: {
          section_code: `${course.course_code}-S${i + 1}`,
          academic_year: "2023-2024",
          semester: faker.helpers.arrayElement(SEMESTER_OPTIONS),
          course_id: course.course_id,
          lecturer_id: lecturers[faker.number.int({ min: 0, max: lecturers.length - 1 })].lecturer_id,
          capacity: 30,
          start_date: new Date("2023-09-01"),
          end_date: new Date("2024-01-15"),
        },
      });
      classSections.push(section);
    }
  }

  // ===== Enrollment + Grades =====
  for (const student of students) {
    const nEnroll = faker.number.int({ min: 3, max: 4 });
    const shuffledSections = faker.helpers.shuffle(classSections);
    for (let i = 0; i < nEnroll; i++) {
      const sec = shuffledSections[i % shuffledSections.length];
      const enrollment = await prisma.enrollment.create({
        data: {
          student_id: student.student_id,
          class_section_id: sec.class_section_id,
          status: faker.helpers.arrayElement(ENROLLMENT_STATUS),
        },
      });
      const attendance_score = faker.number.float({ min: 0, max: 10, precision: 0.1 });
      const midterm_score = faker.number.float({ min: 0, max: 10, precision: 0.1 });
      const assignment_score = faker.number.float({ min: 0, max: 10, precision: 0.1 });
      const final_score = faker.number.float({ min: 0, max: 10, precision: 0.1 });
      const total_score = parseFloat(
        (attendance_score * 0.1 + assignment_score * 0.2 + midterm_score * 0.3 + final_score * 0.4).toFixed(1)
      );
      let letter = total_score >= 8.5 ? "A" : total_score >= 7 ? "B" : total_score >= 5.5 ? "C" : total_score >= 4 ? "D" : "F";
      await prisma.grades.create({
        data: {
          enrollment_id: enrollment.enrollment_id,
          attendance_score,
          midterm_score,
          assignment_score,
          final_score,
          total_score,
          letter_grade: letter,
          status: total_score >= 5 ? "Đạt" : "Trượt",
        },
      });
    }
  }

 // ===== User Accounts =====
for (const student of students) {
  await prisma.user_account.create({
    data: {
      username: student.student_code,
      password: student.student_code, // Mật khẩu = mã SV
      role: "Sinh viên",
      student_id: student.student_id,
      is_active: true,
    },
  });
}

for (const lecturer of lecturers) {
  await prisma.user_account.create({
    data: {
      username: lecturer.lecturer_code,
      password: lecturer.lecturer_code, // Mật khẩu = mã GV
      role: "Giảng viên",
      lecturer_id: lecturer.lecturer_id,
      is_active: true,
    },
  });
}

// ===== Admin Account =====
await prisma.user_account.create({
  data: {
    username: "admin",
    password: "admin123",
    role: "admin",
    is_active: true,
  },
});

console.log("✅ Seeding finished!");
}

main().finally(() => prisma.$disconnect());
