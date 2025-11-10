--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: academic_class; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academic_class (
    academic_class_id integer NOT NULL,
    class_code character varying(20) NOT NULL,
    class_name character varying(100) NOT NULL,
    cohort character varying(10) NOT NULL,
    major_id integer NOT NULL,
    lecturer_id integer
);


ALTER TABLE public.academic_class OWNER TO postgres;

--
-- Name: academic_class_academic_class_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academic_class_academic_class_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academic_class_academic_class_id_seq OWNER TO postgres;

--
-- Name: academic_class_academic_class_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academic_class_academic_class_id_seq OWNED BY public.academic_class.academic_class_id;


--
-- Name: class_section; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class_section (
    class_section_id integer NOT NULL,
    section_code character varying(30) NOT NULL,
    academic_year character varying(20) NOT NULL,
    semester character varying(10) NOT NULL,
    course_id integer NOT NULL,
    lecturer_id integer,
    capacity integer NOT NULL,
    start_date date,
    end_date date
);


ALTER TABLE public.class_section OWNER TO postgres;

--
-- Name: class_section_class_section_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.class_section_class_section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.class_section_class_section_id_seq OWNER TO postgres;

--
-- Name: class_section_class_section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.class_section_class_section_id_seq OWNED BY public.class_section.class_section_id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    course_id integer NOT NULL,
    course_code character varying(20) NOT NULL,
    course_name character varying(100) NOT NULL,
    credits integer NOT NULL,
    department_id integer NOT NULL
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: courses_course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_course_id_seq OWNER TO postgres;

--
-- Name: courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_course_id_seq OWNED BY public.courses.course_id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_code character varying(20) NOT NULL,
    department_name character varying(100) NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_department_id_seq OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: enrollment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollment (
    enrollment_id integer NOT NULL,
    student_id integer NOT NULL,
    class_section_id integer NOT NULL,
    status character varying(20) NOT NULL
);


ALTER TABLE public.enrollment OWNER TO postgres;

--
-- Name: enrollment_enrollment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.enrollment_enrollment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollment_enrollment_id_seq OWNER TO postgres;

--
-- Name: enrollment_enrollment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.enrollment_enrollment_id_seq OWNED BY public.enrollment.enrollment_id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grades (
    grade_id integer NOT NULL,
    enrollment_id integer NOT NULL,
    attendance_score numeric(3,1),
    midterm_score numeric(3,1),
    assignment_score numeric(3,1),
    final_score numeric(3,1),
    total_score numeric(3,1),
    letter_grade character varying(5),
    status character varying(20)
);


ALTER TABLE public.grades OWNER TO postgres;

--
-- Name: grades_grade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grades_grade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grades_grade_id_seq OWNER TO postgres;

--
-- Name: grades_grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grades_grade_id_seq OWNED BY public.grades.grade_id;


--
-- Name: lecturers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lecturers (
    lecturer_id integer NOT NULL,
    lecturer_code character varying(20) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(100) NOT NULL,
    gender character varying(10),
    dob date,
    phone character varying(15),
    email character varying(100),
    address character varying(255),
    department_id integer,
    avatar character varying(255),
    "position" character varying(50)
);


ALTER TABLE public.lecturers OWNER TO postgres;

--
-- Name: lecturers_lecturer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lecturers_lecturer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lecturers_lecturer_id_seq OWNER TO postgres;

--
-- Name: lecturers_lecturer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lecturers_lecturer_id_seq OWNED BY public.lecturers.lecturer_id;


--
-- Name: major_courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.major_courses (
    id integer NOT NULL,
    major_id integer NOT NULL,
    course_id integer NOT NULL,
    semester integer,
    year integer,
    is_required boolean DEFAULT true
);


ALTER TABLE public.major_courses OWNER TO postgres;

--
-- Name: major_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.major_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.major_courses_id_seq OWNER TO postgres;

--
-- Name: major_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.major_courses_id_seq OWNED BY public.major_courses.id;


--
-- Name: majors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.majors (
    major_id integer NOT NULL,
    major_code character varying(20) NOT NULL,
    major_name character varying(100) NOT NULL,
    department_id integer NOT NULL
);


ALTER TABLE public.majors OWNER TO postgres;

--
-- Name: majors_major_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.majors_major_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.majors_major_id_seq OWNER TO postgres;

--
-- Name: majors_major_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.majors_major_id_seq OWNED BY public.majors.major_id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    student_id integer NOT NULL,
    student_code character varying(20) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    gender character varying(10),
    dob date,
    address character varying(255),
    phone character varying(15),
    email character varying(100),
    avatar character varying(255),
    cohort character varying(10),
    status character varying(50),
    academic_class_id integer,
    major_id integer
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: students_student_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_student_id_seq OWNER TO postgres;

--
-- Name: students_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_student_id_seq OWNED BY public.students.student_id;


--
-- Name: user_account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_account (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    student_id integer,
    lecturer_id integer
);


ALTER TABLE public.user_account OWNER TO postgres;

--
-- Name: user_account_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_account_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_account_user_id_seq OWNER TO postgres;

--
-- Name: user_account_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_account_user_id_seq OWNED BY public.user_account.user_id;


--
-- Name: academic_class academic_class_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_class ALTER COLUMN academic_class_id SET DEFAULT nextval('public.academic_class_academic_class_id_seq'::regclass);


--
-- Name: class_section class_section_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_section ALTER COLUMN class_section_id SET DEFAULT nextval('public.class_section_class_section_id_seq'::regclass);


--
-- Name: courses course_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN course_id SET DEFAULT nextval('public.courses_course_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: enrollment enrollment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment ALTER COLUMN enrollment_id SET DEFAULT nextval('public.enrollment_enrollment_id_seq'::regclass);


--
-- Name: grades grade_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades ALTER COLUMN grade_id SET DEFAULT nextval('public.grades_grade_id_seq'::regclass);


--
-- Name: lecturers lecturer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers ALTER COLUMN lecturer_id SET DEFAULT nextval('public.lecturers_lecturer_id_seq'::regclass);


--
-- Name: major_courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.major_courses ALTER COLUMN id SET DEFAULT nextval('public.major_courses_id_seq'::regclass);


--
-- Name: majors major_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.majors ALTER COLUMN major_id SET DEFAULT nextval('public.majors_major_id_seq'::regclass);


--
-- Name: students student_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN student_id SET DEFAULT nextval('public.students_student_id_seq'::regclass);


--
-- Name: user_account user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account ALTER COLUMN user_id SET DEFAULT nextval('public.user_account_user_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
175885c3-411d-443f-9076-fa11b1a1a1db	ff434c946d2c6823c6366632aff023001fe363ea867a4f7b4461c824ac044401	2025-10-15 21:53:08.258029+07	20251015145308_init_schema	\N	\N	2025-10-15 21:53:08.194458+07	1
\.


--
-- Data for Name: academic_class; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academic_class (academic_class_id, class_code, class_name, cohort, major_id, lecturer_id) FROM stdin;
1	CNTT01	Công nghệ thông tin Lớp 1	2023	1	6
2	CNTT02	Công nghệ thông tin Lớp 2	2023	1	1
3	HTTT03	Hệ thống thông tin Lớp 3	2023	4	6
4	KT04	Kế toán Lớp 4	2023	5	1
5	TC05	Tài chính Lớp 5	2023	3	6
6	QT06	Quản trị kinh doanh Lớp 6	2023	2	8
7	QT07	Quản trị kinh doanh Lớp 7	2023	2	6
8	MK08	Marketing Lớp 8	2023	6	5
9	MK09	Marketing Lớp 9	2023	6	8
10	DLT10	Du lịch Lớp 10	2023	8	5
11	KH11	Khách sạn Lớp 11	2023	9	5
12	TA12	Tiếng Anh Lớp 12	2023	7	4
13	TA13	Tiếng Anh Lớp 13	2023	7	4
14	TQ14	Tiếng Trung Lớp 14	2023	10	2
15	TQ15	Tiếng Trung Lớp 15	2023	10	6
\.


--
-- Data for Name: class_section; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.class_section (class_section_id, section_code, academic_year, semester, course_id, lecturer_id, capacity, start_date, end_date) FROM stdin;
17	ITS4456	2022-2023	2	6	3	30	2023-02-15	2023-04-30
1	CNTTC67-S1	2023-2024	2	1	9	30	2023-09-01	2024-01-15
2	CNTTC67-S2	2023-2024	1	1	1	30	2023-09-01	2024-01-15
3	CNTTC17-S1	2023-2024	2	2	4	30	2023-09-01	2024-01-15
4	CNTTC17-S2	2023-2024	Hè	2	3	30	2023-09-01	2024-01-15
5	KTC92-S1	2023-2024	Hè	3	1	30	2023-09-01	2024-01-15
6	KTC92-S2	2023-2024	Hè	3	3	30	2023-09-01	2024-01-15
7	KTC57-S1	2023-2024	Hè	4	7	30	2023-09-01	2024-01-15
8	QTC14-S1	2023-2024	2	5	7	30	2023-09-01	2024-01-15
9	QTC50-S1	2023-2024	Hè	6	10	30	2023-09-01	2024-01-15
10	QTC50-S2	2023-2024	2	6	6	30	2023-09-01	2024-01-15
11	DLC63-S1	2023-2024	2	7	10	30	2023-09-01	2024-01-15
12	DLC63-S2	2023-2024	1	7	2	30	2023-09-01	2024-01-15
13	DLC25-S1	2023-2024	Hè	8	7	30	2023-09-01	2024-01-15
14	DLC25-S2	2023-2024	1	8	3	30	2023-09-01	2024-01-15
15	NNC94-S1	2023-2024	Hè	9	8	30	2023-09-01	2024-01-15
16	NNC88-S1	2023-2024	Hè	10	10	30	2023-09-01	2024-01-15
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (course_id, course_code, course_name, credits, department_id) FROM stdin;
1	CNTTC67	Cơ sở dữ liệu	3	1
2	CNTTC17	Cơ sở dữ liệu	3	1
3	KTC92	Marketing căn bản	3	2
4	KTC57	Kế toán tài chính	3	2
5	QTC14	Kế toán tài chính	3	4
6	QTC50	Lập trình web	3	4
7	DLC63	Cơ sở dữ liệu	3	5
8	DLC25	Mạng máy tính	3	5
9	NNC94	Marketing căn bản	3	3
10	NNC88	Cơ sở dữ liệu	3	3
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (department_id, department_code, department_name) FROM stdin;
1	CNTT	Công nghệ thông tin
2	KT	Kinh tế
3	NN	Ngôn ngữ
4	QT	Quản trị
5	DL	Du lịch
\.


--
-- Data for Name: enrollment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollment (enrollment_id, student_id, class_section_id, status) FROM stdin;
1	1	16	Hủy
2	1	14	Đang học
3	1	3	Đang học
4	1	7	Hoàn thành
5	2	14	Đang học
6	2	4	Hoàn thành
7	2	8	Đang học
8	3	11	Đang học
9	3	5	Hủy
10	3	9	Hủy
11	3	16	Hủy
12	4	10	Hủy
13	4	11	Hủy
14	4	13	Hoàn thành
15	5	13	Hủy
16	5	5	Đang học
17	5	12	Hủy
18	5	2	Đang học
19	6	3	Đang học
20	6	2	Hủy
21	6	11	Hủy
22	7	12	Hủy
23	7	9	Hoàn thành
24	7	15	Đang học
25	7	10	Hủy
26	8	12	Đang học
27	8	14	Hoàn thành
28	8	11	Hủy
29	8	8	Hoàn thành
30	9	9	Đang học
31	9	1	Hoàn thành
32	9	5	Hoàn thành
33	9	14	Đang học
34	10	7	Hủy
35	10	16	Hủy
36	10	14	Đang học
37	11	7	Đang học
38	11	9	Hủy
39	11	13	Hoàn thành
40	11	5	Hoàn thành
41	12	10	Đang học
42	12	6	Đang học
43	12	7	Hoàn thành
44	12	4	Đang học
45	13	8	Hủy
46	13	4	Hoàn thành
47	13	11	Đang học
48	14	12	Hoàn thành
49	14	11	Hoàn thành
50	14	4	Đang học
51	14	5	Đang học
52	15	3	Hoàn thành
53	15	5	Hoàn thành
54	15	16	Hủy
55	15	10	Đang học
56	16	11	Đang học
57	16	12	Hoàn thành
58	16	10	Hủy
59	16	14	Hoàn thành
60	17	7	Hoàn thành
61	17	4	Hủy
62	17	12	Hoàn thành
63	17	2	Hủy
64	18	13	Đang học
65	18	5	Đang học
66	18	4	Hoàn thành
67	19	4	Đang học
68	19	6	Hủy
69	19	8	Đang học
70	19	7	Hoàn thành
71	20	5	Đang học
72	20	14	Đang học
73	20	16	Đang học
74	21	12	Đang học
75	21	15	Hủy
76	21	5	Hoàn thành
77	22	13	Đang học
78	22	2	Hủy
79	22	3	Đang học
80	22	15	Hủy
81	23	11	Đang học
82	23	4	Đang học
83	23	3	Hoàn thành
84	23	5	Đang học
85	24	12	Hoàn thành
86	24	3	Hoàn thành
87	24	2	Hoàn thành
88	24	13	Hoàn thành
89	25	16	Đang học
90	25	10	Đang học
91	25	1	Đang học
92	25	14	Hủy
93	26	16	Đang học
94	26	1	Hủy
95	26	14	Hoàn thành
96	27	9	Hủy
97	27	7	Hoàn thành
98	27	15	Đang học
99	28	12	Hủy
100	28	1	Đang học
101	28	8	Hoàn thành
102	28	15	Hủy
103	29	5	Đang học
104	29	9	Đang học
105	29	8	Hoàn thành
106	30	4	Hủy
107	30	5	Hủy
108	30	7	Hủy
109	31	10	Hủy
110	31	5	Hoàn thành
111	31	9	Đang học
112	32	11	Hủy
113	32	8	Hoàn thành
114	32	10	Hoàn thành
115	33	9	Đang học
116	33	1	Hủy
117	33	2	Hủy
118	33	16	Hoàn thành
119	34	4	Hoàn thành
120	34	1	Hủy
121	34	6	Đang học
122	34	5	Đang học
123	35	3	Đang học
124	35	12	Hoàn thành
125	35	7	Hoàn thành
126	35	5	Hủy
127	36	14	Đang học
128	36	15	Hoàn thành
129	36	7	Hoàn thành
130	37	5	Hủy
131	37	3	Hủy
132	37	10	Hoàn thành
133	37	9	Hủy
134	38	16	Hủy
135	38	9	Hoàn thành
136	38	12	Hoàn thành
137	38	8	Đang học
138	39	4	Hủy
139	39	7	Hoàn thành
140	39	9	Hủy
141	40	15	Hoàn thành
142	40	2	Hoàn thành
143	40	1	Hủy
144	41	4	Hoàn thành
145	41	12	Hoàn thành
146	41	8	Hoàn thành
147	41	15	Hủy
148	42	7	Hoàn thành
149	42	16	Đang học
252	1	17	Đang học
251	1	5	Hoàn thành
150	42	10	Hoàn thành
151	43	11	Đang học
152	43	3	Hoàn thành
153	43	13	Hoàn thành
154	44	13	Đang học
155	44	9	Đang học
156	44	12	Hoàn thành
157	44	4	Hoàn thành
158	45	16	Đang học
159	45	13	Hoàn thành
160	45	11	Hoàn thành
161	45	15	Hủy
162	46	15	Hủy
163	46	2	Hủy
164	46	6	Hoàn thành
165	46	7	Hủy
166	47	5	Hủy
167	47	16	Đang học
168	47	4	Hủy
169	47	3	Hủy
170	48	14	Đang học
171	48	2	Đang học
172	48	9	Hoàn thành
173	48	5	Hoàn thành
174	49	8	Hoàn thành
175	49	5	Đang học
176	49	13	Hoàn thành
177	49	3	Đang học
178	50	15	Đang học
179	50	6	Hủy
180	50	3	Đang học
181	51	4	Hoàn thành
182	51	10	Hoàn thành
183	51	5	Hoàn thành
184	52	12	Hoàn thành
185	52	2	Hoàn thành
186	52	15	Hoàn thành
187	53	7	Hủy
188	53	6	Đang học
189	53	11	Đang học
190	54	14	Đang học
191	54	15	Đang học
192	54	8	Hủy
193	54	4	Hoàn thành
194	55	14	Đang học
195	55	13	Hủy
196	55	15	Hoàn thành
197	56	9	Hoàn thành
198	56	10	Hoàn thành
199	56	14	Hủy
200	56	7	Đang học
201	57	3	Hoàn thành
202	57	15	Hoàn thành
203	57	9	Hủy
204	58	15	Hoàn thành
205	58	14	Hoàn thành
206	58	13	Hủy
207	59	2	Hoàn thành
208	59	7	Đang học
209	59	8	Hoàn thành
210	59	6	Đang học
211	60	3	Hủy
212	60	4	Hủy
213	60	12	Đang học
214	61	15	Hủy
215	61	3	Hoàn thành
216	61	9	Hoàn thành
217	61	1	Đang học
218	62	15	Hoàn thành
219	62	1	Đang học
220	62	14	Đang học
221	63	1	Đang học
222	63	12	Hủy
223	63	14	Hủy
224	63	3	Hoàn thành
225	64	13	Hoàn thành
226	64	3	Hủy
227	64	7	Hủy
228	65	10	Hủy
229	65	11	Đang học
230	65	8	Đang học
231	66	11	Hoàn thành
232	66	6	Hủy
233	66	12	Hủy
234	67	11	Hoàn thành
235	67	4	Hủy
236	67	10	Hoàn thành
237	67	1	Hủy
238	68	12	Hủy
239	68	6	Hoàn thành
240	68	14	Đang học
241	68	9	Hoàn thành
242	69	11	Đang học
243	69	2	Hủy
244	69	12	Đang học
245	69	15	Hủy
246	70	4	Hoàn thành
247	70	9	Hoàn thành
248	70	7	Đang học
249	70	5	Hoàn thành
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (grade_id, enrollment_id, attendance_score, midterm_score, assignment_score, final_score, total_score, letter_grade, status) FROM stdin;
145	145	1.0	6.3	10.0	4.0	5.6	C	Đạt
146	146	4.4	2.2	6.2	0.7	2.6	F	Trượt
147	147	9.2	7.6	4.9	8.4	7.6	B	Đạt
148	148	3.5	6.1	0.2	7.7	5.3	D	Đạt
149	149	8.2	2.1	1.5	7.6	4.8	D	Trượt
150	150	5.9	7.4	3.0	4.6	5.2	D	Đạt
151	151	9.8	5.0	5.2	9.4	7.3	B	Đạt
152	152	8.0	8.2	2.4	0.2	3.8	F	Trượt
153	153	5.6	6.5	3.4	4.9	5.2	D	Đạt
154	154	2.3	6.3	6.0	1.8	4.1	D	Trượt
155	155	8.0	1.3	2.2	7.0	4.4	D	Trượt
156	156	4.6	2.7	4.2	1.6	2.7	F	Trượt
157	157	7.9	3.2	2.8	4.6	4.1	D	Trượt
158	158	2.4	7.2	3.6	7.8	6.2	C	Đạt
159	159	7.4	5.8	4.1	2.1	4.1	D	Trượt
160	160	8.4	4.1	6.0	2.4	4.2	D	Trượt
161	161	2.1	7.3	3.0	2.7	4.1	D	Trượt
162	162	4.0	5.6	1.2	9.8	6.2	C	Đạt
163	163	9.2	6.1	8.8	9.0	8.1	B	Đạt
164	164	6.2	7.3	7.3	3.6	5.7	C	Đạt
165	165	5.5	9.9	4.1	8.4	7.7	B	Đạt
166	166	7.0	4.7	0.6	8.6	5.7	C	Đạt
167	167	9.8	9.2	3.3	0.1	4.4	D	Trượt
168	168	1.3	8.2	4.9	0.3	3.7	F	Trượt
169	169	3.7	5.9	2.6	2.9	3.8	F	Trượt
170	170	2.9	1.9	1.8	3.5	2.6	F	Trượt
171	171	6.5	6.5	8.2	3.9	5.8	C	Đạt
172	172	8.7	6.9	2.1	7.0	6.2	C	Đạt
173	173	9.5	7.8	0.3	0.1	3.4	F	Trượt
174	174	1.7	4.4	5.1	9.6	6.3	C	Đạt
175	175	2.0	0.6	2.3	4.7	2.7	F	Trượt
176	176	8.6	2.1	3.1	8.8	5.6	C	Đạt
177	177	0.0	5.2	4.0	4.0	4.0	D	Trượt
178	178	8.0	8.0	1.7	1.5	4.1	D	Trượt
179	179	6.2	0.4	1.2	3.0	2.2	F	Trượt
180	180	1.7	6.3	7.1	9.3	7.2	B	Đạt
181	181	5.1	4.3	8.4	2.8	4.6	D	Trượt
182	182	6.6	3.1	9.4	8.4	6.8	C	Đạt
183	183	0.0	9.0	7.6	0.8	4.6	D	Trượt
184	184	6.2	2.3	6.0	2.0	3.3	F	Trượt
185	185	4.7	2.6	1.4	3.5	2.9	F	Trượt
186	186	1.7	9.7	0.3	4.7	5.0	D	Đạt
187	187	2.7	5.9	3.4	3.8	4.2	D	Trượt
188	188	4.7	8.6	2.3	0.8	3.8	F	Trượt
189	189	3.4	0.1	6.4	8.3	5.0	D	Đạt
190	190	2.0	8.9	5.2	4.5	5.7	C	Đạt
191	191	2.3	8.1	0.1	9.1	6.3	C	Đạt
192	192	7.9	2.4	2.5	5.3	4.1	D	Trượt
193	193	1.5	1.0	3.4	9.4	4.9	D	Trượt
194	194	5.7	6.7	7.7	2.2	5.0	D	Đạt
195	195	7.2	1.9	2.7	8.3	5.1	D	Đạt
196	196	7.3	8.5	2.1	4.2	5.4	D	Đạt
197	197	0.9	8.2	6.6	5.3	6.0	C	Đạt
198	198	5.6	2.9	7.8	8.0	6.2	C	Đạt
199	199	4.9	5.4	9.1	3.4	5.3	D	Đạt
200	200	3.4	0.1	4.5	0.5	1.5	F	Trượt
201	201	8.7	5.5	0.2	1.8	3.3	F	Trượt
202	202	3.8	8.3	4.1	6.7	6.4	C	Đạt
203	203	5.4	4.0	1.5	8.2	5.3	D	Đạt
204	204	5.4	7.6	9.0	4.7	6.5	C	Đạt
205	205	6.4	2.5	1.9	1.5	2.4	F	Trượt
206	206	7.1	6.0	7.5	4.1	5.7	C	Đạt
207	207	1.1	7.6	5.8	1.1	4.0	D	Trượt
208	208	8.3	8.6	1.1	4.4	5.4	D	Đạt
209	209	0.6	7.2	8.4	1.4	4.5	D	Trượt
210	210	5.5	2.4	4.0	3.5	3.5	F	Trượt
211	211	8.2	8.0	2.7	2.8	4.9	D	Trượt
212	212	8.1	7.1	9.3	7.9	7.9	B	Đạt
213	213	4.5	6.0	3.4	6.2	5.4	D	Đạt
214	214	1.5	1.3	9.2	2.0	3.2	F	Trượt
215	215	5.1	5.2	4.2	5.4	5.1	D	Đạt
216	216	4.3	0.8	8.8	0.8	2.8	F	Trượt
217	217	3.3	6.9	6.4	4.4	5.4	D	Đạt
218	218	6.1	5.5	1.7	3.6	4.0	D	Trượt
219	219	5.5	2.9	2.5	4.0	3.5	F	Trượt
220	220	6.8	1.7	7.2	7.3	5.5	C	Đạt
221	221	5.2	7.5	2.9	6.4	5.9	C	Đạt
222	222	1.6	5.0	6.6	7.3	5.9	C	Đạt
223	223	6.8	2.2	1.1	2.6	2.6	F	Trượt
224	224	8.4	8.8	7.1	9.9	8.8	A	Đạt
225	225	8.7	4.1	4.0	3.0	4.1	D	Trượt
226	226	9.0	2.0	2.7	8.5	5.5	C	Đạt
227	227	6.7	6.6	4.4	0.9	3.9	F	Trượt
228	228	2.9	0.9	1.0	5.5	2.9	F	Trượt
229	229	1.3	8.7	9.8	0.3	4.8	D	Trượt
230	230	1.1	8.2	0.6	5.6	5.0	D	Đạt
231	231	0.2	9.9	2.4	3.7	4.9	D	Trượt
232	232	3.8	5.9	8.3	4.5	5.6	C	Đạt
233	233	2.4	3.5	3.1	2.4	2.9	F	Trượt
234	234	1.0	7.1	7.5	2.2	4.6	D	Trượt
235	235	5.6	4.1	9.8	4.1	5.4	D	Đạt
236	236	5.3	2.4	5.3	3.1	3.5	F	Trượt
237	237	6.9	2.5	8.3	8.0	6.3	C	Đạt
238	238	5.7	3.1	0.8	1.3	2.2	F	Trượt
239	239	4.4	8.6	1.9	0.1	3.4	F	Trượt
240	240	7.1	1.7	0.2	1.9	2.0	F	Trượt
241	241	4.6	3.7	2.3	2.7	3.1	F	Trượt
2	2	9.8	3.4	9.6	3.2	5.2	D	Đạt
3	3	6.4	6.8	1.0	1.0	3.3	F	Trượt
4	4	1.0	7.0	3.5	5.2	5.0	D	Đạt
5	5	1.1	4.0	3.7	2.6	3.1	F	Trượt
6	6	4.7	6.3	0.9	5.3	4.7	D	Trượt
7	7	5.5	1.9	2.4	7.4	4.6	D	Trượt
8	8	8.1	9.6	7.1	2.3	6.0	C	Đạt
9	9	5.9	2.1	1.5	0.8	1.8	F	Trượt
10	10	1.2	5.9	6.7	1.9	4.0	D	Trượt
11	11	4.4	8.9	8.4	3.0	6.0	C	Đạt
12	12	2.4	0.6	4.1	5.8	3.6	F	Trượt
13	13	0.1	1.6	3.1	6.4	3.7	F	Trượt
14	14	8.5	6.3	9.0	9.3	8.2	B	Đạt
15	15	4.1	4.9	4.7	3.7	4.3	D	Trượt
16	16	0.1	3.3	3.2	8.5	5.0	D	Đạt
18	18	7.9	4.5	8.5	0.5	4.0	D	Trượt
19	19	2.8	1.0	2.9	6.0	3.5	F	Trượt
20	20	1.0	5.5	4.8	1.8	3.4	F	Trượt
21	21	4.2	6.2	2.9	4.5	4.6	D	Trượt
22	22	1.4	5.8	4.7	2.0	3.6	F	Trượt
23	23	5.7	2.3	0.4	0.0	1.4	F	Trượt
24	24	1.3	3.7	9.6	6.3	5.7	C	Đạt
25	25	8.9	7.6	5.6	8.3	7.6	B	Đạt
26	26	3.3	0.4	5.4	0.4	1.7	F	Trượt
27	27	8.9	7.8	6.4	5.1	6.5	C	Đạt
28	28	8.0	3.8	6.3	7.5	6.2	C	Đạt
29	29	5.2	3.9	2.1	6.0	4.5	D	Trượt
30	30	1.8	4.7	8.2	2.2	4.1	D	Trượt
31	31	1.8	4.5	9.4	8.4	6.8	C	Đạt
32	32	8.4	1.9	2.4	6.6	4.5	D	Trượt
33	33	9.8	4.9	5.6	6.1	6.0	C	Đạt
34	34	7.9	8.0	8.5	6.8	7.6	B	Đạt
35	35	1.2	1.5	3.5	1.0	1.7	F	Trượt
36	36	5.9	0.5	4.8	0.2	1.8	F	Trượt
37	37	5.2	1.7	8.6	7.3	5.7	C	Đạt
38	38	1.0	4.5	6.1	4.4	4.4	D	Trượt
39	39	1.9	1.7	0.5	7.0	3.6	F	Trượt
40	40	1.8	3.7	5.2	7.7	5.4	D	Đạt
41	41	0.5	3.3	5.2	3.2	3.4	F	Trượt
42	42	6.3	9.0	8.7	0.8	5.4	D	Đạt
43	43	5.0	2.6	0.7	2.6	2.5	F	Trượt
44	44	4.1	9.9	5.7	8.7	8.0	B	Đạt
45	45	4.5	1.2	8.9	2.5	3.6	F	Trượt
46	46	5.9	3.9	3.0	4.1	4.0	D	Trượt
47	47	5.8	6.5	1.6	4.6	4.7	D	Trượt
48	48	8.8	2.1	8.8	8.8	6.8	C	Đạt
49	49	5.3	9.0	6.5	2.1	5.4	D	Đạt
50	50	4.3	2.7	6.6	3.3	3.9	F	Trượt
51	51	9.6	1.6	1.7	9.0	5.4	D	Đạt
52	52	1.6	8.9	9.1	4.6	6.5	C	Đạt
53	53	6.2	7.2	3.6	0.5	3.7	F	Trượt
54	54	8.3	3.8	4.3	4.8	4.8	D	Trượt
55	55	5.0	4.0	5.8	7.9	6.0	C	Đạt
56	56	1.4	7.4	4.6	4.9	5.2	D	Đạt
57	57	8.8	1.8	8.5	8.0	6.3	C	Đạt
58	58	0.2	8.1	7.0	1.8	4.6	D	Trượt
59	59	2.8	3.7	7.8	8.0	6.1	C	Đạt
60	60	5.4	6.5	0.9	0.2	2.8	F	Trượt
61	61	5.8	5.3	6.1	1.7	4.1	D	Trượt
62	62	9.5	2.5	7.2	9.2	6.8	C	Đạt
63	63	1.4	4.2	5.0	2.9	3.6	F	Trượt
64	64	8.1	2.7	2.1	3.1	3.3	F	Trượt
65	65	1.4	1.3	5.2	2.1	2.4	F	Trượt
66	66	4.6	4.9	6.4	3.9	4.8	D	Trượt
67	67	3.1	8.8	5.3	4.4	5.8	C	Đạt
68	68	6.4	1.7	3.9	9.9	5.9	C	Đạt
69	69	0.5	9.4	1.6	6.0	5.6	C	Đạt
70	70	0.2	7.0	2.5	3.7	4.1	D	Trượt
71	71	5.6	4.2	3.7	1.1	3.0	F	Trượt
72	72	9.3	0.3	5.8	8.0	5.4	D	Đạt
73	73	0.8	3.0	5.9	8.6	5.6	C	Đạt
74	74	8.7	2.0	1.7	5.4	3.9	F	Trượt
75	75	6.2	2.0	3.5	7.9	5.1	D	Đạt
76	76	7.2	7.5	9.0	7.9	7.9	B	Đạt
77	77	5.9	8.6	6.1	7.5	7.4	B	Đạt
78	78	9.5	8.9	3.6	6.6	7.0	B	Đạt
79	79	0.7	0.6	6.7	3.3	2.9	F	Trượt
80	80	7.4	5.0	4.1	8.4	6.4	C	Đạt
81	81	1.2	6.1	3.8	2.1	3.5	F	Trượt
82	82	0.2	0.8	5.2	6.7	4.0	D	Trượt
83	83	2.7	5.0	9.5	0.3	3.8	F	Trượt
84	84	4.4	9.8	5.6	3.2	5.8	C	Đạt
85	85	3.1	1.2	1.7	5.2	3.1	F	Trượt
86	86	7.0	7.7	1.3	2.8	4.4	D	Trượt
87	87	3.5	1.2	5.5	1.7	2.5	F	Trượt
88	88	6.2	1.4	1.1	1.5	1.9	F	Trượt
89	89	8.2	2.2	5.3	6.3	5.1	D	Đạt
90	90	2.3	3.1	8.3	1.8	3.6	F	Trượt
91	91	8.9	2.8	6.8	3.4	4.4	D	Trượt
92	92	1.6	8.5	4.5	5.0	5.6	C	Đạt
93	93	0.3	1.5	7.5	9.8	5.9	C	Đạt
94	94	7.3	6.8	4.6	0.3	3.8	F	Trượt
95	95	1.2	4.7	9.2	7.5	6.4	C	Đạt
96	96	7.9	5.2	3.5	5.0	5.1	D	Đạt
97	97	9.5	7.1	9.6	8.0	8.2	B	Đạt
98	98	0.2	4.3	4.1	4.4	3.9	F	Trượt
250	249	10.0	10.0	10.0	10.0	10.0	A	Đạt
99	99	6.3	0.6	9.5	1.9	3.5	F	Trượt
100	100	4.6	8.5	0.3	3.8	4.6	D	Trượt
101	101	0.4	0.8	1.3	3.7	2.0	F	Trượt
102	102	9.4	1.3	3.8	1.1	2.5	F	Trượt
103	103	6.6	8.8	6.8	5.9	7.0	B	Đạt
104	104	9.3	4.5	8.9	3.9	5.6	C	Đạt
105	105	2.4	3.9	1.1	9.2	5.3	D	Đạt
106	106	7.7	1.1	4.8	0.5	2.3	F	Trượt
107	107	2.0	2.3	0.4	2.0	1.8	F	Trượt
108	108	3.3	1.7	9.5	4.8	4.7	D	Trượt
109	109	3.6	7.2	3.0	9.4	6.9	C	Đạt
110	110	0.7	3.3	9.2	4.9	4.9	D	Trượt
111	111	1.7	0.9	3.5	3.3	2.5	F	Trượt
112	112	2.1	5.2	0.4	3.4	3.2	F	Trượt
113	113	0.6	2.1	0.9	3.1	2.1	F	Trượt
114	114	9.9	2.3	1.5	3.9	3.5	F	Trượt
115	115	3.9	1.5	7.5	0.6	2.6	F	Trượt
116	116	1.3	1.7	6.7	0.0	2.0	F	Trượt
117	117	3.8	3.3	9.0	3.4	4.5	D	Trượt
118	118	8.0	9.9	2.6	4.2	6.0	C	Đạt
119	119	4.2	6.0	0.5	4.2	4.0	D	Trượt
120	120	1.4	3.3	7.9	9.9	6.7	C	Đạt
121	121	0.5	8.6	8.3	6.9	7.0	B	Đạt
122	122	0.0	5.8	1.4	2.0	2.8	F	Trượt
123	123	2.5	6.5	4.8	5.1	5.2	D	Đạt
124	124	8.7	0.6	8.5	8.4	6.1	C	Đạt
125	125	6.9	1.6	1.8	0.2	1.6	F	Trượt
126	126	6.5	5.7	4.6	9.8	7.2	B	Đạt
127	127	3.4	5.1	3.3	6.9	5.3	D	Đạt
128	128	4.1	3.4	1.3	7.2	4.6	D	Trượt
129	129	3.0	7.5	8.7	3.0	5.5	C	Đạt
130	130	8.9	8.3	7.9	1.9	5.7	C	Đạt
131	131	2.6	9.0	7.2	7.9	7.6	B	Đạt
132	132	0.4	6.4	0.9	2.4	3.1	F	Trượt
133	133	6.0	7.5	6.3	8.1	7.3	B	Đạt
134	134	6.6	3.1	4.5	0.8	2.8	F	Trượt
135	135	9.8	8.7	5.4	6.8	7.4	B	Đạt
136	136	8.2	3.1	1.7	3.2	3.4	F	Trượt
137	137	0.8	3.8	9.3	7.7	6.2	C	Đạt
138	138	0.7	5.6	5.0	5.9	5.1	D	Đạt
139	139	2.6	9.7	1.7	5.6	5.8	C	Đạt
140	140	3.6	7.6	2.4	9.9	7.1	B	Đạt
141	141	6.5	5.8	1.9	9.5	6.6	C	Đạt
142	142	0.6	2.7	5.1	8.2	5.2	D	Đạt
143	143	2.7	7.1	9.4	6.0	6.7	C	Đạt
144	144	1.5	4.1	5.7	5.8	4.8	D	Trượt
251	1	7.0	9.0	8.0	8.0	8.1	B	Đạt
242	242	0.2	1.7	4.4	6.8	4.2	D	Trượt
243	243	9.4	2.6	0.8	4.7	3.8	F	Trượt
244	244	2.1	7.1	1.1	6.0	4.9	D	Trượt
245	245	3.0	0.5	6.1	6.5	4.3	D	Trượt
246	246	9.7	8.5	5.6	2.3	5.6	C	Đạt
247	247	9.7	5.5	4.0	1.7	4.1	D	Trượt
248	248	5.6	5.5	2.0	3.1	3.9	F	Trượt
\.


--
-- Data for Name: lecturers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lecturers (lecturer_id, lecturer_code, first_name, last_name, gender, dob, phone, email, address, department_id, avatar, "position") FROM stdin;
1	GV1	An	Nguyễn Bình	Nam	1987-03-08	0950783858	gv1@university.edu.vn	1776 Đào, Hải Dương, Việt Nam	1	\N	Giảng viên
31	GV25	Ngân	Nguyễn Thị Thủy	Nữ	2000-03-24	0354250164	nganntt@hub.edu.vn	Tuy Phước, Gia Lai, Việt Nam	1	\N	Trợ giảng
2	GV2	Bình	Trần Thị	Nữ	1999-09-27	0963430673	gv2@university.edu.vn	69671 Thanh Hào Square, Hải Dương, Việt Nam	2	\N	Giảng viên
3	GV3	Cường	Lê Minh	Nam	1984-05-21	0956184591	gv3@university.edu.vn	10187 Quang Thái Lights, Biên Hòa, Việt Nam	4	\N	Giảng viên
4	GV4	Dung	Phạm Thị	Nữ	1974-07-20	0998079228	gv4@university.edu.vn	8464 Đoàn Crossroad, Tân An, Việt Nam	5	\N	Giảng viên
5	GV5	Hưng	Hoàng Văn	Nam	1988-03-27	0977220238	gv5@university.edu.vn	73520 Đức Phú Lake, Mỹ Tho, Việt Nam	3	\N	Giảng viên
6	GV6	Lan	Đặng Thị	Nữ	1993-09-07	0943322195	gv6@university.edu.vn	6619 Diệu Hiền Light, Thanh Hóa, Việt Nam	1	\N	Giảng viên
7	GV7	Quân	Vũ Minh	Nam	1979-04-05	0927841927	gv7@university.edu.vn	2081 Đặng Prairie, Hanoi, Việt Nam	2	\N	Giảng viên
8	GV8	Nga	Bùi Thị	Nữ	1991-08-30	0950703475	gv8@university.edu.vn	868 Trương Prairie, Buôn Ma Thuột, Việt Nam	4	\N	Giảng viên
9	GV9	Phúc	Ngô Văn	Nam	1996-06-05	0981149414	gv9@university.edu.vn	19164 Hoàng Pike, Haiphong, Việt Nam	5	\N	Giảng viên
10	GV10	Hoa	Đỗ Thị	Nữ	1978-12-07	0996133555	gv10@university.edu.vn	62833 Đặng Field, Việt Trì, Việt Nam	3	\N	Giảng viên
\.


--
-- Data for Name: major_courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.major_courses (id, major_id, course_id, semester, year, is_required) FROM stdin;
1	1	2	\N	\N	t
2	1	1	\N	\N	t
3	4	2	\N	\N	t
4	4	1	\N	\N	t
5	5	3	\N	\N	t
6	5	4	\N	\N	t
7	3	3	\N	\N	t
8	3	4	\N	\N	t
9	2	6	\N	\N	t
10	2	5	\N	\N	t
11	6	6	\N	\N	t
12	6	5	\N	\N	t
13	8	8	\N	\N	t
14	8	7	\N	\N	t
15	9	7	\N	\N	t
16	9	8	\N	\N	t
17	7	10	\N	\N	t
18	7	9	\N	\N	t
19	10	9	\N	\N	t
20	10	10	\N	\N	t
21	4	5	\N	\N	t
22	2	4	\N	\N	t
23	2	3	\N	\N	f
24	1	8	\N	\N	t
26	3	1	\N	\N	f
\.


--
-- Data for Name: majors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.majors (major_id, major_code, major_name, department_id) FROM stdin;
4	HTTT	Hệ thống thông tin	1
2	QT	Quản trị kinh doanh	4
5	KT	Kế toán	2
3	TC	Tài chính	2
1	CNTT	Công nghệ thông tin	1
6	MK	Marketing	4
7	TA	Tiếng Anh	3
8	DLT	Du lịch	5
9	KH	Khách sạn	5
10	TQ	Tiếng Trung	3
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (student_id, student_code, first_name, last_name, gender, dob, address, phone, email, avatar, cohort, status, academic_class_id, major_id) FROM stdin;
2	SV002	Hồng	Đỗ Nguyên	Nam	2003-11-19	1860 Trịnh Courts, Việt Trì, Việt Nam	0934479505	sv2@student.university.edu.vn	\N	2023	Tốt nghiệp	4	5
3	SV003	Long	Trịnh Vĩnh	Nam	2007-03-26	97448 Đức Siêu Hills, Mỹ Tho, Việt Nam	0964348190	sv3@student.university.edu.vn	\N	2023	Bảo lưu	5	3
4	SV004	Vân	Lý Thụy	Nam	2003-06-20	5933 Mạnh Hùng Well, Sóc Trăng, Việt Nam	0980819231	sv4@student.university.edu.vn	\N	2023	Tốt nghiệp	6	2
5	SV005	Huấn	Hồ Gia	Nam	2002-10-02	504 Trường Phát Falls, Thanh Hóa, Việt Nam	0950332803	sv5@student.university.edu.vn	\N	2023	Đang học	9	6
6	SV006	Vân	Tô Thảo	Nam	2005-02-13	9980 Trúc Liên Trail, Phan Thiết, Việt Nam	0937838280	sv6@student.university.edu.vn	\N	2023	Đang học	10	8
7	SV007	Khang	Mai Ngọc	Nữ	2004-08-16	1569 Mai Drive, Vũng Tàu, Việt Nam	0948480526	sv7@student.university.edu.vn	\N	2023	Tốt nghiệp	11	9
8	SV008	Vũ	Đào Huy	Nữ	2006-12-03	444 Tăng Throughway, Buôn Ma Thuột, Việt Nam	0942136203	sv8@student.university.edu.vn	\N	2023	Bảo lưu	13	7
9	SV009	Tuyền	Lâm Lương	Nam	2005-10-25	723 Nguyễn Oval, Quảng Hà, Việt Nam	0995965541	sv9@student.university.edu.vn	\N	2023	Tốt nghiệp	14	10
10	SV010	Uyên	Trương Phương	Nam	2007-08-25	84042 Kiên Lâm Estate, Tân Uyên, Việt Nam	0947068958	sv10@student.university.edu.vn	\N	2023	Thôi học	2	1
11	SV011	Ngân	Đỗ Thúy	Nữ	2002-10-15	931 Dương Squares, Nha Trang, Việt Nam	0941492301	sv11@student.university.edu.vn	\N	2023	Tốt nghiệp	3	4
12	SV012	Giang	Dương Chí	Nữ	2004-03-25	620 Đặng Pike, Mỹ Tho, Việt Nam	0949097427	sv12@student.university.edu.vn	\N	2023	Thôi học	4	5
13	SV013	Trí	Trịnh Dũng	Nữ	2004-03-10	4584 Hồng Lĩnh Gateway, Thủ Đức, Việt Nam	0923588958	sv13@student.university.edu.vn	\N	2023	Đang học	5	3
14	SV014	Trinh	Đoàn Vân	Nữ	2007-06-30	2511 Từ Ân Glens, Phan Thiết, Việt Nam	0918037160	sv14@student.university.edu.vn	\N	2023	Tốt nghiệp	7	2
15	SV015	Tiên	Tăng Hoa	Nam	2007-07-06	84069 Hạ Vy Avenue, Thủ Dầu Một, Việt Nam	0970890183	sv15@student.university.edu.vn	\N	2023	Bảo lưu	8	6
16	SV016	Kiên	Phan Thanh	Nam	2001-11-06	253 Hồ Trafficway, Thủ Dầu Một, Việt Nam	0992114422	sv16@student.university.edu.vn	\N	2023	Thôi học	10	8
17	SV017	Tiên	Hoàng Thủy	Nữ	2006-07-09	9955 Minh Toàn Motorway, Thủ Đức, Việt Nam	0940265446	sv17@student.university.edu.vn	\N	2023	Đang học	11	9
18	SV018	Phương	Phạm Nhật	Nam	2003-01-10	8642 Đoàn Locks, Thái Nguyên, Việt Nam	0941614803	sv18@student.university.edu.vn	\N	2023	Thôi học	13	7
19	SV019	Minh	Bùi Vũ	Nam	2002-12-30	9128 Đỗ Lights, Phan Thiết, Việt Nam	0953149960	sv19@student.university.edu.vn	\N	2023	Bảo lưu	15	10
20	SV020	Giang	Lê Hạ	Nữ	2004-05-21	311 Dương Island, Thái Nguyên, Việt Nam	0966414153	sv20@student.university.edu.vn	\N	2023	Tốt nghiệp	2	1
21	SV021	Bằng	Lâm Yên	Nam	2004-05-15	3544 Quang Lộc Ranch, Thủ Đức, Việt Nam	0941149170	sv21@student.university.edu.vn	\N	2023	Bảo lưu	3	4
22	SV022	Lam	Dương Hiểu	Nam	2007-09-15	7006 Đỗ Radial, Huế, Việt Nam	0955526331	sv22@student.university.edu.vn	\N	2023	Bảo lưu	4	5
23	SV023	Hòa	Đặng Tất	Nữ	2003-05-26	9912 Thành Sang Key, Mỹ Tho, Việt Nam	0918787656	sv23@student.university.edu.vn	\N	2023	Đang học	5	3
24	SV024	Loan	Đoàn Phượng	Nam	2004-05-06	1303 Công Ân Key, Nghi Sơn, Việt Nam	0985764908	sv24@student.university.edu.vn	\N	2023	Đang học	6	2
25	SV025	Phi	Mai Đức	Nam	2006-02-02	602 Bùi Mountain, Huế, Việt Nam	0933640020	sv25@student.university.edu.vn	\N	2023	Bảo lưu	8	6
26	SV026	Vu	Dương Minh	Nữ	2004-02-18	920 Tiểu Bảo Dam, Vinh, Việt Nam	0999338000	sv26@student.university.edu.vn	\N	2023	Thôi học	10	8
27	SV027	Vinh	Nguyễn Hồng	Nữ	2007-08-27	755 Hà Giang Burgs, Huế, Việt Nam	0963776920	sv27@student.university.edu.vn	\N	2023	Thôi học	11	9
28	SV028	Dung	Mai Từ	Nam	2006-06-15	4056 Quỳnh Nga Spurs, Mỹ Tho, Việt Nam	0974852667	sv28@student.university.edu.vn	\N	2023	Đang học	12	7
29	SV029	Anh	Trương Tùy	Nữ	2005-04-02	676 Thanh Vân Gateway, Quy Nhơn, Việt Nam	0964805540	sv29@student.university.edu.vn	\N	2023	Đang học	15	10
30	SV030	Thuận	Lý Chính	Nam	2003-05-12	21275 Bùi Key, Quảng Hà, Việt Nam	0989251897	sv30@student.university.edu.vn	\N	2023	Thôi học	2	1
31	SV031	Anh	Vũ Bảo	Nam	2003-01-31	3287 Đoàn Rapids, Thủ Dầu Một, Việt Nam	0959395603	sv31@student.university.edu.vn	\N	2023	Tốt nghiệp	3	4
32	SV032	Dũng	Đinh Anh	Nam	2006-06-02	278 Mai Lodge, Hải Dương, Việt Nam	0955819916	sv32@student.university.edu.vn	\N	2023	Bảo lưu	4	5
33	SV033	Vy	Mai Hải	Nữ	2007-06-17	598 Lâm Mountains, Thanh Hóa, Việt Nam	0987587346	sv33@student.university.edu.vn	\N	2023	Thôi học	5	3
34	SV034	Tường	Lý Cát	Nữ	2005-10-31	6832 Trịnh Extensions, Nghi Sơn, Việt Nam	0951872704	sv34@student.university.edu.vn	\N	2023	Đang học	7	2
35	SV035	Việt	Tăng Dũng	Nam	2006-06-18	343 Hải Vân Oval, Hanoi, Việt Nam	0928552513	sv35@student.university.edu.vn	\N	2023	Tốt nghiệp	8	6
36	SV036	Mai	Đỗ Trúc	Nam	2002-06-12	3949 Anh Thi Manor, Biên Hòa, Việt Nam	0952074087	sv36@student.university.edu.vn	\N	2023	Đang học	10	8
37	SV037	Kiên	Lê Thanh	Nam	2006-01-30	318 Đặng Circles, Haiphong, Việt Nam	0961769214	sv37@student.university.edu.vn	\N	2023	Tốt nghiệp	11	9
38	SV038	Anh	Dương Huyền	Nam	2007-04-07	507 Kim Phú River, Quy Nhơn, Việt Nam	0998927934	sv38@student.university.edu.vn	\N	2023	Bảo lưu	13	7
39	SV039	Khánh	Phan Quốc	Nam	2006-04-30	2902 Thục Quyên Club, Phan Thiết, Việt Nam	0915980608	sv39@student.university.edu.vn	\N	2023	Tốt nghiệp	14	10
40	SV040	Như	Đặng Bích	Nữ	2004-10-16	9210 Viễn Đông Shoals, Buôn Ma Thuột, Việt Nam	0913942534	sv40@student.university.edu.vn	\N	2023	Tốt nghiệp	1	1
41	SV041	Quyên	Đặng Mai	Nữ	2007-07-22	25423 Hoàng Mỹ Greens, Nam Định, Việt Nam	0967958578	sv41@student.university.edu.vn	\N	2023	Bảo lưu	3	4
42	SV042	Hường	Trần Mỹ	Nữ	2007-02-18	704 Trương Garden, Quảng Hà, Việt Nam	0951686062	sv42@student.university.edu.vn	\N	2023	Đang học	4	5
43	SV043	Lan	Mai Ngọc	Nam	2004-10-14	7463 Lâm Mountains, Tân An, Việt Nam	0915235342	sv43@student.university.edu.vn	\N	2023	Thôi học	5	3
44	SV044	Vy	Trịnh Trúc	Nữ	2007-01-17	151 Anh Quân Manor, Thủ Dầu Một, Việt Nam	0914963367	sv44@student.university.edu.vn	\N	2023	Tốt nghiệp	6	2
45	SV045	Lý	Đoàn Minh	Nữ	2005-03-09	93607 Đặng Glens, Thủ Dầu Một, Việt Nam	0977073163	sv45@student.university.edu.vn	\N	2023	Bảo lưu	9	6
46	SV046	Trí	Lê Dũng	Nữ	2007-06-15	9227 Đoàn Corners, Thái Nguyên, Việt Nam	0972966704	sv46@student.university.edu.vn	\N	2023	Bảo lưu	10	8
47	SV047	Hải	Trịnh Công	Nam	2007-09-21	641 Đặng Junctions, Hanoi, Việt Nam	0917290396	sv47@student.university.edu.vn	\N	2023	Bảo lưu	11	9
48	SV048	Linh	Đỗ Huệ	Nam	2005-11-28	12615 Liên Phương Terrace, Thủ Đức, Việt Nam	0933284231	sv48@student.university.edu.vn	\N	2023	Tốt nghiệp	12	7
49	SV049	Khê	Phùng An	Nữ	2002-01-07	66827 Đan Thanh Meadows, Quy Nhơn, Việt Nam	0984183852	sv49@student.university.edu.vn	\N	2023	Tốt nghiệp	15	10
50	SV050	Nhi	Tô Lâm	Nữ	2006-06-04	81622 Đoàn Forks, Hải Dương, Việt Nam	0952316192	sv50@student.university.edu.vn	\N	2023	Tốt nghiệp	1	1
51	SV051	Thành	Hoàng Trường	Nữ	2004-01-15	85542 Nguyễn Dale, Nha Trang, Việt Nam	0993791888	sv51@student.university.edu.vn	\N	2023	Thôi học	3	4
52	SV052	Chinh	Phạm Trường	Nam	2003-03-03	240 Mạnh Tuấn Prairie, Buôn Ma Thuột, Việt Nam	0959608912	sv52@student.university.edu.vn	\N	2023	Tốt nghiệp	4	5
53	SV053	Ngọc	Mai Tuấn	Nam	2006-06-06	7213 Đặng Rue, Mỹ Tho, Việt Nam	0993634684	sv53@student.university.edu.vn	\N	2023	Tốt nghiệp	5	3
54	SV054	Tài	Hoàng Đức	Nam	2003-05-14	19231 Đoàn Coves, Hải Dương, Việt Nam	0981206084	sv54@student.university.edu.vn	\N	2023	Thôi học	6	2
55	SV055	Cương	Bùi Hữu	Nam	2005-11-30	3440 Đặng Locks, Thái Nguyên, Việt Nam	0995733916	sv55@student.university.edu.vn	\N	2023	Thôi học	9	6
56	SV056	Châu	Hồ Ly	Nữ	2004-05-19	27837 Lê Valleys, Tân Uyên, Việt Nam	0985952809	sv56@student.university.edu.vn	\N	2023	Thôi học	10	8
57	SV057	Hảo	Phùng Bích	Nữ	2003-10-17	104 Hải Hà Well, Phan Thiết, Việt Nam	0952283087	sv57@student.university.edu.vn	\N	2023	Thôi học	11	9
58	SV058	Lâm	Vương Tuyền	Nam	2006-08-07	563 Đặng Keys, Huế, Việt Nam	0936249528	sv58@student.university.edu.vn	\N	2023	Thôi học	13	7
59	SV059	Hữu	Đinh Trí	Nữ	2005-06-23	8362 Trí Hào Walks, Vũng Tàu, Việt Nam	0916464583	sv59@student.university.edu.vn	\N	2023	Đang học	15	10
60	SV060	Long	Dương Bá	Nam	2007-04-05	8302 Hữu Long Brooks, Việt Trì, Việt Nam	0962742928	sv60@student.university.edu.vn	\N	2023	Tốt nghiệp	2	1
61	SV061	Liên	Tô Kim	Nam	2005-09-04	48101 Hoàng Canyon, Quy Nhơn, Việt Nam	0918978914	sv61@student.university.edu.vn	\N	2023	Đang học	3	4
62	SV062	Phong	Hoàng Nguyên	Nữ	2007-06-19	5056 Thế Sơn Gateway, Sóc Trăng, Việt Nam	0976581815	sv62@student.university.edu.vn	\N	2023	Bảo lưu	4	5
63	SV063	Hân	Vũ Gia	Nam	2005-06-27	4245 Cát Tiên Court, Quy Nhơn, Việt Nam	0925941603	sv63@student.university.edu.vn	\N	2023	Đang học	5	3
64	SV064	Loan	Bùi Phương	Nữ	2005-10-04	9975 Thiên Phú Manors, Việt Trì, Việt Nam	0921043637	sv64@student.university.edu.vn	\N	2023	Tốt nghiệp	7	2
65	SV065	Sáng	Trần Quang	Nữ	2006-12-24	140 Phan Avenue, Thái Bình, Việt Nam	0977711148	sv65@student.university.edu.vn	\N	2023	Thôi học	8	6
66	SV066	Lan	Lê Linh	Nữ	2002-11-19	782 Quang Triều Lights, Thái Bình, Việt Nam	0945918721	sv66@student.university.edu.vn	\N	2023	Bảo lưu	10	8
67	SV067	Quyền	Đinh Nghị	Nam	2003-04-28	45916 Uyển Khanh Mill, Tân An, Việt Nam	0927247900	sv67@student.university.edu.vn	\N	2023	Tốt nghiệp	11	9
68	SV068	Nhã	Lê Trang	Nam	2002-03-01	15503 Dương Drives, Thủ Đức, Việt Nam	0981844319	sv68@student.university.edu.vn	\N	2023	Đang học	12	7
1	SV001	Lâm	Trương Tuyền	Nam	2007-02-27	76 Đồng Bằng Spurs, Nam Định, Việt Nam	0354250164	sv1@student.university.edu.vn	\N	2021	Tốt nghiệp	3	4
103	SV111	An	Nguyễn	Nam	2003-01-10	54 Tăng Nhơn Phú, Thủ Đức, Tp Hồ Chí Minh	0901234567	an.nguyen@example.com	\N	2021	Active	1	1
104	SV112	Bình	Trần	Nữ	2003-05-22	34 Lam Sơn, Nghĩa Bình, Thanh Hóa	0902345678	binh.tran@example.com	\N	2021	Active	1	1
105	SV113	Chi	Lê	Nữ	2002-11-12	44 Nguyễn Huệ, Tuy Phước, Bình Định	0903456789	chi.le@example.com	\N	2020	Inactive	2	2
106	SV114	Dũng	Phạm	Nam	2004-03-15	85 Đào Tấn, Trạch An, Lào Cai	0904567890	dung.pham@example.com	\N	2022	Active	2	2
107	SV115	Hương	Võ	Nữ	2003-09-09	22 Hoàn Kiếm, Hà Nội	0905678901	huong.vo@example.com	\N	2021	Active	1	3
69	SV069	Phương	Lê Trúc	Nam	2007-08-21	443 Bùi Walks, Tân An, Việt Nam	0936151243	sv69@student.university.edu.vn	\N	2023	Đang học	15	10
70	SV070	Dương	Trịnh Quang	Nữ	2003-05-03	357 Việt Khải Circles, Vũng Tàu, Việt Nam	0983666745	sv70@student.university.edu.vn	\N	2023	Đang học	1	1
\.


--
-- Data for Name: user_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_account (user_id, username, password, role, is_active, student_id, lecturer_id) FROM stdin;
18	SV018	SV018	student	t	18	\N
19	SV019	SV019	student	t	19	\N
20	SV020	SV020	student	t	20	\N
21	SV021	SV021	student	t	21	\N
22	SV022	SV022	student	t	22	\N
23	SV023	SV023	student	t	23	\N
24	SV024	SV024	student	t	24	\N
25	SV025	SV025	student	t	25	\N
26	SV026	SV026	student	t	26	\N
27	SV027	SV027	student	t	27	\N
28	SV028	SV028	student	t	28	\N
29	SV029	SV029	student	t	29	\N
30	SV030	SV030	student	t	30	\N
31	SV031	SV031	student	t	31	\N
32	SV032	SV032	student	t	32	\N
33	SV033	SV033	student	t	33	\N
34	SV034	SV034	student	t	34	\N
35	SV035	SV035	student	t	35	\N
36	SV036	SV036	student	t	36	\N
37	SV037	SV037	student	t	37	\N
38	SV038	SV038	student	t	38	\N
39	SV039	SV039	student	t	39	\N
40	SV040	SV040	student	t	40	\N
41	SV041	SV041	student	t	41	\N
42	SV042	SV042	student	t	42	\N
43	SV043	SV043	student	t	43	\N
44	SV044	SV044	student	t	44	\N
45	SV045	SV045	student	t	45	\N
46	SV046	SV046	student	t	46	\N
47	SV047	SV047	student	t	47	\N
48	SV048	SV048	student	t	48	\N
49	SV049	SV049	student	t	49	\N
50	SV050	SV050	student	t	50	\N
51	SV051	SV051	student	t	51	\N
52	SV052	SV052	student	t	52	\N
53	SV053	SV053	student	t	53	\N
54	SV054	SV054	student	t	54	\N
55	SV055	SV055	student	t	55	\N
56	SV056	SV056	student	t	56	\N
57	SV057	SV057	student	t	57	\N
58	SV058	SV058	student	t	58	\N
59	SV059	SV059	student	t	59	\N
60	SV060	SV060	student	t	60	\N
61	SV061	SV061	student	t	61	\N
62	SV062	SV062	student	t	62	\N
63	SV063	SV063	student	t	63	\N
64	SV064	SV064	student	t	64	\N
65	SV065	SV065	student	t	65	\N
66	SV066	SV066	student	t	66	\N
67	SV067	SV067	student	t	67	\N
68	SV068	SV068	student	t	68	\N
71	GV1	$2b$10$e0rFjK/qcgY9yaV4kWHiau2os09XtHvXe06mEjThdsnjGl84IU8OK	lecturer	t	\N	1
16	SV016	$2b$10$TnOEl..CuQR2jrTzzOBWNOFTPHJQ0zXxG0JRXkGlmXNncaRCyT1.q	student	t	16	\N
82	SV002	$2b$10$fvVRoMxgMvnOd0fezfhy6uu40AVL0ZDCyrr2mgnTZjyHYJA2Rs15O	student	t	2	\N
69	SV069	$2b$10$Q2OW9xpJAPQXQBZOPCshreAr/REDnID41XQyl8ybwkmQxSBKPDGLW	student	t	69	\N
70	SV070	$2b$10$f2UMF0MtUy2A1iWABxhwPeaXyFEgq68lbzFXM3k2vgwGl0ejdqv.W	student	t	70	\N
72	GV2	$2b$10$U/7LdAp/jPQqre4.gVoFVuztnM.atkPOiUmL9K9H4MIFH7gFk6MUW	lecturer	t	\N	2
73	GV3	$2b$10$AU1bHqJTdgQwN.E6eMccfOb7WWjwx7syj4vHIw7FpndaT/FWszye2	lecturer	t	\N	3
74	GV4	$2b$10$o5QAmXHel8FWIFvRwziMI.yVsJlgii45zBlQI3scxbrw0ajMfY.xi	lecturer	t	\N	4
83	SV011	$2b$10$mqfwjV3Bj2mJNvzmCKzk8OWGCJEJta7vdciDvbQI8xw9.kDUHgQmm	student	t	11	\N
84	SV015	$2b$10$9F2jyJaNdRNs/ZH/8SUlfu/.6ljWsa8TOpCYWHeifLWFoObL9oxxK	student	t	15	\N
81	admin	$2b$10$MuX.Ej.AYZIeYpgUYhN3Fuu7.Yd1hCV96FntBYlPCxgtMTJqXQrqe	admin	t	\N	\N
\.


--
-- Name: academic_class_academic_class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academic_class_academic_class_id_seq', 15, true);


--
-- Name: class_section_class_section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.class_section_class_section_id_seq', 17, true);


--
-- Name: courses_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_course_id_seq', 10, true);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 5, true);


--
-- Name: enrollment_enrollment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enrollment_enrollment_id_seq', 252, true);


--
-- Name: grades_grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_grade_id_seq', 254, true);


--
-- Name: lecturers_lecturer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lecturers_lecturer_id_seq', 31, true);


--
-- Name: major_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.major_courses_id_seq', 27, true);


--
-- Name: majors_major_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.majors_major_id_seq', 10, true);


--
-- Name: students_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_student_id_seq', 107, true);


--
-- Name: user_account_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_account_user_id_seq', 84, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: academic_class academic_class_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_class
    ADD CONSTRAINT academic_class_pkey PRIMARY KEY (academic_class_id);


--
-- Name: class_section class_section_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_section
    ADD CONSTRAINT class_section_pkey PRIMARY KEY (class_section_id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: enrollment enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment
    ADD CONSTRAINT enrollment_pkey PRIMARY KEY (enrollment_id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (grade_id);


--
-- Name: lecturers lecturers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_pkey PRIMARY KEY (lecturer_id);


--
-- Name: major_courses major_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.major_courses
    ADD CONSTRAINT major_courses_pkey PRIMARY KEY (id);


--
-- Name: majors majors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.majors
    ADD CONSTRAINT majors_pkey PRIMARY KEY (major_id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);


--
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (user_id);


--
-- Name: academic_class_class_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX academic_class_class_code_key ON public.academic_class USING btree (class_code);


--
-- Name: class_section_section_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX class_section_section_code_key ON public.class_section USING btree (section_code);


--
-- Name: courses_course_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX courses_course_code_key ON public.courses USING btree (course_code);


--
-- Name: departments_department_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX departments_department_code_key ON public.departments USING btree (department_code);


--
-- Name: grades_enrollment_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX grades_enrollment_id_key ON public.grades USING btree (enrollment_id);


--
-- Name: lecturers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX lecturers_email_key ON public.lecturers USING btree (email);


--
-- Name: lecturers_lecturer_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX lecturers_lecturer_code_key ON public.lecturers USING btree (lecturer_code);


--
-- Name: majors_major_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX majors_major_code_key ON public.majors USING btree (major_code);


--
-- Name: students_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX students_email_key ON public.students USING btree (email);


--
-- Name: students_student_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX students_student_code_key ON public.students USING btree (student_code);


--
-- Name: uq_enrollment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_enrollment ON public.enrollment USING btree (student_id, class_section_id);


--
-- Name: uq_major_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_major_course ON public.major_courses USING btree (major_id, course_id);


--
-- Name: user_account_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_account_username_key ON public.user_account USING btree (username);


--
-- Name: enrollment fk_class_section; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment
    ADD CONSTRAINT fk_class_section FOREIGN KEY (class_section_id) REFERENCES public.class_section(class_section_id) ON DELETE CASCADE;


--
-- Name: class_section fk_course; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_section
    ADD CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;


--
-- Name: major_courses fk_course; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.major_courses
    ADD CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;


--
-- Name: courses fk_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE CASCADE;


--
-- Name: majors fk_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.majors
    ADD CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE CASCADE;


--
-- Name: grades fk_enrollment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT fk_enrollment FOREIGN KEY (enrollment_id) REFERENCES public.enrollment(enrollment_id) ON DELETE CASCADE;


--
-- Name: academic_class fk_lecturer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_class
    ADD CONSTRAINT fk_lecturer FOREIGN KEY (lecturer_id) REFERENCES public.lecturers(lecturer_id) ON DELETE SET NULL;


--
-- Name: class_section fk_lecturer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_section
    ADD CONSTRAINT fk_lecturer FOREIGN KEY (lecturer_id) REFERENCES public.lecturers(lecturer_id) ON DELETE SET NULL;


--
-- Name: academic_class fk_major; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_class
    ADD CONSTRAINT fk_major FOREIGN KEY (major_id) REFERENCES public.majors(major_id) ON DELETE CASCADE;


--
-- Name: major_courses fk_major; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.major_courses
    ADD CONSTRAINT fk_major FOREIGN KEY (major_id) REFERENCES public.majors(major_id) ON DELETE CASCADE;


--
-- Name: enrollment fk_student; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment
    ADD CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE;


--
-- Name: user_account fk_user_lecturer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_lecturer FOREIGN KEY (lecturer_id) REFERENCES public.lecturers(lecturer_id);


--
-- Name: user_account fk_user_student; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT fk_user_student FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: lecturers lecturers_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON DELETE SET NULL;


--
-- Name: students students_academic_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_academic_class_id_fkey FOREIGN KEY (academic_class_id) REFERENCES public.academic_class(academic_class_id) ON DELETE SET NULL;


--
-- Name: students students_major_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_major_id_fkey FOREIGN KEY (major_id) REFERENCES public.majors(major_id) ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

