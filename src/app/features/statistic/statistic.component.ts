import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { StatisticResponse } from '../../models/response/statistic-response.model';
import { StatisticService, TimeRange } from '../../services/StatisticSerivce';
import { FilterType } from '../../models/request/filter-type';

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
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.scss',
})
export class StatisticComponent implements OnInit {
  // ===== USER SCORE =====
  scoreTimeRange: TimeRange = TimeRange.ONE_WEEK;
  scoreFilterType: FilterType = FilterType.VOCABULARY;
  constructor(private statisticService: StatisticService) {}

  ngOnInit(): void {
    this.loadUserScores();
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

  timeRanges = [
    { value: TimeRange.TODAY, label: 'Today' },
    { value: TimeRange.ONE_WEEK, label: '1 Week' },
    { value: TimeRange.ONE_MONTH, label: '1 Month' },
    { value: TimeRange.TWELVE_MONTHS, label: '12 Months' },
    { value: TimeRange.ALL, label: 'All' },
  ];

  scoreFilterOptions = [
    { value: FilterType.LISTENING, label: 'Listening' },
    { value: FilterType.VOCABULARY, label: 'Vocabulary' },
    { value: FilterType.GRAMMAR, label: 'Grammar' },
    { value: FilterType.FULL_TEST, label: 'Full Test' },
  ];
}
