import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FilterType } from '../models/request/filter-type';
import { Page } from '../models/page.model';
import { ExamHistoryResponse } from '../models/response/exam-history-response.model';
import { ExamHistoryRequest } from '../models/request/exam-history-request.model';
import { RankingResponse } from '../models/response/ranking-response.model';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private apiUrl = `${environment.apiLearningServiceUrl}/exam/history`;

  constructor(private http: HttpClient) {}

  getHistory(
    page: number,
    limit: number,
    filterType: FilterType
  ): Observable<Page<ExamHistoryResponse>> {
    return this.http.get<Page<ExamHistoryResponse>>(
      `${this.apiUrl}?page=${page}&limit=${limit}&filterType=${filterType}`
    );
  }

  getToeicRankings(toeicId: string): Observable<RankingResponse[]>{
    return this.http.get<RankingResponse[]>(`${this.apiUrl}/toeic/${toeicId}/rankings`);
  }

  addHistory(history: ExamHistoryRequest): Observable<ExamHistoryResponse> {
    return this.http.post<ExamHistoryResponse>(`${this.apiUrl}`, history);
  }

  getHistoryById(examHistoryId: string): Observable<ExamHistoryResponse> {
    return this.http.get<ExamHistoryResponse>(
      `${this.apiUrl}/${examHistoryId}`
    );
  }
}
