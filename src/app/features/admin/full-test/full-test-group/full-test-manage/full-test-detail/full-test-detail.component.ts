import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFileAlt,
  faArrowLeft,
  faClock,
  faCheckCircle,
  faVolumeUp,
  faLayerGroup,
  faInfoCircle,
  faHeadphones
} from '@fortawesome/free-solid-svg-icons';
import { ToeicTestResponse } from '../../../../../../models/response/toeict-test-response.model';
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

  // Icons
  faFileAlt = faFileAlt;
  faArrowLeft = faArrowLeft;
  faClock = faClock;
  faCheckCircle = faCheckCircle;
  faVolumeUp = faVolumeUp;
  faLayerGroup = faLayerGroup;
  faInfoCircle = faInfoCircle;
  faHeadphones = faHeadphones

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
    this.toeicTestService.getTestById(this.testId).subscribe({
      next: (res) => {
        this.test = res;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Không thể tải dữ liệu bài test. Vui lòng kiểm tra kết nối!';
        this.isLoading = false;
      },
    });
  }

  // Group các nhóm câu hỏi theo Part để hiển thị theo phân đoạn
  getSectionsByPart() {
    if (!this.test?.questionGroups) return [];
    
    // Lấy danh sách các Part duy nhất và sắp xếp
    const uniqueParts = Array.from(new Set(this.test.questionGroups.map(g => g.part))).sort((a, b) => a - b);
    
    return uniqueParts.map(partNum => ({
      part: partNum,
      label: this.getPartLabel(partNum),
      groups: this.test!.questionGroups.filter(g => g.part === partNum)
    }));
  }

  getPartLabel(part: number): string {
    const partLabels: any = {
      1: 'Part 1: Photographs',
      2: 'Part 2: Question-Response',
      3: 'Part 3: Short Conversations',
      4: 'Part 4: Short Talks',
      5: 'Part 5: Incomplete Sentences',
      6: 'Part 6: Text Completion',
      7: 'Part 7: Reading Comprehension'
    };
    return partLabels[part] || `Part ${part + 1}`;
  }

  // Tính số thứ tự câu hỏi toàn cục (1-200)
  getGlobalQuestionNumber(currentGroupIdx: number, currentQuestionIdx: number): number {
    let total = 0;
    for (let i = 0; i < currentGroupIdx; i++) {
      total += this.test!.questionGroups[i].questions.length;
    }
    return total + currentQuestionIdx + 1;
  }

  getOptionKeys(options: any): string[] {
    return options ? Object.keys(options).sort() : [];
  }

  goBack(): void {
    this.router.navigate(['/admin/full-test/groups', this.groupId]);
  }
}