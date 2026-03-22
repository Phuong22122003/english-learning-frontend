import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationComponent } from '../pagination/pagination.component'; // đường dẫn tùy bạn
import { TestBase } from '../../models/test-base';

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [CommonModule, DatePipe, PaginationComponent],
  templateUrl: './test-list.component.html',
})
export class TestListComponent implements OnInit {
  @Input() selectedTopicName: string = '';
  @Input() tests: TestBase[] = [];
  @Input() totalPages: number = 1;
  @Input() currentPage: number = 1;

  @Output() viewTest = new EventEmitter<TestBase>();
  @Output() editTest = new EventEmitter<TestBase>();
  @Output() deleteTest = new EventEmitter<TestBase>();
  @Output() createTest = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit(): void {
  }

  onViewTest(test: TestBase) {
    this.viewTest.emit(test);
  }

  onEditTest(test: TestBase) {
    this.editTest.emit(test);
  }

  onDeleteTest(test: TestBase) {
    this.deleteTest.emit(test);
  }

  onCreateTest() {
    this.createTest.emit();
  }

  onPageChangeHandler(page: number) {
    this.pageChange.emit(page);
  }
}
