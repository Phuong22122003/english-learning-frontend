import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TopicCardComponent } from '../../../shared/topic-card/topic-card.component';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { TopicBase } from '../../../models/topic-base';
import { environment } from '../../../../environments/environment';
import { GrammarService } from '../../../services/GrammarService';
import { Router } from '@angular/router';
import { GrammarTopic } from '../../../models/grammar/grammar-topic.model';
import { GrammarTopicFormComponent } from '../grammar-topic-form/grammar-topic-form.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

enum State {
  View,
  Edit,
  Create,
}

@Component({
  selector: 'app-grammar-management',
  standalone: true,
  imports: [
    CommonModule,
    TopicCardComponent,
    PaginationComponent,
    GrammarTopicFormComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './grammar-management.component.html',
  styleUrl: './grammar-management.component.scss',
})
export class GrammarManagementComponent implements OnInit {
  State = State;
  currentState = State.View;
  topics: TopicBase[] = [];
  currentPage = 1;
  totalPages = 0;
  readonly PAGE_SIZE = environment.PAGE_SIZE;
  isShowConfirmDialog = false;
  topicToDelete: TopicBase | null = null;
  currentTopic!: TopicBase;
  constructor(private grammarService: GrammarService, private router: Router) {}
  ngOnInit(): void {
    this.loadData();
  }
  loadData() {
    this.topics = []; // Clear existing topics
    this.grammarService
      .getAllTopics(this.currentPage - 1, this.PAGE_SIZE)
      .subscribe((data) => {
        const result = data.content;
        result.forEach((item) => {
          const grammarTopic: TopicBase = {
            id: item.id,
            name: item.name,
            description: item.description,
            imageUrl: item.imageUrl,
            level: item.level,
          };
          this.topics.push(grammarTopic);
        });
        this.currentPage = data.pageable.pageNumber + 1;
        this.totalPages = data.totalPages;
      });
  }
  changeToCreate() {
    this.currentState = State.Create;
  }
  changeToView() {
    this.currentState = State.View;
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadData();
  }
  onCreateTopic(topic: GrammarTopic) {
    this.grammarService
      .createTopic(topic, topic.imageUrl as any)
      .subscribe((res) => {
        const newTopic: TopicBase = {
          id: res.id,
          name: res.name,
          description: res.description,
          imageUrl: res.imageUrl,
          level: res.level,
        };
        this.topics = this.topics.concat(newTopic);
        this.changeToView();
      });
  }
  onViewDetail(topic: TopicBase) {
    this.router.navigate(['/admin/grammar/manage', topic.id]);
  }
  onCancel() {
    this.changeToView();
  }

  onDelete(topic: TopicBase) {
    this.topicToDelete = topic;
    this.isShowConfirmDialog = true;
  }

  onCancelDelete() {
    this.isShowConfirmDialog = false;
  }

  confirmDelete() {
    if (this.topicToDelete) {
      this.grammarService.deleteTopic(this.topicToDelete.id).subscribe({
        next: (res: any) => {
          this.topics = this.topics.filter(
            (t) => t.id !== this.topicToDelete!.id
          );
          this.isShowConfirmDialog = false;
          this.changeToView();
        },
      });
    }
  }

  onChangeToEdit(topic: { id: string; data: TopicBase }) {
    this.currentState = State.Edit;
    this.currentTopic = topic.data;
  }

  onEdit(topic: GrammarTopic) {
    this.grammarService
      .editTopic(
        this.currentTopic.id,
        {
          name: topic.name,
          description: topic.description,
          level: topic.level,
        },
        topic.imageUrl as any
      )
      .subscribe(() => {
        this.currentState = State.View;
        this.loadData();
      });
  }
}
