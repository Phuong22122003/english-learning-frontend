// src/app/services/grammar.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/page.model';
import { GrammarTopic } from '../models/grammar/grammar-topic.model';
import { Grammar } from '../models/grammar/grammar.model';
import { GrammarTest } from '../models/grammar/grammar-test.model';
import { GrammarTestQuestion } from '../models/grammar/grammar-test-question.model';
import { environment } from '../../environments/environment';
import { GrammarTestRequest } from '../models/request/grammar-test-request.model';
import { GrammarRequest } from '../models/request/grammar-request.model';
import { Level } from '../models/level.enum';

@Injectable({
  providedIn: 'root',
})
export class GrammarService {
  private apiUrl = `${environment.apiContentServiceUrl}/grammar`;

  constructor(private http: HttpClient) {}

  // Get list of grammar topics
  getAllTopics(
    page: number = 0,
    size: number = 10
  ): Observable<Page<GrammarTopic>> {
    return this.http.get<Page<GrammarTopic>>(
      `${this.apiUrl}/topics?page=${page}&size=${size}`
    );
  }

  // Get list of grammars by topicId
  getGrammarsByTopicId(grammarId: string): Observable<{
    topicId: string;
    name: string;
    grammars: Grammar[];
  }> {
    return this.http.get<{
      topicId: string;
      name: string;
      grammars: Grammar[];
    }>(`${this.apiUrl}/topics/${grammarId}/grammars`);
  }

  getGrammarById(grammarId: string): Observable<Grammar> {
    return this.http.get<Grammar>(`${this.apiUrl}/topics/grammars/${grammarId}`);
  }

  // Get list of tests by grammarId
  getTestsByGrammarId(
    grammarId: string,
    page: number = 0,
    size: number = 10
  ): Observable<{
    grammarTests: Page<GrammarTest>;
    grammarName: string;
    grammarId: string;
  }> {
    return this.http.get<{
      grammarTests: Page<GrammarTest>;
      grammarName: string;
      grammarId: string;
    }>(`${this.apiUrl}/grammars/${grammarId}/tests?page=${page}&size=${size}`);
  }

  // Get list of tests by topicId (similar to listening)
  getTestsByTopicId(topicId: string): Observable<{
    tests: Page<GrammarTest>;
    topicName: string;
    topicId: string;
  }> {
    return this.http.get<{
      tests: Page<GrammarTest>;
      topicName: string;
      topicId: string;
    }>(`${this.apiUrl}/topics/${topicId}/tests`);
  }

  // Create new test for grammar
  addTest(
    grammarId: string,
    testData: GrammarTestRequest
  ): Observable<GrammarTest> {
    return this.http.post<GrammarTest>(
      `${this.apiUrl}/grammars/${grammarId}/tests`,
      testData
    );
  }

  // Get list of questions by testId
  getTestQuestionsByTestId(testId: string): Observable<{
    duration: number;
    testId: string;
    testName: string;
    grammarName: string;
    grammarId: string;
    grammarTestQuestions: GrammarTestQuestion[];
  }> {
    return this.http.get<{
      duration: number;
      testId: string;
      testName: string;
      grammarName: string;
      grammarId: string;
      grammarTestQuestions: GrammarTestQuestion[];
    }>(`${this.apiUrl}/tests/${testId}/questions`);
  }

  // Create new grammar topic
  createTopic(topic: GrammarTopic, imageFile: File): Observable<GrammarTopic> {
    const formData = new FormData();
    formData.append(
      'topic',
      new Blob([JSON.stringify(topic)], { type: 'application/json' })
    );
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.post<GrammarTopic>(`${this.apiUrl}/topics`, formData);
  }

  addGrammar(grammar: Grammar, topicId: string): Observable<Grammar> {
    return this.http.post<Grammar>(
      `${this.apiUrl}/topics/${topicId}/grammars`,
      grammar
    );
  }

  updateGrammar(
    grammar: GrammarRequest,
    grammarId: string
  ): Observable<Grammar> {
    return this.http.put<Grammar>(
      `${this.apiUrl}/grammars/${grammarId}`,
      grammar
    );
  }

  deleteGrammar(grammarId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/grammars/${grammarId}`);
  }

  deleteTest(testId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tests/${testId}`);
  }

  deleteTopic(topicId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/topics/${topicId}`);
  }

  updateTest(
    test: GrammarTestRequest,
    testId: string
  ): Observable<GrammarTest> {
    return this.http.put<GrammarTest>(`${this.apiUrl}/tests/${testId}`, test);
  }

  searchGrammars(
    query: string,
    page: number = 0,
    limit: number = 10
  ): Observable<Page<Grammar>> {
    return this.http.get<Page<Grammar>>(
      `${this.apiUrl}/search?q=${query}&page=${page}&limit=${limit}`
    );
  }

  uploadTestsByFile(
    grammarId: string,
    excelFile: File,
    imageFiles: File[],
    audioFiles: File[]
  ): Observable<GrammarTest[]> {
    const formData = new FormData();
    formData.append('test_file', excelFile);
    imageFiles.forEach((file) => formData.append('images', file));
    audioFiles.forEach((file) => formData.append('audios', file));
    return this.http.post<GrammarTest[]>(
      `${this.apiUrl}/topics/${grammarId}/file-tests`,
      formData
    );
  }

  editTopic(
    topicId: string,
    topic: { name: string; description: string; level?: Level },
    imageFile?: File
  ): Observable<GrammarTopic> {
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
}
