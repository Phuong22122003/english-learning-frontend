import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Page } from '../../../models/page.model';

import {
  faArrowLeft,
  faChevronLeft,
  faChevronRight,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { GrammarService } from '../../../services/GrammarService';
import { GrammarTest } from '../../../models/grammar/grammar-test.model';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-grammar-tests',
  templateUrl: './grammar-tests.component.html',
  styleUrls: ['./grammar-tests.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, PaginationComponent],
})
export class GrammarTestsComponent implements OnInit {
  tests: GrammarTest[] = [];
  grammarId: string = '';
  grammarName: string = '';
  // Pagination
  currentPage = 1; // 1-based để dễ hiển thị
  totalPages = 0;
  readonly GRAMMAR_TESTS_PER_PAGE = environment.PAGE_SIZE;

  // Icons
  faArrowLeft = faArrowLeft;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faFileAlt = faFileAlt;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grammarService: GrammarService
  ) {}

  ngOnInit(): void {
    this.grammarId = this.route.snapshot.paramMap.get('grammarId')!;
    this.loadTests();
  }

  loadTests(): void {
    this.grammarService
      .getTestsByGrammarId(
        this.grammarId,
        this.currentPage - 1,
        this.GRAMMAR_TESTS_PER_PAGE
      )
      .subscribe((data) => {
        this.tests = data.grammarTests.content;
        this.totalPages = data.grammarTests.totalPages;
        this.grammarName = data.grammarName;
      });
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.loadTests();
  }

  handleTestClick(testId: string): void {
    this.router.navigate(['/grammar/tests', testId]);
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
