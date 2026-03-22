import { Component, OnInit } from '@angular/core';

import { ListeningService } from '../../../services/ListeningService';
import { TopicBase } from '../../../models/topic-base';
import { TopicCardComponent } from '../../../shared/topic-card/topic-card.component';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListeningTopicFormComponent } from '../listening-topic-form/listening-topic-form.component';
import { ListeningTopic } from '../../../models/listening/listening-topic.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { AiButtonComponent } from '../../../shared/ai-button/ai-button.component';
import { TopicGenerateComponent } from '../vocabulary-management/topic-generate/topic-generate.component';
import { AgentService } from '../../../services/AgentService';
import { TestGenerateRequest } from '../../../models/request/test-generate-request.model';

enum State {
  View,
  Edit,
  Create,
}

@Component({
  selector: 'app-listening-management',
  standalone: true,
  imports: [
    TopicCardComponent,
    PaginationComponent,
    CommonModule,
    ListeningTopicFormComponent,
    ConfirmDialogComponent,
    AiButtonComponent,
    TopicGenerateComponent,
  ],
  templateUrl: './listening-management.component.html',
  styleUrl: './listening-management.component.scss',
})
export class ListeningManagementComponent implements OnInit {
  State = State;
  currentState = State.View;
  topics: TopicBase[] = [];
  currentPage = 1;
  totalPages = 0;
  readonly PAGE_SIZE = environment.PAGE_SIZE;
  isShowConfirmDialog = false;
  topicToDelete: TopicBase | null = null;
  currentTopic!: TopicBase;
  isShowTopicGenerate = false;
  constructor(
    private listeningService: ListeningService,
    private router: Router,
    private agentService: AgentService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.topics = [];
    this.listeningService
      .getTopics(this.currentPage - 1, this.PAGE_SIZE)
      .subscribe((data) => {
        const result = data.content;
        result.forEach((item) => {
          const listeningTopic: TopicBase = {
            id: item.id,
            name: item.name,
            description: item.description,
            imageUrl: item.imageUrl,
            level: item.level,
          };
          this.topics.push(listeningTopic);
        });
        this.currentPage = data.pageable.pageNumber + 1;
        this.totalPages = data.totalPages;
      });
  }

  onViewDetail(topic: TopicBase) {
    this.router.navigate(['/admin/listening/manage', topic.id]);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadData();
  }

  changeToCreate() {
    this.currentState = State.Create;
  }

  changeToView() {
    this.currentState = State.View;
  }

  changeToEdit(listening: { id: string; data: TopicBase }) {
    this.currentState = State.Edit;
    this.currentTopic = listening.data;
  }

  onCreateTopic(topic: ListeningTopic) {
    this.listeningService
      .addTopic(topic, topic.imageUrl as any)
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

  onEditTopic(topic: ListeningTopic) {
    this.listeningService
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
        this.loadData();
        this.currentState = State.View;
      });
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
      this.listeningService.deleteTopic(this.topicToDelete.id).subscribe({
        next: (res: any) => {
          this.topics = this.topics.filter(
            (t) => t.id !== this.topicToDelete!.id
          );
          this.isShowConfirmDialog = false;
          this.changeToView();
        },
        error: (err: any) => {alert('Không thể xóa topic');
        },
      });
    }
  }

  onSubmitTestGenerate(data: { topicType: string; description: string }) {
    this.isShowTopicGenerate = false;
    this.agentService
      .generateTopic(data.topicType, data.description)
      .subscribe((res) => {
        this.loadData();
      });
  }
}
