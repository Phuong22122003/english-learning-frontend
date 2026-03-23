import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBookOpen,
  faVolumeUp,
  faFileAlt,
  faChartLine,
  faClock,
  faTrophy,
  faFire,
  faArrowRight,
  faGraduationCap,
  faCheckCircle,
  faListCheck,
  faHistory,
} from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../services/UserService';
import { StatisticService } from '../../services/StatisticSerivce';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  // Icons
  faBookOpen = faBookOpen;
  faVolumeUp = faVolumeUp;
  faFileAlt = faFileAlt;
  faChartLine = faChartLine;
  faClock = faClock;
  faTrophy = faTrophy;
  faFire = faFire;
  faArrowRight = faArrowRight;
  faGraduationCap = faGraduationCap;
  faCheckCircle = faCheckCircle;

  // User data
  user: any = null;
  userName: string = 'Người dùng';

  // Stats (mock data - có thể lấy từ service)
  stats = {
    wordsLearned: 0,
    testsCompleted: 0,
    studyStreak: 0,
    totalTime: 0,
  };

  // Quick actions
  quickActions = [
    {
      label: 'Học từ vựng',
      icon: faBookOpen,
      route: '/vocabulary/topics',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      label: 'Luyện nghe',
      icon: faVolumeUp,
      route: '/listening/topics',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      label: 'Ngữ pháp',
      icon: faFileAlt,
      route: '/grammar/topics',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
    {
      label: 'TOEIC Test',
      icon: faListCheck,
      route: '/full-test/groups',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
    },
  ];

  quickManageActions = [
    {
      label: 'Lịch sử',
      icon: faHistory,
      route: '/history',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      label: 'Thống kê',
      icon: faChartLine,
      route: '/statistic',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
    },
  ];

  // Recent activities (mock data)
  recentActivities = [
    {
      type: 'vocabulary',
      title: 'Đã hoàn thành bài test từ vựng',
      time: '2 giờ trước',
      icon: faCheckCircle,
      color: 'text-blue-500',
    },
    {
      type: 'listening',
      title: 'Đã luyện nghe chủ đề "Daily Conversation"',
      time: '5 giờ trước',
      icon: faCheckCircle,
      color: 'text-green-500',
    },
    {
      type: 'grammar',
      title: 'Đã học ngữ pháp "Present Tense"',
      time: '1 ngày trước',
      icon: faCheckCircle,
      color: 'text-purple-500',
    },
  ];

  isLoading = false;

  constructor(
    private userService: UserService,
    private statisticService: StatisticService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadStatistics();
  }

  loadUserData(): void {
    this.userService.user$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.userName = user.fullname || user.username || 'Người dùng';
      }
    });
  }

  loadStatistics(): void {
    this.isLoading = true;
    // Có thể gọi API để lấy thống kê thực tế
    // this.statisticService.getUserStatistics().subscribe(...)

    // Mock data cho demo
    setTimeout(() => {
      this.stats = {
        wordsLearned: 245,
        testsCompleted: 18,
        studyStreak: 7,
        totalTime: 120,
      };
      this.isLoading = false;
    }, 500);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }
}
