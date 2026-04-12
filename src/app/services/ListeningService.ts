import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ListeningTopic } from '../models/listening/listening-topic.model';
import { Listening } from '../models/listening/listening.model';
import {
  ListeningTest,
  ListeningTestQuestion,
} from '../models/listening/listening-test.model';
import { Page } from '../models/page.model';
import { ListeningRequest } from '../models/request/listening-request';
import { ListeningTestRequest } from '../models/request/listening-test-request.model';
import { Level } from '../models/level.enum';
import { ApiResponse } from '../models/response/api-response';

// Models

@Injectable({
  providedIn: 'root',
})
export class ListeningService {
  private apiUrl = `${environment.apiContentServiceUrl}/listening`;

  constructor(private http: HttpClient) {}

  // 1. Get list of topics
  getTopics(
    page: number = 0,
    size: number = 10
  ): Observable<Page<ListeningTopic>> {
    return this.http.get<Page<ListeningTopic>>(
      `${this.apiUrl}/topics?page=${page}&size=${size}`
    );
  }

  // 2. Create new topic
  addTopic(
    topic: { name: string; description: string; level?: Level },
    imageFile?: File
  ): Observable<ListeningTopic> {
    const formData = new FormData();
    formData.append(
      'topic',
      new Blob([JSON.stringify(topic)], { type: 'application/json' })
    );
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return this.http.post<ListeningTopic>(`${this.apiUrl}/topics`, formData);
  }

  editTopic(
    topicId: string,
    topic: { name: string; description: string; level?: Level },
    imageFile?: File
  ): Observable<ListeningTopic> {
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
  // 3. Get list of listenings by topicId
  getListeningsByTopic(topicId: string): Observable<{
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    createdAt: string;
    listenings: Listening[];
  }> {
    return this.http.get<{
      id: string;
      name: string;
      description: string;
      imageUrl: string;
      createdAt: string;
      listenings: Listening[];
    }>(`${this.apiUrl}/topics/${topicId}/listenings`);
  }

  // 4. Add list of listenings for topic
  addListeningList(
    topicId: string,
    requests: ListeningRequest[],
    imageFiles: File[],
    audioFiles: File[]
  ): Observable<Listening[]> {
    const formData = new FormData();

    formData.append(
      'requests',
      new Blob([JSON.stringify(requests)], { type: 'application/json' })
    );

    // append images
    imageFiles.forEach((file) => formData.append('images', file));

    // append audios
    audioFiles.forEach((file) => formData.append('audios', file));

    return this.http.post<Listening[]>(
      `${this.apiUrl}/topics/${topicId}/listenings`,
      formData
    );
  }

  // 5. Add listening test
  addTest(
    topicId: string,
    request: any,
    imageFiles: File[],
    audioFiles: File[]
  ): Observable<any> {
    const formData = new FormData();

    formData.append(
      'request',
      new Blob([JSON.stringify(request)], { type: 'application/json' })
    );

    // append images
    imageFiles.forEach((file) => formData.append('images', file));

    // append audios
    audioFiles.forEach((file) => formData.append('audios', file));

    return this.http.post<any>(
      `${this.apiUrl}/topics/${topicId}/tests`,
      formData
    );
  }

  // 6. Get tests by topic id
  getTestsByTopicId(
    topicId: string,
    page: number = 0,
    size: number = 10
  ): Observable<{
    topicName: string;
    topicId: string;
    tests: Page<ListeningTest>;
  }> {
    return this.http.get<{
      topicName: string;
      topicId: string;
      tests: Page<ListeningTest>;
    }>(`${this.apiUrl}/topics/${topicId}/tests?page=${page}&size=${size}`);
  }

  getTestById(testId: string): Observable<ListeningTest> {
    return this.http.get<ListeningTest>(`${this.apiUrl}/tests/${testId}`);
  }

  // 7. Get test detail with questions
  getTestDetail(testId: string): Observable<{
    id: string;
    name: string;
    duration: number;
    createdAt: string;
    questions: ListeningTestQuestion[];
  }> {
    return this.http.get<{
      id: string;
      name: string;
      duration: number;
      createdAt: string;
      questions: ListeningTestQuestion[];
    }>(`${this.apiUrl}/tests/${testId}`);
  }

  deleteTest(testId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tests/${testId}`);
  }

  deleteTopic(topicId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/topics/${topicId}`);
  }

  updateTest(
    testId: string,
    request: ListeningTestRequest,
    imageFiles: File[],
    audioFiles: File[]
  ): Observable<any> {
    const formData = new FormData();
    formData.append(
      'request',
      new Blob([JSON.stringify(request)], { type: 'application/json' })
    );
    imageFiles.forEach((file) => formData.append('images', file));
    audioFiles.forEach((file) => formData.append('audios', file));
    return this.http.put<any>(`${this.apiUrl}/tests/${testId}`, formData);
  }

  updateListening(
    request: ListeningRequest[],
    imageFiles: File[],
    audioFiles: File[]
  ): Observable<Listening> {
    const formData = new FormData();
    formData.append(
      'requests',
      new Blob([JSON.stringify(request)], { type: 'application/json' })
    );
    imageFiles.forEach((file) => formData.append('images', file));
    audioFiles.forEach((file) => formData.append('audios', file));
    return this.http.put<Listening>(`${this.apiUrl}/listenings`, formData);
  }

  searchListenings(
    query: string,
    page: number = 0,
    limit: number = 10
  ): Observable<Page<Listening>> {
    return this.http.get<Page<Listening>>(
      `${this.apiUrl}/search?q=${query}&page=${page}&limit=${limit}`
    );
  }

  uploadListeningsByFile(
    topicId: string,
    excelFile: File,
    imageFiles: File[],
    audioFiles: File[]
  ): Observable<Listening[]> {
    const formData = new FormData();
    formData.append('listening_file', excelFile);
    imageFiles.forEach((file) => formData.append('images', file));
    audioFiles.forEach((file) => formData.append('audios', file));
    return this.http.post<Listening[]>(
      `${this.apiUrl}/topics/${topicId}/file-listening`,
      formData
    );
  }

  uploadTestsByFile(
    topicId: string,
    excelFile: File,
    imageFiles: File[],
    audioFiles: File[]
  ): Observable<ListeningTest[]> {
    const formData = new FormData();
    formData.append('test_file', excelFile);
    imageFiles.forEach((file) => formData.append('images', file));
    audioFiles.forEach((file) => formData.append('audios', file));
    return this.http.post<ListeningTest[]>(
      `${this.apiUrl}/topics/${topicId}/file-tests`,
      formData
    );
  }

  deleteListening(id: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiUrl}/listenings/${id}`
    );
  }
}
