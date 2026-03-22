import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlanRequest } from '../models/request/plan-request.model';
import { PlanResponse } from '../models/response/plan-response.model';
import { PlanIntentRequest } from '../models/request/plan-intent-request.model';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private planGenerateResponseSubject =
    new BehaviorSubject<PlanResponse | null>(null);
  planGenerateResponse$ = this.planGenerateResponseSubject.asObservable();
  private apiUrl = `${environment.apiLearningServiceUrl}/plan`;

  constructor(private http: HttpClient, private zone: NgZone) {}

  setPlanGenerateResponse(response: PlanResponse | null) {
    this.planGenerateResponseSubject.next(response);
  }
  /**
   * Create a new plan
   * POST /plan
   */
  addPlan(request: PlanRequest): Observable<PlanResponse> {
    return this.http.post<PlanResponse>(this.apiUrl, request);
  }

  /**
   * Get paginated list of plans
   * GET /plan?page=0&size=10
   */
  getPlans(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Get plan detail by ID
   * GET /plan/{id}
   */
  getPlanDetail(planId: string): Observable<PlanResponse> {
    return this.http.get<PlanResponse>(`${this.apiUrl}/${planId}`);
  }

  deletePlan(planId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${planId}`);
  }

  editPlan(planId: string, request: PlanRequest): Observable<PlanResponse> {
    return this.http.put<PlanResponse>(`${this.apiUrl}/${planId}`, request);
  }

  generatePlan(planIntentRequest: PlanIntentRequest): Observable<string> {
    return new Observable<string>((observer) => {
      const eventSource = new EventSource(
        `${this.apiUrl}/agent-generation?target=${planIntentRequest.target}&description=${planIntentRequest.description}&level=${planIntentRequest.level}&jwt=${planIntentRequest.jwt}&studyTime=${planIntentRequest.studyTime}`
      );

      eventSource.addEventListener('UPDATE', (event: MessageEvent) => {
        this.zone.run(() => {
          observer.next(event.data);
          eventSource.close();
          observer.complete();
        });
      });

      eventSource.onerror = (error) => {
        this.zone.run(() => {eventSource.close();
          observer.error(error);
        });
      };

      return () => {
        eventSource.close();
      };
    });
  }
}
