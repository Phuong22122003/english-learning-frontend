import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { StatisticResponse } from '../models/response/statistic-response.model';
import { Observable } from 'rxjs';
import { TopicViewSummaryResponse } from '../models/response/topic-view-summary-response.model';
import { FilterType } from '../models/request/filter-type';
import { UserScoreResponse } from '../models/response/user-score-response';

export enum TimeRange {
  TODAY = 'TODAY',
  ONE_WEEK = 'ONE_WEEK',
  ONE_MONTH = 'ONE_MONTH',
  TWELVE_MONTHS = 'TWELVE_MONTHS',
  ALL = 'ALL',
}

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  private apiAdminUrl = environment.apiContentServiceUrl + '/statistic';
  private apiUserUrl = environment.apiUserServiceUrl + '/statistic';
  private apiLeaningUrl = environment.apiLearningServiceUrl + '/statistic';
  constructor(private http: HttpClient) {}
  getTopicViews(timeRange: TimeRange): Observable<StatisticResponse> {
    return this.http.get<StatisticResponse>(
      `${this.apiAdminUrl}/topics/views/time-series?time_range=${timeRange}`
    );
  }
  getTopicViewsSummary(top: number): Observable<TopicViewSummaryResponse[]> {
    return this.http.get<TopicViewSummaryResponse[]>(
      `${this.apiAdminUrl}/topics/views/ranking?top=${top}`
    );
  }
  getUserStatistics(): Observable<StatisticResponse> {
    return this.http.get<StatisticResponse>(
      `${this.apiAdminUrl}/user-statistics`
    );
  }
  getUserStatisticsSummary(
    timeRange: TimeRange
  ): Observable<StatisticResponse> {
    return this.http.get<StatisticResponse>(
      `${this.apiUserUrl}/users?time_range=${timeRange}`
    );
  }

  getTestTaken(timeRange: TimeRange): Observable<StatisticResponse> {
    return this.http.get<StatisticResponse>(
      `${this.apiLeaningUrl}/test-taken?time_range=${timeRange}`
    );
  }

  getUserScores(
    timeRange: TimeRange,
    filterType: FilterType
  ): Observable<UserScoreResponse> {
    const params = new HttpParams()
      .set('time_range', timeRange)
      .set('filter_type', filterType);

    return this.http.get<UserScoreResponse>(`${this.apiLeaningUrl}/scores`, {
      params,
    });
  }
}
