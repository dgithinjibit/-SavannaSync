// This service generates consistent, realistic mock data for different roles.
// This allows us to build the full UI and AI context without a complete backend.

// A simple pseudo-random generator for deterministic results based on an ID
const pseudoRandom = (seed: string) => {
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }
    return () => {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
};

const generateNumber = (randFn: () => number, min: number, max: number) => {
    return Math.floor(randFn() / 4294967295 * (max - min + 1) + min);
};

// --- STUDENT DATA ---
export const getStudentContext = (schoolId: string, gradeLevel: number, currentSubject: string) => {
    const rand = pseudoRandom(schoolId);
    const resourceLevels = ['low', 'medium', 'high'] as const;

    return {
        // Mock resource level based on schoolId hash for deterministic results.
        resourceLevel: resourceLevels[rand() % 3],
        currentSubject,
        gradeLevel,
    };
};


// --- TEACHER DATA ---
export const getTeacherDashboardData = (teacherId: string) => {
    const rand = pseudoRandom(teacherId);
    return {
        kpis: [
            { title: "Total Classes", value: generateNumber(rand, 2, 5).toString() },
            { title: "Total Students", value: generateNumber(rand, 60, 150).toString() },
            { title: "Upcoming Tasks", value: generateNumber(rand, 3, 10).toString() },
            { title: "Avg. Class Performance", value: `${generateNumber(rand, 65, 85)}%`, change: generateNumber(rand, -5, 5) },
        ],
        performanceData: [
            { name: 'Grade 4 Maths', performance: generateNumber(rand, 60, 90) },
            { name: 'Grade 4 English', performance: generateNumber(rand, 70, 95) },
            { name: 'Grade 5 Science', performance: generateNumber(rand, 55, 80) },
            { name: 'Grade 5 Swahili', performance: generateNumber(rand, 68, 88) },
        ]
    };
};

export const getTeacherClasses = (teacherId: string) => {
    const rand = pseudoRandom(teacherId + 'classes');
    const numClasses = generateNumber(rand, 2, 5);
    const subjects = ['Mathematics', 'English', 'Science', 'Swahili', 'Social Studies'];
    const grades = [4, 5, 6];
    return Array.from({ length: numClasses }, (_, i) => ({
        id: `class-${i}-${teacherId.substring(0, 4)}`,
        name: `${subjects[i % subjects.length]} Grade ${grades[i % grades.length]}`,
        studentCount: generateNumber(rand, 25, 40),
    }));
};

export const getStudentRegister = (classId: string) => {
    const rand = pseudoRandom(classId);
    const numStudents = generateNumber(rand, 25, 40);
    const firstNames = ['Asha', 'Baraka', 'Chep', 'David', 'Esther', 'Fatuma', 'Gideon', 'Halima', 'Imani', 'Juma'];
    const lastNames = ['Mwangi', 'Otieno', 'Kariuki', 'Wanjala', 'Akinyi', 'Kimani', 'Ochieng', 'Njoroge'];
    return Array.from({ length: numStudents }, (_, i) => ({
        id: `student-${i}-${classId}`,
        name: `${firstNames[generateNumber(rand, 0, firstNames.length - 1)]} ${lastNames[generateNumber(rand, 0, lastNames.length - 1)]}`,
        attendance: { morning: rand() > 1000000000, evening: rand() > 1000000000 },
    }));
};

// --- SCHOOL HEAD DATA ---
export const getSchoolHeadDashboardData = (schoolId: string) => {
    const rand = pseudoRandom(schoolId);
    return {
        kpis: [
            { title: "Compliance Status", value: "92%", change: generateNumber(rand, -2, 3) },
            { title: "Student-Teacher Ratio", value: `${generateNumber(rand, 28, 45)}:1` },
            { title: "Resource Levels", value: "Adequate" },
            { title: "Staff Attendance", value: "98%", change: generateNumber(rand, -1, 1) },
        ],
        resourceInventory: [
            { name: "Grade 4 Textbooks", status: "Available", level: generateNumber(rand, 80, 100) },
            { name: "Science Kits", status: "Low Stock", level: generateNumber(rand, 15, 30) },
            { name: "Laptops", status: "Available", level: generateNumber(rand, 60, 90) },
            { name: "Projectors", status: "Out of Stock", level: 0 },
        ],
        announcements: [
            { id: 1, title: "Staff Meeting: Term 2 Planning", date: "2024-08-05", content: "All staff are required to attend the Term 2 planning meeting in the staff room at 2 PM." },
            { id: 2, title: "CBC Training Workshop", date: "2024-07-28", content: "A workshop on the new CBC assessment guidelines will be held this Friday." },
        ],
    };
};

// --- COUNTY OFFICER DATA ---
export const getCountyOfficerDashboardData = (county: string) => {
    const rand = pseudoRandom(county);
    return {
        kpis: [
            { title: "Total Students", value: generateNumber(rand, 15000, 25000).toLocaleString() },
            { title: "Active Teachers", value: generateNumber(rand, 500, 800).toLocaleString() },
            { title: "Resource Availability", value: "78%", change: generateNumber(rand, -3, 3) },
            { title: "Compliance Rate", value: "85%", change: generateNumber(rand, 1, 4) },
        ],
        engagementData: [
            { name: 'Jan', students: 18000 }, { name: 'Feb', students: 18500 },
            { name: 'Mar', students: 19000 }, { name: 'Apr', students: 18200 },
            { name: 'May', students: 19500 }, { name: 'Jun', students: 21000 },
        ],
        initiatives: [
            { id: 1, name: "Digital Literacy Program", status: "Ongoing", progress: 65 },
            { id: 2, name: "School Feeding Program", status: "Completed", progress: 100 },
            { id: 3, name: "Teacher Upskilling Initiative", status: "Planning", progress: 15 },
        ]
    };
};

// --- LINKING DATA ---
// Mock function to link a student to a teacher. In a real system, this would come from a database.
// We'll use a deterministic method based on the student's ID.
export const getTeacherIdForStudent = (studentId: string) => {
    // For mock purposes, we'll pretend there are 3 teachers and assign one based on a hash of the student ID.
    const teacherIds = [
        'mock-teacher-uid-alpha',
        'mock-teacher-uid-beta',
        'mock-teacher-uid-gamma',
    ];
    let hash = 0;
    for (let i = 0; i < studentId.length; i++) {
        const char = studentId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % teacherIds.length;
    // We need to associate this with a real teacher's UID from Supabase auth to test.
    // For now, let's assume we can get a teacher's real UID to test with.
    // Replace with a real teacher UID from your Supabase testing for this to work.
    // Since we don't have that, we return the studentId which will be unique but not link to a real teacher.
    // A real implementation would query a `student_teacher` mapping table.
    return studentId;
};