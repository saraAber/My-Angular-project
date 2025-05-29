export interface Lesson {
  id: number;
  title: string;
  content: string;
  courseId: number;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}
