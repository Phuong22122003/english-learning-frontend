import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFileAlt,
  faArrowLeft,
  faClock,
  faCheckCircle,
  faImage,
  faVolumeUp,
} from '@fortawesome/free-solid-svg-icons';
import { ToeicTestResponse } from '../../../../../../models/response/toeict-test-response.model';
import { ToeicTestQuestionResponse } from '../../../../../../models/response/toeic-test-question-response.model';
import { ToeicPart } from '../../../../../../models/toeic-part.enum';
import { ToeicTestService } from '../../../../../../services/ToeicTestService';

@Component({
  selector: 'app-full-test-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, DatePipe],
  templateUrl: './full-test-detail.component.html',
  styleUrl: './full-test-detail.component.scss',
})
export class FullTestDetailComponent implements OnInit {
  groupId: string = '';
  testId: string = '';
  test: ToeicTestResponse | null = null;
  isLoading = false;
  error: string | null = null;

  // FontAwesome icons
  faFileAlt = faFileAlt;
  faArrowLeft = faArrowLeft;
  faClock = faClock;
  faCheckCircle = faCheckCircle;
  faImage = faImage;
  faVolumeUp = faVolumeUp;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toeicTestService: ToeicTestService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.groupId = params['groupId'];
      this.testId = params['testId'];
      if (this.testId) {
        this.loadTest();
      }
    });
  }

  loadTest(): void {
    this.isLoading = true;
    this.error = null;

    // TODO: Implement API call
    this.toeicTestService.getTestById(this.testId).subscribe({
      next: (test) => {
        this.test = test;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải chi tiết bài test. Vui lòng thử lại.';},
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/full-test/groups', this.groupId]);
  }

  getPartLabel(part: number): string {
    return `Part ${part}`;
  }

  getPartBadgeClass(part: number): string {
    const partMap: { [key: string]: string } = {
      1: 'bg-blue-100 text-blue-700',
      2: 'bg-green-100 text-green-700',
      3: 'bg-yellow-100 text-yellow-700',
      4: 'bg-purple-100 text-purple-700',
      5: 'bg-red-100 text-red-700',
      6: 'bg-indigo-100 text-indigo-700',
    };
    return partMap[part] || 'bg-slate-100 text-slate-700';
  }

  getOptionKeys(options: { [key: string]: string }): string[] {
    return Object.keys(options).sort();
  }

  isCorrectAnswer(optionKey: string, correctAnswer: string): boolean {
    return optionKey === correctAnswer;
  }

  // Group questions by part
  getQuestionsByPart(): {
    part: ToeicPart;
    questions: ToeicTestQuestionResponse[];
    startIndex: number;
  }[] {
    if (!this.test?.questions) return [];

    const partMap = new Map<ToeicPart, ToeicTestQuestionResponse[]>();

    // Group questions by part
    this.test.questions.forEach((question) => {
      const part = question.part;
      if (!partMap.has(part)) {
        partMap.set(part, []);
      }
      partMap.get(part)!.push(question);
    });

    // Convert to array and sort by part number
    const result: {
      part: ToeicPart;
      questions: ToeicTestQuestionResponse[];
      startIndex: number;
    }[] = [];
    let currentIndex = 0;

    // Sort parts from 1 to 6
    const sortedParts = Array.from(partMap.keys()).sort((a, b) => a - b);

    sortedParts.forEach((part) => {
      const questions = partMap.get(part)!;
      result.push({
        part: part,
        questions: questions,
        startIndex: currentIndex,
      });
      currentIndex += questions.length;
    });

    return result;
  }

  getPartOrder(): ToeicPart[] {
    return [
      ToeicPart.PART_1,
      ToeicPart.PART_2,
      ToeicPart.PART_3,
      ToeicPart.PART_4,
      ToeicPart.PART_5,
      ToeicPart.PART_6,
    ];
  }
}
