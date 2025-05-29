import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Lesson } from './lesson.model';

@Injectable({
  providedIn: 'root',
})
export class LessonService {
  private apiUrl = 'http://localhost:3000/api/courses'; // כתובת ה-API של הקורסים

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // 📌 1️⃣ קבלת כל השיעורים בקורס
  getLessonsByCourseId(courseId: number): Observable<Lesson[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/${courseId}/lessons`, { headers });
  }

  // 📌 2️⃣ קבלת פרטי שיעור לפי ID
  getLessonById(courseId: number, lessonId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`, { headers });
  }

  // 📌 3️⃣ יצירת שיעור חדש (למורים בלבד)
  createLesson(courseId: number, title: string, content: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(
      `${this.apiUrl}/${courseId}/lessons`,
      { title, content, courseId },
      { headers }
    );
  }

  // 📌 4️⃣ עדכון שיעור קיים (למורים בלבד)
  updateLesson(courseId: number, lessonId: number, lessonData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/${courseId}/lessons/${lessonId}`, lessonData, { headers });
  }

  // 📌 5️⃣ מחיקת שיעור (למורים בלבד)
  deleteLesson(courseId: number, lessonId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${courseId}/lessons/${lessonId}`, { headers });
  }
}