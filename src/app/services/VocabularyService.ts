import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page } from '../models/page.model';
import { VocabTopic } from '../models/vocabulary/vocab-topic.model';
import { Vocabulary } from '../models/vocabulary/vocabulary.model';
import { VocabularyTest } from '../models/vocabulary/vocabulary-test.model';
import { VocabularyTestQuestion } from '../models/vocabulary/vocabulary-test-question.model';
import { VocabularyRequest } from '../models/request/vocabulary-request.model';
import { VocabularyTestRequest } from '../models/request/vocabulary-test-request.model';
import { AddVocabulariesByFileRequest } from '../models/request/add-vocabularies-by-file-request.model';
import { Level } from '../models/level.enum';
import { TopicType } from '../models/topic-type.enum';

@Injectable({
  providedIn: 'root',
})
export class VocabularyService {
  private apiUrl = `${environment.apiContentServiceUrl}/vocabulary`;
  private agentUrl = `${environment.apiAgentServiceUrl}`;
  private topicSource = new BehaviorSubject<Page<VocabTopic> | null>(null);
  topics$ = this.topicSource.asObservable();
  private topicsInPage = new Map<number, Page<VocabTopic>>();
  private lastCallApiTime: Date | null = null;
  constructor(private http: HttpClient) {}

  // 1. Get all topics
  getTopics(page: number = 0, size: number = 10){
    if(this.topicsInPage.has(page)){
      this.topicSource.next(this.topicsInPage.get(page) || null);
    }
    if(this.lastCallApiTime !== null && new Date().getTime() - this.lastCallApiTime.getTime() < 2 * 60 * 1000) return;
    this.lastCallApiTime = new Date();
    this.http.get<Page<VocabTopic>>(
      `${this.apiUrl}/topics?page=${page}&size=${size}`
    ).subscribe((response) => {
      // check cache and update
      if(this.topicsInPage.has(page)){
        const cached = this.topicsInPage.get(page);
        if (JSON.stringify(cached) !== JSON.stringify(response)) {
          this.topicsInPage.set(page, response);
          this.topicSource.next(response); 
        } 
      }
      else{
        this.topicsInPage.set(page, response);
        this.topicSource.next(response);
      }
      
    });
  }

  // 2. Get vocabularies by topic id
  getVocabulariesByTopicId(
    topicId: string,
    page: number = 0,
    size: number = 10
  ): Observable<{ name: string; id: string; vocabularies: Vocabulary[] }> {
    return this.http.get<{
      id: string;
      name: string;
      vocabularies: Vocabulary[];
    }>(
      `${this.apiUrl}/topics/${topicId}/vocabularies?page=${page}&size=${size}`
    );
  }

  // 3. Get tests by topic id
  getTestsByTopicId(
    topicId: string,
    page: number = 0,
    size: number = 10
  ): Observable<{
    name: string;
    id: string;
    tests: Page<VocabularyTest>;
  }> {
    return this.http.get<{
      name: string;
      id: string;
      tests: Page<VocabularyTest>;
    }>(`${this.apiUrl}/topics/${topicId}/tests?page=${page}&size=${size}`);
  }

  // 4. Get test questions by test id
  getTestQuestionsByTestId(testId: string): Observable<{
    id: string;
    name: string;
    duration: number;
    topicName: string;
    topicId: string;
    questions: VocabularyTestQuestion[];
  }> {
    return this.http.get<{
      id: string;
      name: string;
      duration: number;
      topicName: string;
      topicId: string;
      questions: VocabularyTestQuestion[];
    }>(`${this.apiUrl}/tests/${testId}/questions`);
  }

  // 5. Create topic
  createTopic(
    topic: { name: string; description: string; level?: Level },
    imageFile?: File
  ): Observable<VocabTopic> {
    const formData = new FormData();
    formData.append(
      'topic',
      new Blob([JSON.stringify(topic)], { type: 'application/json' })
    );
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.post<any>(`${this.apiUrl}/topics`, formData);
  }

  editTopic(
    topicId: string,
    topic: { name: string; description: string; level?: Level },
    imageFile?: File
  ): Observable<VocabTopic> {
    const formData = new FormData();
    formData.append(
      'topic',
      new Blob([JSON.stringify(topic)], { type: 'application/json' })
    );
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.put<any>(`${this.apiUrl}/topics/${topicId}`, formData);
  }

  // 6. Delete topic
  deleteTopic(topicId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/topics/${topicId}`);
  }

  // 7. Add vocabularies (multiple words + image/audio files)
  addVocabularies(
    topicId: string,
    vocabularies: any[],
    imageFiles: File[],
    audioFiles: File[]
  ): Observable<Vocabulary[]> {
    const formData = new FormData();
    // append list object dưới dạng JSON
    formData.append(
      'vocabularies',
      new Blob([JSON.stringify(vocabularies)], { type: 'application/json' })
    );

    // append nhiều file ảnh
    imageFiles.forEach((file) => formData.append('images', file));

    // append nhiều file audio
    audioFiles.forEach((file) => formData.append('audios', file));

    return this.http.post<any>(
      `${this.apiUrl}/topics/${topicId}/vocabularies`,
      formData
    );
  }

  // 8. Create test
  createTest(topicId: string, test: any, images: File[]): Observable<any> {
    const formData = new FormData();

    formData.append(
      'test',
      new Blob([JSON.stringify(test)], { type: 'application/json' })
    );

    images.forEach((file) => formData.append('images', file));

    return this.http.post<any>(
      `${this.apiUrl}/topics/${topicId}/tests`,
      formData
    );
  }

  // 9. Get test by id
  getTestById(testId: string): Observable<VocabularyTest> {
    return this.http.get<VocabularyTest>(
      `${this.apiUrl}/tests/${testId}/questions`
    );
  }

  // 10. Delete test
  deleteTest(testId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tests/${testId}`);
  }

  updateVocabulary(
    vocabularyId: string,
    vocabulary: VocabularyRequest,
    image: any,
    audio: any
  ): Observable<Vocabulary> {
    const formData = new FormData();
    formData.append(
      'request',
      new Blob([JSON.stringify(vocabulary)], { type: 'application/json' })
    );
    if (image && image instanceof File) {
      formData.append('image', image);
    }
    if (audio && audio instanceof File) {
      formData.append('audio', audio);
    }
    return this.http.put<Vocabulary>(
      `${this.apiUrl}/vocabularies/${vocabularyId}`,
      formData
    );
  }

  updateTest(
    testId: string,
    test: VocabularyTestRequest,
    images: File[]
  ): Observable<VocabularyTest> {
    const formData = new FormData();
    formData.append(
      'test',
      new Blob([JSON.stringify(test)], { type: 'application/json' })
    );
    images.forEach((file) => formData.append('images', file));
    return this.http.put<VocabularyTest>(
      `${this.apiUrl}/tests/${testId}`,
      formData
    );
  }

  deleteVocabulary(vocabularyId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/vocabularies/${vocabularyId}`);
  }

  searchVocabularies(
    query: string,
    page: number = 0,
    limit: number = 10
  ): Observable<Page<Vocabulary>> {
    return this.http.get<Page<Vocabulary>>(
      `${this.apiUrl}/search?q=${query}&page=${page}&limit=${limit}`
    );
  }

  uploadVocabulariesByFile(
    topicId: string,
    request: AddVocabulariesByFileRequest
  ): Observable<Vocabulary[]> {
    const formData = new FormData();
    formData.append('vocabulary_file', request.excelFile);
    request.imageFiles.forEach((file) => formData.append('images', file));
    request.audioFiles.forEach((file) => formData.append('audios', file));
    return this.http.post<Vocabulary[]>(
      `${this.apiUrl}/topics/${topicId}/file-vocabularies`,
      formData
    );
  }

  uploadTestsByFile(
    topicId: string,
    excelFile: File,
    images: File[]
  ): Observable<VocabularyTest[]> {
    const formData = new FormData();
    formData.append('test_file', excelFile);
    images.forEach((file) => formData.append('images', file));
    return this.http.post<VocabularyTest[]>(
      `${this.apiUrl}/topics/${topicId}/file-tests`,
      formData
    );
  }
}
