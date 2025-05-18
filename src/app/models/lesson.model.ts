// src/app/models/lesson.model.ts

// Defines the structure of a Lesson object based on the backend API documentation.
export interface Lesson {
    id: number; // Unique identifier for the lesson
    title: string; // The title of the lesson
    content: string; // The content of the lesson (e.g., text, video URL, etc.)
    courseId: number; // The ID of the course this lesson belongs to
  }
  
