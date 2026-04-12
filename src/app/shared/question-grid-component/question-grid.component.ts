import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-question-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-grid.component.html',
})
export class QuestionGridComponent {
  @Input() totalQuestion: number = 0;
  @Input() selectedAnswers: (string | undefined)[] = []; // example ['A', undefined, 'B','C']
  @Input() markedQuestions: number[] = []; // example [1, 5]

  @Output() questionClick = new EventEmitter<number>();

  handleClick(index: number) {
    this.questionClick.emit(index);
  }

  isMarked(index: number): boolean {
    return this.markedQuestions.includes(index);
  }

  getAnswer(index: number): string {
    return this.selectedAnswers[index] || '';
  }
}
