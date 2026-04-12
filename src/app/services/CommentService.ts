import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FilterType } from '../models/request/filter-type';
import { Page } from '../models/page.model';
import { ExamHistoryResponse } from '../models/response/exam-history-response.model';
import { ExamHistoryRequest } from '../models/request/exam-history-request.model';
import { RankingResponse } from '../models/response/ranking-response.model';
import { CommentResponse } from '../models/response/comment-response.model';
import { CommentRequest } from '../models/request/comment-request.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService  {

    private apiUrl = `${environment.apiLearningServiceUrl}/comments`;

    constructor(private http: HttpClient) {}
    addComment(comment: CommentRequest): Observable<CommentResponse> {
        return this.http.post<CommentResponse>(`${this.apiUrl}`, comment);
    }
    getComments(testId:string): Observable<CommentResponse[]> {
        return this.http.get<CommentResponse[]>(`${this.apiUrl}/tests/${testId}`);
    }

    getSseComments(testId: string): EventSource {
        return new EventSource(this.apiUrl + `/tests/${testId}/sse`);
    }
}