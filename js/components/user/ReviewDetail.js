// 감상문 상세보기 컴포넌트
const ReviewDetail = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand" @click="$router.push('/dashboard')" style="cursor: pointer;">
                        📚 독서 인증 플랫폼
                    </div>
                    <div class="navbar-nav">
                        <router-link v-if="isLoggedIn" to="/my-reviews" class="nav-link">내 감상문</router-link>
                        <router-link v-if="isLoggedIn" to="/completed-quizzes" class="nav-link">내 퀴즈</router-link>
                        <div v-if="isLoggedIn" class="dropdown">
                            <a class="nav-link">포인트 ▼</a>
                            <div class="dropdown-content">
                                <router-link to="/points-exchange">포인트 교환소</router-link>
                                <router-link to="/points-history">적립 내역</router-link>
                                <router-link to="/points-requests">신청 내역</router-link>
                            </div>
                        </div>
                        <router-link v-if="isLoggedIn" to="/my-page" class="nav-link">마이페이지</router-link>
                        <template v-if="isLoggedIn">
                            <a href="#" @click.prevent="logout" class="nav-link">로그아웃</a>
                        </template>
                        <template v-else>
                            <router-link to="/signup" class="nav-link">회원가입</router-link>
                            <span style="color: #ddd; padding: 0 8px;">|</span>
                            <router-link to="/login" class="nav-link">로그인</router-link>
                        </template>
                    </div>
                </div>
            </nav>
            <div class="container">
                <div class="dashboard">
                    <div class="back-button">
                        <button @click="$router.back()" class="btn btn-sm btn-secondary">← 목록으로</button>
                    </div>
                    
                    <div v-if="review" class="detail-container">
                        <div class="detail-header">
                            <div style="display: flex; gap: 20px; align-items: start; flex-wrap: wrap;">
                                <img v-if="review.book.cover" :src="review.book.cover" :alt="review.book.title"
                                     style="width: 150px; height: 200px; object-fit: cover; border-radius: 8px;">
                                <div style="flex: 1;">
                                    <h2>{{ review.book.title }}</h2>
                                    <p style="color: #666; margin-top: 8px;">{{ review.book.author }}</p>
                                    <div class="detail-meta" style="border-top: none; padding-top: 0; margin-top: 16px;">
                                        <span><strong>작성일:</strong> {{ review.date }}</span>
                                        <span><strong>별점:</strong> {{ '⭐'.repeat(review.rating) }} ({{ review.rating }}점)</span>
                                        <span><strong>상태:</strong> 
                                            <span :class="['badge', 'badge-' + review.status]">
                                                {{ getStatusText(review.status) }}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div v-if="review.status === 'rejected'" class="alert-box danger">
                            <strong>⚠️ 반려 사유:</strong> {{ review.rejectionReason }}
                        </div>
                        
                        <div class="detail-content" style="margin-top: 30px;">
                            <h3 style="margin-bottom: 15px;">감상문 내용</h3>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; line-height: 1.8;">
                                <p style="white-space: pre-wrap;">{{ review.content }}</p>
                            </div>
                            <p style="text-align: right; color: #666; font-size: 14px; margin-top: 8px;">
                                {{ review.content.length }}자
                            </p>
                        </div>
                        
                        <div v-if="review.status === 'pending' || review.status === 'rejected'" class="button-group" style="margin-top: 30px;">
                            <button @click="editReview" class="btn btn-sm">수정하기</button>
                        </div>
                    </div>
                    
                    <div v-else>
                        <div class="alert-box danger">
                            <p>감상문을 찾을 수 없습니다.</p>
                        </div>
                        <button @click="$router.push('/my-reviews')" class="btn btn-sm">목록으로</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            reviewId: this.$route.params.id,
            review: null
        };
    },
    mounted() {
        const reviews = store.getReviews();
        this.review = reviews.find(r => r.id == this.reviewId);
    },
    methods: {
        getStatusText(status) {
            const statusMap = {
                'pending': '승인 대기',
                'approved': '승인 완료',
                'rejected': '반려'
            };
            return statusMap[status] || status;
        },
        editReview() {
            this.$router.push(`/review/${this.review.bookId}?reviewId=${this.review.id}`);
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
