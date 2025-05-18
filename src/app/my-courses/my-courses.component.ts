import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MyCourse {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css']
})
export class MyCoursesComponent {
  myCourses: MyCourse[] = [
    { id: 101, name: 'Introduction to Programming with Python', description: 'Learn the basics of Python programming.' },
    { id: 102, name: 'Web Development Fundamentals', description: 'HTML, CSS, and JavaScript essentials.' },
    { id: 103, name: 'Data Science with R', description: 'Explore data analysis using the R language.' }
  ];
}