import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { EmptyLayoutComponent } from './layouts/empty-layout/empty-layout.component';
import { PendingChangesGuard } from './config/PendingChangesGuard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { VocabularyTopicDetailComponent } from './features/admin/vocabulary-topic-detail/vocabulary-topic-detail.component';
import { PlanningComponent } from './features/planning/planning.component';
import { ViewMyPlanningComponent } from './features/planning/view-my-planning/view-my-planning.component';
import { CreatePlanningComponent } from './features/planning/create-planning/create-planning.component';
import { ViewMyPlanningDetailComponent } from './features/planning/view-my-planning/view-my-planning-detail/view-my-planning-detail.component';
import { HomeComponent } from './features/home/home.component';
import { FullTestComponent } from './features/admin/full-test/full-test.component';
import { FullTestGroupComponent } from './features/full-test/full-test-group/full-test-group.component';
import { ScopeGuard } from './config/ScopeGuard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'full-test',
        component: FullTestComponent,
        children: [
          { path: 'groups', component: FullTestGroupComponent },
          {
            path: 'groups/:groupId/tests',
            loadComponent: () =>
              import(
                './features/full-test/full-test-list/full-test-list.component'
              ).then((m) => m.FullTestListComponent),
          },
          {
            path: 'groups/:groupId',
            loadComponent: () =>
              import(
                './features/admin/full-test/full-test-group/full-test-manage/full-test-manage.component'
              ).then((m) => m.FullTestManageComponent),
          },
        ],
      },
      { path: 'home', component: HomeComponent },
      {
        path: 'vocabulary',
        children: [
          {
            path: 'topics',
            loadComponent: () =>
              import(
                './features/vocabulary/vocab-topic/vocab-topic.component'
              ).then((m) => m.VocabTopicComponent),
          },
        ],
      },
      {
        path: 'search',
        component: EmptyLayoutComponent,
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/search/search.component').then(
                (m) => m.SearchComponent
              ),
          },
        ],
      },
      {
        path: 'topic-detail/:type/:topicId',
        component: EmptyLayoutComponent,
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/topic-detail/topic-detail.component').then(
                (m) => m.TopicDetailComponent
              ),
          },
        ],
      },
      {
        path: 'listening',
        children: [
          {
            path: 'topics',
            loadComponent: () =>
              import(
                './features/listening/listening-topic/listening-topic.component'
              ).then((m) => m.ListeningTopicsComponent),
          },
          {
            path: 'topics/tests/:topicId',
            component: EmptyLayoutComponent,
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    './features/listening/listening-topic-tests/listening-topic-tests.component'
                  ).then((m) => m.ListeningTopicTestsComponent),
              },
            ],
          },
        ],
      },
      {
        path: 'vocabulary/topics/tests/:topicId',
        component: EmptyLayoutComponent,
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './features/vocabulary/vocab-topic-tests/vocab-topic-tests.component'
              ).then((m) => m.VocabTopicTestsComponent),
          },
        ],
      },
      {
        path: 'grammar',
        children: [
          {
            path: 'topics',
            loadComponent: () =>
              import(
                './features/grammar/grammar-topic/grammar-topic.component'
              ).then((m) => m.GrammarTopicComponent),
          },
          {
            path: 'topics/:topicId',
            loadComponent: () =>
              import(
                './features/grammar/grammar-list/grammar-list.component'
              ).then((m) => m.GrammarListComponent),
          },
          {
            path: 'topics/:topicId/:grammarId/tests',
            loadComponent: () =>
              import(
                './features/grammar/grammar-tests/grammar-tests.component'
              ).then((m) => m.GrammarTestsComponent),
          },
          {
            path: 'topics/:topicId/:grammarId',
            loadComponent: () =>
              import(
                './features/grammar/grammar-detail/grammar-detail.component'
              ).then((m) => m.GrammarDetailComponent),
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/history.component').then(
            (m) => m.HistoryComponent
          ),
      },
      {
        path: 'history/:examHistoryId',
        loadComponent: () =>
          import(
            './features/history/history-detail/history-detail.component'
          ).then((m) => m.HistoryDetailComponent),
      },
      {
        path: 'planning',
        component: PlanningComponent,
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            loadComponent: () =>
              import(
                './features/planning/view-my-planning/view-my-planning.component'
              ).then((m) => m.ViewMyPlanningComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './features/planning/create-planning/create-planning.component'
              ).then((m) => m.CreatePlanningComponent),
          },
          {
            path: 'create/:planId',
            loadComponent: () =>
              import(
                './features/planning/create-planning/create-planning.component'
              ).then((m) => m.CreatePlanningComponent),
          },
          {
            path: 'detail/:planId',
            loadComponent: () =>
              import(
                './features/planning/view-my-planning/view-my-planning-detail/view-my-planning-detail.component'
              ).then((m) => m.ViewMyPlanningDetailComponent),
          },
        ],
      },
      {
        path: 'favorite',
        loadComponent: () =>
          import('./features/favorite/favorite.component').then(
            (m) => m.FavoriteComponent
          ),
      },
      {
        path: 'pronunciation',
        loadComponent: () =>
          import('./features/pronunciation/pronunciation.component').then(
            (m) => m.PronunciationComponent
          ),
      },
      {
        path: 'statistic',
        loadComponent: () =>
          import('./features/statistic/statistic.component').then(
            (m) => m.StatisticComponent
          ),
      },
    ],
    canActivate: [ScopeGuard],
    data: { scope: 'ROLE_USER' },
  },

  // ✅ Layout trống cho Learn New Word
  {
    path: 'vocabulary/learn/:topic',
    component: EmptyLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/vocabulary/learn-new-word/learn-new-word.component'
          ).then((m) => m.LearnNewWordComponent),
      },
    ],
    canActivate: [ScopeGuard],
    data: { scope: 'ROLE_USER' },
  },
  {
    path: 'full-test/groups/:groupId/:testId',
    loadComponent: () =>
      import(
        './features/full-test/full-test-list/full-test-detail/full-test-detail.component'
      ).then((m) => m.FullTestDetailComponent),
    canActivate: [ScopeGuard],
    data: { scope: 'ROLE_USER' },
  },
  {
    path: 'full-test/groups/:groupId/overview/tests/:testId',
    loadComponent: () =>
      import(
        './features/full-test/full-test-list/full-test-overview/full-test-overview.component'
      ).then((m) => m.FullTestOverviewComponent),
    canActivate: [ScopeGuard],
    data: { scope: 'ROLE_USER' },
  },
  {
    path: 'vocabulary/tests/:topicId/:testId',
    component: EmptyLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/vocabulary/assessment-test/assessment-test.component'
          ).then((m) => m.AssessmentTestComponent),
        canDeactivate: [PendingChangesGuard],
      },
    ],
    canActivate: [ScopeGuard],
    data: { scope: 'ROLE_USER' },
  },
  {
    path: 'login',
    component: EmptyLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
    ],
  },
  {
    path: 'sign-up',
    component: EmptyLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/sign-up/sign-up.component').then(
            (m) => m.SignUpComponent
          ),
      },
    ],
  },
  {
    path: 'listening/practice/:topic',
    component: EmptyLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/listening/listening-practice/listening-practice.component'
          ).then((m) => m.ListeningPracticeComponent),
      },
    ],
    canActivate: [ScopeGuard],
    data: { scope: 'ROLE_USER' },
  },
  {
    path: 'listening/tests/:testId',
    component: EmptyLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/listening/listening-test/listening-test.component'
          ).then((m) => m.ListeningTestComponent),
      },
    ],
    canActivate: [ScopeGuard],
    data: { scope: 'ROLE_USER' },
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'vocabulary/manage',
        loadComponent: () =>
          import(
            './features/admin/vocabulary-management/vocabulary-management.component'
          ).then((m) => m.VocabularyManagementComponent),
      },
      {
        path: 'vocabulary/manage/:topicId',
        loadComponent: () =>
          import(
            './features/admin/vocabulary-topic-detail/vocabulary-topic-detail.component'
          ).then((m) => m.VocabularyTopicDetailComponent),
      },
      {
        path: 'grammar/manage',
        loadComponent: () =>
          import(
            './features/admin/grammar-management/grammar-management.component'
          ).then((m) => m.GrammarManagementComponent),
      },
      {
        path: 'grammar/tests',
        loadComponent: () =>
          import(
            './features/admin/grammar-tests-manage/grammar-tests-manage.component'
          ).then((m) => m.GrammarTestsManageComponent),
      },
      {
        path: 'grammar/tests/:testId',
        loadComponent: () =>
          import(
            './features/admin/grammar-tests-detail/grammar-tests-detail.component'
          ).then((m) => m.GrammarTestsDetailComponent),
      },
      {
        path: 'grammar/manage/:topicId',
        loadComponent: () =>
          import(
            './features/admin/grammar-topic-detail/grammar-topic-detail.component'
          ).then((m) => m.GrammarTopicDetailComponent),
      },
      {
        path: 'vocabulary/tests',
        loadComponent: () =>
          import(
            './features/admin/vocabulary-tests-manage/vocabulary-tests-manage.component'
          ).then((m) => m.VocabularyTestsManageComponent),
      },
      {
        path: 'vocabulary/tests/:id',
        loadComponent: () =>
          import(
            './features/admin/vocabulary-test-detail/vocabulary-test-detail.component'
          ).then((m) => m.VocabularyTestDetailComponent),
      },
      {
        path: 'listening/manage',
        loadComponent: () =>
          import(
            './features/admin/listening-management/listening-management.component'
          ).then((m) => m.ListeningManagementComponent),
      },
      {
        path: 'listening/manage/:topicId',
        loadComponent: () =>
          import(
            './features/admin/listening-topic-detail/listening-topic-detail.component'
          ).then((m) => m.ListeningTopicDetailComponent),
      },
      {
        path: 'listening/tests',
        loadComponent: () =>
          import(
            './features/admin/listening-tests-manage/listening-tests-manage.component'
          ).then((m) => m.ListeningTestsManageComponent),
      },
      {
        path: 'listening/tests/:testId',
        loadComponent: () =>
          import(
            './features/admin/listening-tests-detail/listening-tests-detail.component'
          ).then((m) => m.ListeningTestsDetailComponent),
      },
      {
        path: 'statistic',
        loadComponent: () =>
          import('./features/admin/statistic/statistic.component').then(
            (m) => m.StatisticComponent
          ),
      },
      {
        path: 'full-test',
        component: FullTestComponent,
        children: [
          {
            path: 'groups',
            loadComponent: () =>
              import(
                './features/admin/full-test/full-test-group/full-test-group.component'
              ).then((m) => m.FullTestGroupComponent),
          },
          {
            path: 'groups/:groupId',
            loadComponent: () =>
              import(
                './features/admin/full-test/full-test-group/full-test-manage/full-test-manage.component'
              ).then((m) => m.FullTestManageComponent),
          },
          {
            path: 'groups/:groupId/:testId',
            loadComponent: () =>
              import(
                './features/admin/full-test/full-test-group/full-test-manage/full-test-detail/full-test-detail.component'
              ).then((m) => m.FullTestDetailComponent),
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'vocabulary/manage',
      },
    ],
    canActivate: [ScopeGuard],
    data: { scope: 'ROLE_ADMIN' },
  },
  {
    path: 'grammar/tests/:testId',
    component: EmptyLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/grammar/assessment-grammar/assessment-grammar.component'
          ).then((m) => m.AssessmentGrammarComponent),
      },
    ],
    canActivate: [ScopeGuard],
    data: { scope: 'ROLE_USER' },
  },

  { path: '**', redirectTo: '' },
];
