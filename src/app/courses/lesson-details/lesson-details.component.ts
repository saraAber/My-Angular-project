import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LessonService } from '../lesson.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lesson-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lesson-details.component.html',
  styleUrls: ['./lesson-details.component.css']
})
export class LessonDetailsComponent implements OnInit {
  courseId!: number;
  lessonId!: number;
  lesson: any;
  isLoading = true;
  progress: number = 0;
  lessonNumber: number = 1;

  constructor(private route: ActivatedRoute, private lessonService: LessonService) {}

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.lessonId = Number(this.route.snapshot.paramMap.get('lessonId'));
    this.lessonNumber = this.lessonId || 1;
    this.progress = 0;
    this.loadLessonDetails();
  }

  loadLessonDetails() {
    this.lessonService.getLessonById(this.courseId, this.lessonId).subscribe({
      next: (data) => {
        this.lesson = data;
        if (this.lesson && typeof this.lesson.completed === 'undefined') {
          this.lesson.completed = false;
        }
        if (this.lesson && this.lesson.completed) {
          this.progress = 100;
        } else {
          this.progress = 0;
        }
      },
      error: (err) => console.error("Error loading lesson:", err),
      complete: () => this.isLoading = false
    });
  }

  startLesson() {
    if (this.lesson) {
      this.lesson.completed = true;
      this.progress = 100;
    }
  }
}