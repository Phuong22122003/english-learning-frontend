import { Component, OnInit } from '@angular/core';
import { AdminVocabItemComponent } from '../admin-vocab-item/admin-vocab-item.component';
import { VocabularyService } from '../../../services/VocabularyService';
import { ActivatedRoute } from '@angular/router';
import { Vocabulary } from '../../../models/vocabulary/vocabulary.model';
import { CommonModule } from '@angular/common';
import { VocabEditComponent } from '../vocab-edit/vocab-edit.component';
import { VocabularyRequest } from '../../../models/request/vocabulary-request.model';
import { RequestType } from '../../../models/request-type.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { UploadByFileComponent } from '../upload-by-file/upload-by-file.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { AddVocabulariesByFileRequest } from '../../../models/request/add-vocabularies-by-file-request.model';
import { environment } from '../../../../environments/environment';

enum State {
  View,
  Edit,
  Create,
  Upload,
}

@Component({
  selector: 'app-vocabulary-topic-detail',
  standalone: true,
  imports: [
    AdminVocabItemComponent,
    CommonModule,
    VocabEditComponent,
    ConfirmDialogComponent,
    UploadByFileComponent,
    FontAwesomeModule,
  ],
  templateUrl: './vocabulary-topic-detail.component.html',
  styleUrl: './vocabulary-topic-detail.component.scss',
})
export class VocabularyTopicDetailComponent implements OnInit {
  faUpload = faUpload;
  vocabList: Vocabulary[] = [];
  name: string = '';
  State = State;
  currentState: State = State.View;
  vocabToEdit!: Vocabulary;
  topicId: string | null = '';
  vocabId: string | null = '';
  isShowConfirmDialog: boolean = false;
  excelTemplate = environment.excelVocabularyTemplate;
  constructor(
    private vocabService: VocabularyService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.topicId = this.route.snapshot.paramMap.get('topicId');

    if (this.topicId) {
      this.loadVocabularies(this.topicId);
    }
  }
  loadVocabularies(topicId: string) {
    this.vocabService.getVocabulariesByTopicId(topicId).subscribe({
      next: (data) => {
        this.vocabList = data.vocabularies;
        this.name = data.name;
      },
      error: (err) => {
},
    });
  }

  handleEdit(vocab: any) {
    const request: VocabularyRequest = {
      id: vocab.id,
      word: vocab.word,
      phonetic: vocab.phonetic,
      meaning: vocab.meaning,
      example: vocab.example,
      exampleMeaning: vocab.exampleMeaning,
      imageName: vocab.imageUrl,
      audioName: vocab.audioUrl,
      action: RequestType.UPDATE,
    };

    this.vocabService
      .updateVocabulary(vocab.id, request, vocab.imageFile, vocab.audioFile)
      .subscribe({
        next: (res) => {
          this.vocabList = this.vocabList.map((v) =>
            v.id === vocab.id ? res : v
          );
          this.backToView();
        },
        error: (err) => {
        },
      });
  }

  handleDelete(vocabId: string) {
    this.isShowConfirmDialog = true;
    this.vocabId = vocabId;
  }

  changeToEdit(vocab: Vocabulary) {
    this.currentState = State.Edit;
    this.vocabToEdit = vocab;
  }

  changeToCreate() {
    this.currentState = State.Create;
    this.vocabToEdit = {} as Vocabulary;
  }

  backToView() {
    this.currentState = State.View;
    this.vocabToEdit = {} as Vocabulary;
  }

  handleCancel() {
    this.backToView();
    this.vocabToEdit = {} as Vocabulary;
  }

  handleCreate(vocabToCreate: Vocabulary) {
    if (this.topicId) {
      const audios: File[] = [];
      const images: File[] = [];
      const vocabs: Vocabulary[] = [];
      if (vocabToCreate.audioFile) {
        audios.push(vocabToCreate.audioFile);
      }
      if (vocabToCreate.imageFile) {
        images.push(vocabToCreate.imageFile);
      }
      vocabToCreate.imageName = vocabToCreate.imageFile ? vocabToCreate.imageFile.name : '';
      vocabToCreate.audioName = vocabToCreate.audioFile ? vocabToCreate.audioFile.name : '';
      vocabs.push(vocabToCreate);
      this.vocabService
        .addVocabularies(this.topicId, vocabs, images, audios)
        .subscribe({
          next: (res) => {
            this.vocabList = this.vocabList.concat(res);
            this.backToView();
          },
          error: (err) => {
          },
        });
    }
  }

  handleConfirmDelete() {
    if (this.vocabId) {
      this.vocabService.deleteVocabulary(this.vocabId).subscribe({
        next: (res) => {
          this.vocabList = this.vocabList.filter((v) => v.id !== this.vocabId);
          this.isShowConfirmDialog = false;
          this.vocabId = null;
        },
        error: (err) => {
          this.isShowConfirmDialog = false;
          this.vocabId = null;
        },
      });
    }
  }

  handleCancelDelete() {
    this.isShowConfirmDialog = false;
    this.vocabId = null;
  }

  changeToUpload() {
    this.currentState = State.Upload;
  }

  handleUpload(files: {
    excelFile: File;
    imageFiles: File[];
    audioFiles: File[];
  }) {
    if (this.topicId) {
      const request: AddVocabulariesByFileRequest = {
        excelFile: files.excelFile,
        imageFiles: files.imageFiles,
        audioFiles: files.audioFiles,
      };
      this.vocabService
        .uploadVocabulariesByFile(this.topicId, request)
        .subscribe({
          next: (res) => {
            this.vocabList = this.vocabList.concat(res);
            this.currentState = State.View;
          },
          error: (err) => {
          },
        });
    }
  }
}
