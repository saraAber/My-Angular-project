import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';

/**
 * Directive המאפשרת ל-textarea להתאים את גודלה אוטומטית לתוכן
 * שימוש: <textarea appAutoResize></textarea>
 */
@Directive({
  selector: 'textarea[appAutoResize]',
  standalone: true
})
export class AutoResizeDirective implements OnInit {
  constructor(private elementRef: ElementRef) {}

  @HostListener('input')
  onInput(): void {
    this.resize();
  }

  ngOnInit(): void {
    // התאמה ראשונית בעת טעינת הקומפוננטה
    if (this.elementRef.nativeElement.scrollHeight) {
      setTimeout(() => this.resize());
    }
  }

  private resize(): void {
    const textarea = this.elementRef.nativeElement;
    // איפוס הגובה לאוטומטי
    textarea.style.overflow = 'hidden';
    textarea.style.height = 'auto';
    // קביעת הגובה לפי גלילת התוכן
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}
