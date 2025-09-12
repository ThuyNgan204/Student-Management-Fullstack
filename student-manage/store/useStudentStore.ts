import {create} from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Student {
  id: number;
  name: string;
  class: string;
}

interface StudentState {
    students: Student[];
    addStudent: (name: string, studentClass: string) => void;
    updateStudent: (id: number, newName: string, newClass: string) => void;
    deleteStudent: (id: number) => void;
}

const useStudentStore = create<StudentState>()(
    persist(
        (set) => ({
        students: [],

        addStudent: (name, studentClass) =>
            set((state) => ({
                students: [
                    { id: Date.now(), name, class: studentClass},
                    ...state.students,
                ],
            })),
        
        updateStudent: (id, newName, newClass) =>
            set((state) => ({
                students: state.students.map((student) =>
                    student.id === id ? {...student, name: newName, class: newClass} : student
            ),
            })),

        deleteStudent: (id) =>
            set((state) => ({
                students: state.students.filter((student) => student.id !== id),
            })),
    }),
    {
        name: 'student-storage',
        storage: createJSONStorage(()=> localStorage),
    }
));

export default useStudentStore;