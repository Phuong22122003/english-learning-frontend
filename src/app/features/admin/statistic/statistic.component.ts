import { Component, OnInit } from '@angular/core';
import {
  ChartConfiguration,
  ChartOptions,
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  StatisticService,
  TimeRange,
} from '../../../services/StatisticSerivce';
import { StatisticResponse } from '../../../models/response/statistic-response.model';
import { TopicViewSummaryResponse } from '../../../models/response/topic-view-summary-response.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterType } from '../../../models/request/filter-type';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController
);

@Component({
  selector: 'app-statistic',
  standalone: true,
  imports: [BaseChartDirective, CommonModule, FormsModule],
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.scss',
})
export class StatisticComponent implements OnInit {
  // Time series chart data
  timeSeriesChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Views',
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  timeSeriesChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: 'right',
      },
      title: {
        display: true,
        text: 'Views Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Top topics bar chart data
  topTopicsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Total Views',
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 146, 60)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)',
          'rgb(20, 184, 166)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
          'rgb(14, 165, 233)',
        ],
        borderWidth: 1,
      },
    ],
  };

  topTopicsChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Viewed Topics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Statistics
  totalViews: number = 0;
  selectedTimeRange: TimeRange = TimeRange.TODAY;
  timeRanges = [
    { value: TimeRange.TODAY, label: 'Today' },
    { value: TimeRange.ONE_WEEK, label: '1 Week' },
    { value: TimeRange.ONE_MONTH, label: '1 Month' },
    { value: TimeRange.TWELVE_MONTHS, label: '12 Months' },
    { value: TimeRange.ALL, label: 'All' },
  ];

  topCount: number = 10;
  testTakenTotal = 0;
  testTakenTimeRange: TimeRange = TimeRange.ONE_WEEK;
  // ===== USER SCORE =====
  scoreTimeRange: TimeRange = TimeRange.ONE_WEEK;
  scoreFilterType: FilterType = FilterType.VOCABULARY;

  scoreFilterOptions = [
    { value: FilterType.LISTENING, label: 'Listening' },
    { value: FilterType.VOCABULARY, label: 'Vocabulary' },
    { value: FilterType.GRAMMAR, label: 'Grammar' },
    { value: FilterType.FULL_TEST, label: 'Full Test' },
  ];

  constructor(private statisticService: StatisticService) {}

  ngOnInit(): void {
    this.loadTimeSeriesData();
    this.loadTopTopicsData();
    this.loadStatistics();
    this.loadUserScores();
    this.loadTestTaken();
  }

  loadTimeSeriesData(): void {
    this.statisticService.getTopicViews(this.selectedTimeRange).subscribe({
      next: (response: StatisticResponse) => {
        this.totalViews = response.totalCount;
        this.updateTimeSeriesChart(response.newElementsByPeriod);
      },
      error: (error) => {
},
    });
  }

  loadTopTopicsData(): void {
    this.statisticService.getTopicViewsSummary(this.topCount).subscribe({
      next: (response: TopicViewSummaryResponse[]) => {
        this.updateTopTopicsChart(response);
      },
      error: (error) => {
},
    });
  }

  updateTimeSeriesChart(data: { [key: string]: number }): void {
    const labels = Object.keys(data).sort();
    const values = labels.map((key) => data[key]);

    this.timeSeriesChartData = {
      ...this.timeSeriesChartData,
      labels: labels,
      datasets: [
        {
          ...this.timeSeriesChartData.datasets[0],
          data: values,
        },
      ],
    };
  }

  updateTopTopicsChart(data: TopicViewSummaryResponse[]): void {
    const labels = data.map((item) => item.topicName);
    const values = data.map((item) => item.totalViews);

    this.topTopicsChartData = {
      ...this.topTopicsChartData,
      labels: labels,
      datasets: [
        {
          ...this.topTopicsChartData.datasets[0],
          data: values,
        },
      ],
    };
  }

  onTimeRangeChange(): void {
    this.loadTimeSeriesData();
  }

  onTopCountChange(): void {
    this.loadTopTopicsData();
  }

  getTimeRangeLabel(): string {
    const range = this.timeRanges.find(
      (tr) => tr.value === this.selectedTimeRange
    );
    return range?.label || '';
  }

  userStatistics: StatisticResponse = {
    totalCount: 0,
    newElementsByPeriod: {},
  };

  selectedTimeRangeTotalUser: TimeRange = TimeRange.ALL;
  timeRangesTotalUser = [
    { value: TimeRange.TODAY, label: 'Today' },
    { value: TimeRange.ONE_WEEK, label: '1 Week' },
    { value: TimeRange.ONE_MONTH, label: '1 Month' },
    { value: TimeRange.TWELVE_MONTHS, label: '12 Months' },
    { value: TimeRange.ALL, label: 'All' },
  ];

  // Line chart data for new elements by period
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'New Items',
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
      },
    ],
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total Users Created',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Count',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  // Bar chart data for total statistics
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Total'],
    datasets: [
      {
        data: [0],
        label: 'Total Lessons Completed',
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total Lessons Completed',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  loadStatistics(): void {
    this.statisticService
      .getUserStatisticsSummary(this.selectedTimeRangeTotalUser)
      .subscribe({
        next: (response: StatisticResponse) => {
          this.userStatistics = response;
          this.updateCharts(response);
        },
        error: (error) => {
},
      });
  }

  onTimeRangeChangeTotalUser(): void {
    this.loadStatistics();
  }

  getTimeRangeLabelTotalUser(): string {
    const range = this.timeRangesTotalUser.find(
      (tr) => tr.value === this.selectedTimeRangeTotalUser
    );
    return range?.label || '';
  }

  updateCharts(data: StatisticResponse): void {
    // Update line chart with newElementsByPeriod
    const periods = Object.keys(data.newElementsByPeriod).sort();
    const values = periods.map((period) => data.newElementsByPeriod[period]);

    this.lineChartData = {
      ...this.lineChartData,
      labels: periods,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: values,
        },
      ],
    };

    // Update bar chart with totalCount
    this.barChartData = {
      ...this.barChartData,
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: [data.totalCount],
        },
      ],
    };
  }

  avgScoreChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Average Score',
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  avgScoreChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Average Score Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 10, // score usually from 0–10
      },
    },
  };

  loadUserScores(): void {
    this.statisticService
      .getUserScores(this.scoreTimeRange, this.scoreFilterType)
      .subscribe({
        next: (res) => {
          this.updateAvgScoreChart(res.scores);
        },
        error: (err) => {
},
      });
  }

  private updateAvgScoreChart(scores: Record<string, number>): void {
    const labels = Object.keys(scores).sort(); // yyyy-MM-dd
    const values = labels.map((k) => scores[k]);

    this.avgScoreChartData = {
      ...this.avgScoreChartData,
      labels,
      datasets: [
        {
          ...this.avgScoreChartData.datasets[0],
          data: values,
        },
      ],
    };
  }

  loadTestTaken(): void {
    this.statisticService.getTestTaken(this.testTakenTimeRange).subscribe({
      next: (res: StatisticResponse) => {
        this.testTakenTotal = res.totalCount;
        this.updateTestTakenChart(res.newElementsByPeriod);
      },
      error: (err) => {
},
    });
  }

  testTakenChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Test Attempts',
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  testTakenChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Test Attempts Over Time' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  private updateTestTakenChart(map: Record<string, number>): void {
    const labels = Object.keys(map).sort(); // OK if key is yyyy-MM-dd
    const values = labels.map((k) => map[k]);

    this.testTakenChartData = {
      ...this.testTakenChartData,
      labels,
      datasets: [
        {
          ...this.testTakenChartData.datasets[0],
          data: values,
        },
      ],
    };
  }
}
