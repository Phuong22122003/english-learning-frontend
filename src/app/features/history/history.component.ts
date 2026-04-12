import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HistoryService } from '../../services/HistoryService';
import { FilterType } from '../../models/request/filter-type';
import { ExamHistoryResponse } from '../../models/response/exam-history-response.model';
import { environment } from '../../../environments/environment';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { ItemTypeEnum } from '../../models/item-type-enum';
import { CommonUtils } from '../../shared/utils/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent implements OnInit {
  constructor(private historyService: HistoryService) {}

  history: ExamHistoryResponse[] = [];
  currentPage = 1;
  readonly PAGE_SIZE = environment.PAGE_SIZE;
  totalPages = 1;
  selectedFilter: FilterType = FilterType.ALL;
  isLoading = false;
  itemType = ItemTypeEnum;
  common = CommonUtils;
  // Filter options
  filterOptions = [
    { value: FilterType.ALL, label: 'All' },
    { value: FilterType.GRAMMAR, label: 'Grammar' },
    { value: FilterType.LISTENING, label: 'Listening' },
    { value: FilterType.VOCABULARY, label: 'Vocabulary' },
    { value: FilterType.FULL_TEST, label: 'TOEIC' },
  ];

  ngOnInit(): void {
    this.loadHistory(this.currentPage - 1);
  }

  handlePageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadHistory(page - 1);
    }
  }

  onFilterChange(filter: FilterType) {
    this.selectedFilter = filter;
    this.currentPage = 1; // Reset to first page when filter changes
    this.loadHistory(0);
  }

  loadHistory(page: number) {
    this.historyService
      .getHistory(page, this.PAGE_SIZE, this.selectedFilter)
      .subscribe({
        next: (data) => {
          this.history = data.content;
          this.totalPages = data.totalPages;
        },
        error: (error) => {
},
      });
  }

  getTestTypeLabel(testType: string): string {
    switch (testType) {
      case 'GRAMMAR':
        return 'Grammar';
      case 'LISTENING':
        return 'Listening';
      case 'VOCABULARY':
        return 'Vocabulary';
      case 'FULL_TEST':
        return 'TOEIC';
      default:
        return testType;
    }
  }

  getSelectedFilterLabel(): string {
    const option = this.filterOptions.find(
      (f) => f.value === this.selectedFilter
    );
    return option ? option.label : 'All';
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }
}
