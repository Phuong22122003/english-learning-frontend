import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { HistoryService } from "../../../../services/HistoryService";
import { RankingResponse } from "../../../../models/response/ranking-response.model";
import { ToeicTestResponse } from "../../../../models/response/toeict-test-response.model";
import { ToeicTestService } from "../../../../services/ToeicTestService";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
    faArrowLeft, faClock, faCalendar, faCheckCircle,
    faTrophy, faComments, faUserCircle, faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { AudioPlayerComponent } from "../../../../shared/audio-player/audio-player.component";
import { CommentService } from "../../../../services/CommentService";
import { CommentResponse } from "../../../../models/response/comment-response.model";
import { FormsModule } from "@angular/forms";


@Component({
    selector: 'app-full-test-overview',
    imports: [CommonModule, RouterModule, FontAwesomeModule, FormsModule],

    standalone: true,
    templateUrl: './full-test-overview.component.html',
})

export class FullTestOverviewComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private changeDetector: ChangeDetectorRef,
        private toeicTestService: ToeicTestService,
        private commentService: CommentService,
        private historyService: HistoryService) { }
    // Khai báo trong class
    faArrowLeft = faArrowLeft;
    faClock = faClock;
    faCalendar = faCalendar;
    faCheckCircle = faCheckCircle;
    faTrophy = faTrophy;
    faComments = faComments;
    rankings!: RankingResponse[];
    comments: CommentResponse[] = [];
    test!: ToeicTestResponse;
    isLoadingRankings = true;
    isLoading = true;
    testId: string = '';
    groupId: string = '';


    newCommentText: string = '';
    replyingToId: string | null = null; // ID của comment đang được reply
    replyText: string = '';

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.testId = params['testId'];
            this.groupId = params['groupId'];
            
            if (this.testId) {
                this.commentService.getSseComments(this.testId).onmessage = (event) => {
                    const newComment: CommentResponse = JSON.parse(event.data);
                    
                    newComment.id = String(newComment.id);
                    if (newComment.parentId) {
                        newComment.parentId = String(newComment.parentId);
                    }

                    if (newComment.parentId == null) {
                        if (!this.comments.some(c => String(c.id) === newComment.id)) {
                            this.comments = [newComment, ...this.comments];
                        }
                    } else {
                        this.comments = this.comments.map(c => {
                            if (String(c.id) === newComment.parentId) {
                                const existingReplies = c.replyComments || [];
                                if (!existingReplies.some(r => String(r.id) === newComment.id)) {
                                    return {
                                        ...c,
                                        replyComments: [...existingReplies, newComment]
                                    };
                                }
                            }
                            return c;
                        });
                    }
                    this.changeDetector.detectChanges();
                };
                this.loadTest(this.testId);
                this.loadRankings(this.testId);
                this.loadComments(this.testId);
            }
        });
    }

    loadComments(testId: string): void {
        this.commentService.getComments(testId).subscribe({
            next: (comments) => {
                this.comments = comments;
            },
            error: (err) => console.error('Error loading comments:', err)
        });
    }

    loadTest(testId: string): void {
        this.isLoading = true;
        this.toeicTestService.getTestById(this.testId).subscribe({
            next: (test) => {
                this.test = test;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }
    loadRankings(testId: string): void {
        this.isLoadingRankings = true;
        this.historyService.getToeicRankings(testId).subscribe({
            next: (rankings) => {
                this.rankings = rankings;
                this.isLoadingRankings = false;
            },
            error: () => this.isLoadingRankings = false
        });
    }
    postComment(): void {
        if (!this.newCommentText.trim()) return;

        const request: any = {
            content: this.newCommentText,
            testId: this.testId,
            testType: 'FULL_TEST', // Hoặc enum tương ứng của bạn
        };

        this.commentService.addComment(request).subscribe({
            next: (res) => {
                // this.comments.unshift(res); // Thêm vào đầu danh sách
                this.newCommentText = '';
            }
        });
    }

    // Gửi reply cho một comment
    // Gửi reply
    postReply(comment: CommentResponse): void {
        if (!this.replyText.trim()) return;

        // QUAN TRỌNG: Nếu đang reply một thằng con, ta vẫn lấy ID của thằng cha lớn nhất
        // Ở đây ta truyền nguyên object 'comment' từ HTML vào để xử lý
        const request: any = {
            content: this.replyText,
            testId: this.testId,
            parentId: comment.id, // Luôn là ID của thằng cha ngoài cùng
            testType: 'FULL_TEST'
        };

        this.commentService.addComment(request).subscribe({
            next: (res) => {
                // Chỉ cần tìm đúng thằng cha trong mảng comments và đẩy vào list con
                // const parent = this.comments.find(c => c.id === comment.id);
                // if (parent) {
                //     if (!parent.replyComments) parent.replyComments = [];
                //     parent.replyComments.push(res);
                // }
                this.replyText = '';
                this.replyingToId = null;
            }
        });
    }
    setReply(id: string) {
        this.replyingToId = id;
        this.replyText = '';
        this.changeDetector.detectChanges();
    }
    startTest(): void {
        if (this.test && this.test.questionGroups && this.test.questionGroups.length > 0) {
            this.router.navigate(['/full-test/groups', this.groupId, this.testId]);
        } else {
            alert("Bài thi hiện chưa có câu hỏi, vui lòng quay lại sau!");
        }
    }

    goBack(): void {
        this.router.navigate(['/tests']);
    }

}