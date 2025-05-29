import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CourseService } from '../courses/course.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  courses: any[] = [];
  popularCourses: any[] = [];

  constructor(private router: Router, private courseService: CourseService) {}

  ngOnInit() {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.pickRandomPopularCourses();
      },
      error: (err) => {
        this.courses = [];
        this.popularCourses = [];
      }
    });
  }

  pickRandomPopularCourses() {
    if (!this.courses || this.courses.length === 0) {
      this.popularCourses = [];
      return;
    }
    // Shuffle and pick 3
    const shuffled = this.courses.sort(() => 0.5 - Math.random());
    this.popularCourses = shuffled.slice(0, 3);
  }

  goToCourses() {
    this.router.navigate(['/courses']);
  }
}

