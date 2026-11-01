import type { Material, Note, Quiz, Subject } from '../../../shared/types/common';
import type { AcademicSubject } from '../../academic/types/academic.types';
export const demoSubjects: Subject[] = [
  { id: 'dbms', name: 'Database Systems', code: 'CS 302', modules: 8, progress: 72, tint: 'lavender', icon: 'database' },
  { id: 'algo', name: 'Algorithms', code: 'CS 301', modules: 10, progress: 48, tint: 'mint', icon: 'braces' },
  { id: 'networks', name: 'Computer Networks', code: 'CS 303', modules: 7, progress: 35, tint: 'peach', icon: 'network' },
  { id: 'systems', name: 'Operating Systems', code: 'CS 304', modules: 9, progress: 61, tint: 'blue', icon: 'cpu' },
];
const demoModuleTitles: Record<string, string[]> = {
  dbms: ['Database foundations', 'Relational data model', 'SQL and query design', 'Normalization and design'],
  algo: ['Complexity analysis', 'Sorting and searching', 'Trees and heaps', 'Graph algorithms'],
  networks: ['Network foundations', 'Transport layer', 'Routing and addressing', 'Application protocols'],
  systems: ['Operating system concepts', 'Processes and threads', 'CPU scheduling', 'Memory management'],
};
export const demoAcademicStructure: AcademicSubject[] = demoSubjects.map((subject) => {
  const moduleItems = (demoModuleTitles[subject.id] ?? []).map((title, moduleIndex) => ({
    id: `${subject.id}-module-${moduleIndex + 1}`,
    title,
    position: moduleIndex + 1,
    topics: ['Core concepts', 'Worked examples', 'Review questions'].map((topic, topicIndex) => ({ id: `${subject.id}-module-${moduleIndex + 1}-topic-${topicIndex + 1}`, title: topic, position: topicIndex + 1 })),
  }));
  return {
    ...subject,
    modules: moduleItems.length,
    description: 'Build confidence with the core ideas, one topic at a time.',
    university: 'Your university',
    department: 'Computer Science & Engineering',
    program: 'Bachelor of Engineering',
    semester: 'Semester 3',
    moduleItems,
  };
});
export const demoCompletedTopicIds = demoAcademicStructure.flatMap((subject) => {
  const topics = subject.moduleItems.flatMap((module) => module.topics);
  return topics.slice(0, Math.round(topics.length * subject.progress / 100)).map((topic) => topic.id);
});
export const demoMaterials: Material[] = [
  { id: 'm1', title: 'Database normalization — complete notes', subject: 'Database Systems', kind: 'Lecture notes', author: 'Ananya Rao', date: 'Oct 28', size: '2.4 MB', color: 'lavender', bookmarked: true, pages: 24, description: 'A clear walkthrough of functional dependencies, normal forms, and decomposition with worked examples.' },
  { id: 'm2', title: 'Midterm examination · 2024', subject: 'Algorithms', kind: 'Past paper', author: 'CampusMind team', date: 'Oct 26', size: '840 KB', color: 'peach', bookmarked: false, pages: 8, description: 'Previous year examination paper covering asymptotic analysis, trees, and graph algorithms.' },
  { id: 'm3', title: 'TCP/IP essentials and subnetting', subject: 'Computer Networks', kind: 'Study guide', author: 'Dev Mehta', date: 'Oct 24', size: '1.6 MB', color: 'mint', bookmarked: false, pages: 16, description: 'A concise study guide with subnetting examples and a protocol reference.' },
  { id: 'm4', title: 'Process scheduling problem set', subject: 'Operating Systems', kind: 'Lecture notes', author: 'Priya Nair', date: 'Oct 22', size: '1.1 MB', color: 'blue', bookmarked: true, pages: 12, description: 'Practice problems for FCFS, SJF, priority, and round-robin scheduling.' },
  { id: 'm5', title: 'Graph algorithms quick reference', subject: 'Algorithms', kind: 'Reference', author: 'CampusMind team', date: 'Oct 20', size: '620 KB', color: 'lavender', bookmarked: false, pages: 5, description: 'A compact reference for BFS, DFS, shortest paths, and minimum spanning trees.' },
];
export const demoNotes: Note[] = [
  { id: 'n1', title: 'Normalization & functional dependencies', subject: 'Database Systems', updatedAt: 'Today, 10:42 AM', content: 'Normalization organizes relations to reduce redundancy.\n\n1NF: Atomic attribute values, no repeating groups.\n\n2NF: 1NF + no partial dependency on a candidate key.\n\n3NF: 2NF + no transitive dependency of non-key attributes.', tags: ['Exam prep', 'Module 3'], color: 'lavender' },
  { id: 'n2', title: 'Big-O patterns to remember', subject: 'Algorithms', updatedAt: 'Yesterday', content: 'Nested loop over n → O(n²).\n\nDivide and conquer recurrence T(n)=2T(n/2)+n → O(n log n).\n\nBinary search halves the search space on each step → O(log n).', tags: ['Revision'], color: 'mint' },
  { id: 'n3', title: 'TCP handshake', subject: 'Computer Networks', updatedAt: 'Oct 27', content: 'Three-way handshake:\n\n1. Client sends SYN.\n2. Server responds SYN-ACK.\n3. Client sends ACK.\n\nThe connection is established after all three steps.', tags: ['Module 2'], color: 'peach' },
];
export const demoQuizzes: Quiz[] = [
  { id: 'q1', title: 'Relational algebra fundamentals', subject: 'Database Systems', questions: 10, duration: 12, difficulty: 'Easy', lastScore: 80, attempts: 2 },
  { id: 'q2', title: 'Sorting & time complexity', subject: 'Algorithms', questions: 12, duration: 15, difficulty: 'Medium', lastScore: 67, attempts: 1 },
  { id: 'q3', title: 'Transport layer protocols', subject: 'Computer Networks', questions: 8, duration: 10, difficulty: 'Medium', attempts: 0 },
  { id: 'q4', title: 'CPU scheduling challenge', subject: 'Operating Systems', questions: 15, duration: 20, difficulty: 'Hard', attempts: 0 },
];
