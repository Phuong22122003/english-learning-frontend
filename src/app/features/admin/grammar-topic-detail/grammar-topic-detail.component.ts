import { Component, OnInit } from '@angular/core';
import { GrammarService } from '../../../services/GrammarService';
import { ActivatedRoute } from '@angular/router';
import { Grammar } from '../../../models/grammar/grammar.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RichTextEditorComponent } from '../../../shared/rich-text-editor/rich-text-editor.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

enum State {
  View,
  Edit,
  Create,
  Detail,
}

@Component({
  selector: 'app-grammar-topic-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RichTextEditorComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './grammar-topic-detail.component.html',
  styleUrl: './grammar-topic-detail.component.scss',
})
export class GrammarTopicDetailComponent implements OnInit {
  grammarList: Grammar[] = [];
  name: string = '';
  State = State;
  currentState: State = State.View;
  grammarToEdit!: Grammar;
  grammarToView!: Grammar;
  topicId: string | null = '';
  selectedImage: File | null = null;
  showDeleteConfirm = false;
  grammarToDelete: Grammar | null = null;
  constructor(
    private grammarService: GrammarService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.topicId = this.route.snapshot.paramMap.get('topicId');
    if (this.topicId) {
      this.loadGrammars(this.topicId);
    }
  }

  loadGrammars(topicId: string) {
    this.grammarService.getGrammarsByTopicId(topicId).subscribe({
      next: (data) => {
        this.grammarList = data.grammars;
        this.name = data.name;
      },
      error: (err) => {},
    });
  }

  handleViewDetail(grammar: Grammar) {
    this.currentState = State.Detail;
    this.grammarToView = grammar;
  }

  handleEdit(grammar: Grammar) {
    this.changeToEdit(grammar);
  }

  handleDelete(grammar: Grammar) {
    this.grammarToDelete = grammar;
    this.showDeleteConfirm = true;
  }

  changeToEdit(grammar: Grammar) {
    this.currentState = State.Edit;
    this.grammarToEdit = grammar;
  }

  changeToCreate() {
    this.currentState = State.Create;
    this.grammarToEdit = {} as Grammar;
  }

  backToView() {
    this.currentState = State.View;
    this.grammarToEdit = {} as Grammar;
    this.grammarToView = {} as Grammar;
  }

  handleCancel() {
    this.backToView();
    this.grammarToEdit = {} as Grammar;
  }

  handleCreate(grammarToCreate: Grammar) {
    if (this.topicId) {
      this.grammarService.addGrammar(grammarToCreate, this.topicId).subscribe({
        next: (res) => {
          this.grammarList = this.grammarList.concat(res);
          this.backToView();
        },
        error: (err) => {
        },
      });
    }
  }

  handleSaveEdit() {
    if (this.grammarToEdit && this.grammarToEdit.id) {
      this.grammarService
        .updateGrammar(this.grammarToEdit, this.grammarToEdit.id)
        .subscribe({
          next: (res) => {
            // Update the grammar in the list
            const index = this.grammarList.findIndex(
              (g) => g.id === this.grammarToEdit.id
            );
            if (index !== -1) {
              this.grammarList[index] = { ...this.grammarToEdit };
            }
            this.backToView();
          },
          error: (err) => {alert('Không thể cập nhật ngữ pháp');
          },
        });
    }
  }

  onContentChange(content: string): void {
    this.grammarToEdit.content = content;
  }

  onImageUpload(file: File): void {
    // Handle image upload for grammar content

    // You can implement your image upload logic here
    // For now, we'll just log the file
  }

  getSafeContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  onConfirmDelete() {
    if (this.grammarToDelete) {
      this.grammarService.deleteGrammar(this.grammarToDelete.id).subscribe({
        next: (res) => {
          // Remove the grammar from the list
          this.grammarList = this.grammarList.filter(
            (g) => g.id !== this.grammarToDelete!.id
          );
          this.showDeleteConfirm = false;
          this.grammarToDelete = null;
        },
        error: (err) => {alert('Không thể xóa ngữ pháp');
          this.showDeleteConfirm = false;
          this.grammarToDelete = null;
        },
      });
    }
  }

  onCancelDelete() {
    this.showDeleteConfirm = false;
    this.grammarToDelete = null;
  }
}
