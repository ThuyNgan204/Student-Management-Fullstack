-- CreateTable
CREATE TABLE "public"."academic_class" (
    "academic_class_id" SERIAL NOT NULL,
    "class_code" VARCHAR(20) NOT NULL,
    "class_name" VARCHAR(100) NOT NULL,
    "cohort" VARCHAR(10) NOT NULL,
    "major_id" INTEGER NOT NULL,
    "lecturer_id" INTEGER,

    CONSTRAINT "academic_class_pkey" PRIMARY KEY ("academic_class_id")
);

-- CreateTable
CREATE TABLE "public"."class_section" (
    "class_section_id" SERIAL NOT NULL,
    "section_code" VARCHAR(30) NOT NULL,
    "academic_year" VARCHAR(20) NOT NULL,
    "semester" VARCHAR(10) NOT NULL,
    "course_id" INTEGER NOT NULL,
    "lecturer_id" INTEGER,
    "capacity" INTEGER NOT NULL,
    "start_date" DATE,
    "end_date" DATE,

    CONSTRAINT "class_section_pkey" PRIMARY KEY ("class_section_id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "course_id" SERIAL NOT NULL,
    "course_code" VARCHAR(20) NOT NULL,
    "course_name" VARCHAR(100) NOT NULL,
    "credits" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "department_id" SERIAL NOT NULL,
    "department_code" VARCHAR(20) NOT NULL,
    "department_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "public"."enrollment" (
    "enrollment_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "class_section_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "enrollment_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "public"."grades" (
    "grade_id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "attendance_score" DECIMAL(3,1),
    "midterm_score" DECIMAL(3,1),
    "assignment_score" DECIMAL(3,1),
    "final_score" DECIMAL(3,1),
    "total_score" DECIMAL(3,1),
    "letter_grade" VARCHAR(5),
    "status" VARCHAR(20),

    CONSTRAINT "grades_pkey" PRIMARY KEY ("grade_id")
);

-- CreateTable
CREATE TABLE "public"."lecturers" (
    "lecturer_id" SERIAL NOT NULL,
    "lecturer_code" VARCHAR(20) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(10),
    "dob" DATE,
    "phone" VARCHAR(15),
    "email" VARCHAR(100),
    "address" VARCHAR(255),
    "department_id" INTEGER,
    "avatar" VARCHAR(255),
    "position" VARCHAR(50),

    CONSTRAINT "lecturers_pkey" PRIMARY KEY ("lecturer_id")
);

-- CreateTable
CREATE TABLE "public"."majors" (
    "major_id" SERIAL NOT NULL,
    "major_code" VARCHAR(20) NOT NULL,
    "major_name" VARCHAR(100) NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "majors_pkey" PRIMARY KEY ("major_id")
);

-- CreateTable
CREATE TABLE "public"."major_courses" (
    "id" SERIAL NOT NULL,
    "major_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "semester" INTEGER,
    "year" INTEGER,
    "is_required" BOOLEAN DEFAULT true,

    CONSTRAINT "major_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "student_id" SERIAL NOT NULL,
    "student_code" VARCHAR(20) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "gender" VARCHAR(10),
    "dob" DATE,
    "address" VARCHAR(255),
    "phone" VARCHAR(15),
    "email" VARCHAR(100),
    "avatar" VARCHAR(255),
    "cohort" VARCHAR(10),
    "status" VARCHAR(50),
    "academic_class_id" INTEGER,
    "major_id" INTEGER,

    CONSTRAINT "students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "public"."user_account" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "student_id" INTEGER,
    "lecturer_id" INTEGER,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_class_class_code_key" ON "public"."academic_class"("class_code");

-- CreateIndex
CREATE UNIQUE INDEX "class_section_section_code_key" ON "public"."class_section"("section_code");

-- CreateIndex
CREATE UNIQUE INDEX "courses_course_code_key" ON "public"."courses"("course_code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_department_code_key" ON "public"."departments"("department_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_enrollment" ON "public"."enrollment"("student_id", "class_section_id");

-- CreateIndex
CREATE UNIQUE INDEX "grades_enrollment_id_key" ON "public"."grades"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "lecturers_lecturer_code_key" ON "public"."lecturers"("lecturer_code");

-- CreateIndex
CREATE UNIQUE INDEX "lecturers_email_key" ON "public"."lecturers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "majors_major_code_key" ON "public"."majors"("major_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_major_course" ON "public"."major_courses"("major_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_code_key" ON "public"."students"("student_code");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "public"."students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_username_key" ON "public"."user_account"("username");

-- AddForeignKey
ALTER TABLE "public"."academic_class" ADD CONSTRAINT "fk_lecturer" FOREIGN KEY ("lecturer_id") REFERENCES "public"."lecturers"("lecturer_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."academic_class" ADD CONSTRAINT "fk_major" FOREIGN KEY ("major_id") REFERENCES "public"."majors"("major_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."class_section" ADD CONSTRAINT "fk_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."class_section" ADD CONSTRAINT "fk_lecturer" FOREIGN KEY ("lecturer_id") REFERENCES "public"."lecturers"("lecturer_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "fk_department" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "fk_class_section" FOREIGN KEY ("class_section_id") REFERENCES "public"."class_section"("class_section_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "fk_student" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."grades" ADD CONSTRAINT "fk_enrollment" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollment"("enrollment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."lecturers" ADD CONSTRAINT "lecturers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."majors" ADD CONSTRAINT "fk_department" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."major_courses" ADD CONSTRAINT "fk_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."major_courses" ADD CONSTRAINT "fk_major" FOREIGN KEY ("major_id") REFERENCES "public"."majors"("major_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_academic_class_id_fkey" FOREIGN KEY ("academic_class_id") REFERENCES "public"."academic_class"("academic_class_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "public"."majors"("major_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_account" ADD CONSTRAINT "fk_user_lecturer" FOREIGN KEY ("lecturer_id") REFERENCES "public"."lecturers"("lecturer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_account" ADD CONSTRAINT "fk_user_student" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
