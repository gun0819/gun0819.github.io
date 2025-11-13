// 감상문 작성 컴포넌트
const ReviewWrite = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand" @click="$router.push('/dashboard')" style="cursor: pointer;">
                        📚 독서 인증 플랫폼
                    </div>
                    <div class="navbar-nav">
                        <router-link to="/my-reviews" class="nav-link">내 감상문</router-link>
                        <router-link to="/completed-quizzes" class="nav-link">내 퀴즈</router-link>
                        <div class="dropdown">
                            <a class="nav-link">포인트 ▼</a>
                            <div class="dropdown-content">
                                <router-link to="/points-exchange">포인트 교환소</router-link>
                                <router-link to="/points-history">적립 내역</router-link>
                                <router-link to="/points-requests">신청 내역</router-link>
                            </div>
                        </div>
                        <router-link to="/my-page" class="nav-link">마이페이지</router-link>
                        <a href="#" @click.prevent="logout" class="nav-link">로그아웃</a>
                    </div>
                </div>
            </nav>
            <div class="container">
                <div class="dashboard">
                    <div v-if="isLoading" class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>책 정보를 불러오는 중...</p>
                    </div>
                    
                    <div v-else-if="alreadySubmitted" style="text-align: center; padding: 60px 20px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
                        <h2>이미 제출한 감상문입니다</h2>
                        <p style="color: #666; margin: 20px 0;">이 책의 감상문은 이미 제출하셨습니다.</p>
                        <div style="margin-top: 30px;">
                            <button @click="$router.push('/my-reviews')" class="btn btn-sm" style="margin-right: 10px;">
                                내 감상문 보기
                            </button>
                            <button @click="$router.push('/dashboard')" class="btn btn-sm btn-secondary">
                                홈으로
                            </button>
                        </div>
                    </div>
                    
                    <div v-else-if="book">
                        <div class="back-button">
                            <button @click="goBack" class="btn btn-sm btn-secondary">← 뒤로가기</button>
                        </div>
                        
                        <h2>{{ isEdit ? '감상문 수정' : '감상문 작성' }} ✍️</h2>
                        
                        <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
                            <img v-if="book.cover" :src="book.cover" :alt="book.title" 
                                 style="width: 150px; height: 200px; object-fit: cover; border-radius: 8px;">
                            <div style="flex: 1;">
                                <h3>{{ book.title }}</h3>
                                <p><strong>저자:</strong> {{ book.author }}</p>
                                <p v-if="book.publisher"><strong>출판사:</strong> {{ book.publisher }}</p>
                                <p v-if="book.isbn"><strong>ISBN:</strong> {{ book.isbn }}</p>
                            </div>
                        </div>
                        
                        <div v-if="existingReview && existingReview.status === 'rejected'" class="alert-box danger">
                            <strong>반려 사유:</strong> {{ existingReview.rejectionReason }}
                        </div>
                        
                        <div class="form-group">
                            <label>감상문 (최소 100자)</label>
                            <textarea v-model="reviewText" rows="10" placeholder="책을 읽고 느낀 점을 자유롭게 작성해주세요..."></textarea>
                            <p style="text-align: right; color: #666; margin-top: 5px;">
                                {{ reviewText.length }} / 100자
                                <span v-if="reviewText.length >= 100" style="color: #4caf50;">✓</span>
                            </p>
                        </div>

                        <div class="form-group">
                            <label>별점</label>
                            <div style="font-size: 32px;">
                                <span v-for="i in 5" :key="i" @click="rating = i" style="cursor: pointer;">
                                    {{ i <= rating ? '⭐' : '☆' }}
                                </span>
                            </div>
                            <p style="color: #666; font-size: 14px; margin-top: 8px;">
                                {{ rating }}점 / 5점
                            </p>
                        </div>

                        <div class="button-group">
                            <button @click="submitReview" :disabled="reviewText.length < 100" class="btn">
                                {{ isEdit ? '수정 완료' : '제출하기' }}
                            </button>
                            <button @click="goBack" class="btn btn-secondary">취소</button>
                        </div>
                    </div>
                    
                    <div v-else-if="!isLoading">
                        <div class="alert-box danger">
                            <p>책 정보를 찾을 수 없습니다.</p>
                        </div>
                        <button @click="$router.push('/dashboard')" class="btn btn-sm">홈으로 돌아가기</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            bookId: this.$route.params.id,
            reviewId: this.$route.query.reviewId,
            book: null,
            existingReview: null,
            isEdit: false,
            alreadySubmitted: false,
            reviewText: '',
            rating: 5,
            isLoading: true
        };
    },
    async mounted() {
        // 수정 모드 확인
        if (this.reviewId) {
            const reviews = store.getReviews();
            this.existingReview = reviews.find(r => r.id == this.reviewId);
            if (this.existingReview) {
                this.isEdit = true;
                this.reviewText = this.existingReview.content;
                this.rating = this.existingReview.rating;
            }
        } else {
            // 신규 작성 모드에서 이미 제출한 감상문이 있는지 확인
            if (store.currentUser && store.hasReviewForBook(store.currentUser.id, this.bookId)) {
                this.alreadySubmitted = true;
                this.isLoading = false;
                return;
            }
        }
        
        try {
            // ISBN이나 제목으로 알라딘 API에서 책 정보 가져오기
            const results = await bookAPI.searchAladin(this.bookId);
            if (results.length > 0) {
                this.book = results[0];
            } else {
                // 검색 결과 없으면 에러
                this.book = null;
            }
        } catch (error) {
            console.error('책 정보 로드 실패:', error);
            this.book = null;
        } finally {
            this.isLoading = false;
        }
    },
    methods: {
        goBack() {
            this.$router.back();
        },
        submitReview() {
            if (this.reviewText.length < 100) {
                alert('감상문은 최소 100자 이상 작성해주세요.');
                return;
            }
            
            if (this.isEdit) {
                // 수정 모드
                const updates = {
                    content: this.reviewText,
                    rating: this.rating,
                    status: 'pending'
                };
                
                store.updateReview(this.existingReview.id, updates);
                alert('감상문이 수정되었습니다! 관리자 재승인을 기다려주세요.');
            } else {
                // 신규 작성 - 재제출 방지 체크
                if (store.hasReviewForBook(store.currentUser.id, this.bookId)) {
                    alert('이미 감상문을 제출한 도서입니다.');
                    this.$router.push('/my-reviews');
                    return;
                }
                
                const review = {
                    id: Date.now(),
                    userId: store.currentUser.id,
                    userName: store.currentUser.name,
                    userNickname: store.currentUser.nickname,
                    bookId: this.bookId,
                    book: this.book,
                    content: this.reviewText,
                    rating: this.rating,
                    status: 'pending',
                    date: new Date().toLocaleDateString()
                };
                
                store.addReview(review);
                alert('감상문이 제출되었습니다! 관리자 승인 후 100 포인트가 지급됩니다.');
            }
            
            this.$router.push('/my-reviews');
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
