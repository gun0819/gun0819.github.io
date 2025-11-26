// 도서 상세 페이지 컴포넌트 (개선된 UI)
const BookDetail = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-content">
                        <div class="navbar-left">
                            <div class="navbar-brand" @click="$router.push('/dashboard')" style="cursor: pointer;">
                                📚 독서 인증 플랫폼
                            </div>
                            
                            <!-- 통합 검색바 -->
                            <div class="navbar-search">
                                <input v-model="headerSearchQuery" 
                                       class="navbar-search-input"
                                       placeholder="도서 검색..." 
                                       @keyup.enter="headerSearch">
                                <button class="navbar-search-button" @click="headerSearch">검색</button>
                            </div>
                        </div>
                        
                        <div v-if="isLoggedIn" class="navbar-nav">
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
                        
                        <div v-else class="navbar-nav">
                            <router-link to="/signup" class="nav-link">회원가입</router-link>
                            <router-link to="/login" class="nav-link">로그인</router-link>
                        </div>
                    </div>
                </div>
            </nav>
            
            <div class="container">
                <div v-if="isLoading" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>책 정보를 불러오는 중...</p>
                </div>
                
                <div v-else-if="book" class="book-detail-container">
                    <div class="back-button">
                        <button @click="goBack" class="btn btn-sm btn-secondary">← 뒤로가기</button>
                    </div>
                    
                    <!-- 책 정보 섹션 -->
                    <div class="book-info-section">
                        <div class="book-info-left">
                            <img v-if="book.cover" :src="book.cover" :alt="book.title" class="book-detail-cover">
                            <div v-else class="book-detail-cover" style="display: flex; align-items: center; justify-content: center; font-size: 72px; background: #f5f5f5;">📚</div>
                        </div>
                        
                        <div class="book-info-right">
                            <h1 class="book-detail-title">{{ book.title }}</h1>
                            <div class="book-detail-meta">
                                <p><strong>저자:</strong> {{ book.author }}</p>
                                <p v-if="book.publisher"><strong>출판사:</strong> {{ book.publisher }}</p>
                                <p v-if="book.pubDate"><strong>출간일:</strong> {{ book.pubDate }}</p>
                                <p v-if="book.isbn"><strong>ISBN:</strong> {{ book.isbn }}</p>
                                <p v-if="book.genre"><strong>분야:</strong> {{ book.genre }}</p>
                            </div>
                            
                            <!-- 평균 별점 -->
                            <div class="book-rating-section">
                                <div class="rating-stars">
                                    {{ '⭐'.repeat(Math.round(averageRating)) }}{{ '☆'.repeat(5 - Math.round(averageRating)) }}
                                </div>
                                <div class="rating-number">{{ averageRating.toFixed(1) }} / 5.0</div>
                                <div class="rating-count">({{ reviewCount }}개의 평가)</div>
                            </div>
                            
                            <!-- 액션 버튼 -->
                            <div v-if="!isExcludedBook" class="book-actions">
                                <button v-if="isLoggedIn && !hasReview" @click="startReview" class="btn">
                                    ✍️ 감상문 작성
                                </button>
                                <button v-if="isLoggedIn && hasReview" disabled class="btn" style="opacity: 0.5;">
                                    ✅ 감상문 작성 완료
                                </button>
                                <button v-if="isLoggedIn && !hasQuiz && availableQuizzes.length > 0" @click="startQuiz" class="btn">
                                    🎯 퀴즈 풀기
                                </button>
                                <button v-if="isLoggedIn && hasQuiz" disabled class="btn" style="opacity: 0.5;">
                                    ✅ 퀴즈 완료
                                </button>
                                <button v-if="!isLoggedIn" @click="$router.push('/login')" class="btn">
                                    로그인하고 시작하기
                                </button>
                            </div>
                            
                            <div v-if="isExcludedBook" class="alert-box warning" style="margin-top: 20px;">
                                <strong>⚠️ 알림</strong><br>
                                이 책은 문제집/자격증/수험서 카테고리로 감상문 작성 시 포인트가 지급되지 않습니다.
                            </div>
                        </div>
                    </div>
                    
                    <!-- 책 소개 섹션 (분리) -->
                    <div v-if="book.description" class="section-container">
                        <h2>📖 책 소개</h2>
                        <div class="section-content">
                            <p class="book-description-text">{{ book.description }}</p>
                        </div>
                    </div>
                    
                    <!-- 한줄 평 섹션 (개선된 UI) -->
                    <div class="section-container">
                        <div class="section-header">
                            <h2>💬 한줄 평 ({{ onelineReviews.length }})</h2>
                            <div class="sort-buttons">
                                <button :class="['sort-btn', {active: reviewSortType === 'likes'}]" @click="reviewSortType = 'likes'">
                                    공감순
                                </button>
                                <button :class="['sort-btn', {active: reviewSortType === 'recent'}]" @click="reviewSortType = 'recent'">
                                    최신순
                                </button>
                            </div>
                        </div>
                        
                        <div v-if="sortedOnelineReviews.length > 0" class="review-list">
                            <div v-for="oneline in sortedOnelineReviews" :key="oneline.id" class="review-item">
                                <div class="review-header">
                                    <div class="review-user-info">
                                        <span class="review-nickname">{{ oneline.userNickname }}</span>
                                        <span class="review-rating">{{ '⭐'.repeat(oneline.rating) }}</span>
                                        <span class="review-date">{{ oneline.date }}</span>
                                    </div>
                                </div>
                                <p class="review-content">{{ oneline.onelineReview }}</p>
                                <div class="review-footer">
                                    <button @click="toggleLike('oneline', oneline.id, oneline.userId)" 
                                            :class="['interaction-btn', {active: hasLiked('oneline', oneline.id)}]"
                                            :disabled="!isLoggedIn || oneline.userId === currentUserId">
                                        <span class="icon">{{ hasLiked('oneline', oneline.id) ? '❤️' : '🤍' }}</span>
                                        <span class="count">{{ getLikeCount('oneline', oneline.id) }}</span>
                                    </button>
                                    <button v-if="oneline.isPublic" @click="viewReview(oneline.id)" class="interaction-btn">
                                        <span class="icon">📄</span>
                                        <span class="text">전체 감상문 보기</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div v-else class="empty-state">
                            <p>아직 한줄 평이 없습니다. 첫 번째 한줄 평을 남겨보세요!</p>
                        </div>
                    </div>
                    
                    <!-- 사용자 퀴즈 섹션 (정렬 기능 추가) -->
                    <div class="section-container">
                        <div class="section-header">
                            <h2>🎯 사용자 제출 퀴즈 ({{ availableQuizzes.length }})</h2>
                            <div class="sort-buttons">
                                <button :class="['sort-btn', {active: quizSortType === 'likes'}]" @click="quizSortType = 'likes'">
                                    공감순
                                </button>
                                <button :class="['sort-btn', {active: quizSortType === 'recent'}]" @click="quizSortType = 'recent'">
                                    최신순
                                </button>
                            </div>
                        </div>
                        
                        <div v-if="sortedQuizzes.length > 0" class="quiz-grid">
                            <div v-for="quiz in sortedQuizzes" :key="quiz.id" class="quiz-item">
                                <div class="quiz-header">
                                    <h3>퀴즈 by {{ quiz.creatorNickname }}</h3>
                                    <button @click="toggleLike('quiz', quiz.id, quiz.creatorId)" 
                                            :class="['interaction-btn', 'small', {active: hasLiked('quiz', quiz.id)}]"
                                            :disabled="!isLoggedIn || quiz.creatorId === currentUserId">
                                        <span class="icon">{{ hasLiked('quiz', quiz.id) ? '❤️' : '🤍' }}</span>
                                        <span class="count">{{ getLikeCount('quiz', quiz.id) }}</span>
                                    </button>
                                </div>
                                <p class="quiz-info">
                                    {{ quiz.questions.length }}문제 
                                    (객관식: {{ quiz.questions.filter(q => q.type === 'multiple').length }}, 
                                    주관식: {{ quiz.questions.filter(q => q.type === 'short').length }})
                                </p>
                                <button v-if="isLoggedIn && !hasQuiz" @click="startUserQuiz(quiz.id)" class="btn btn-sm">
                                    퀴즈 풀기
                                </button>
                                <button v-else-if="!isLoggedIn" @click="$router.push('/login')" class="btn btn-sm">
                                    로그인하기
                                </button>
                                <button v-else disabled class="btn btn-sm" style="opacity: 0.5;">
                                    이미 완료
                                </button>
                            </div>
                        </div>
                        
                        <div v-else class="empty-state">
                            <p>아직 등록된 퀴즈가 없습니다.</p>
                            <p v-if="isLoggedIn" style="font-size: 14px; color: #666; margin-top: 8px;">
                                감상문 작성 시 퀴즈를 등록하면 다른 사용자들이 풀 수 있습니다!
                            </p>
                        </div>
                    </div>
                </div>
                
                <div v-else-if="!isLoading" class="alert-box danger">
                    <p>책 정보를 찾을 수 없습니다.</p>
                    <button @click="goBack" class="btn btn-sm" style="margin-top: 16px;">뒤로가기</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            bookId: this.$route.params.id,
            book: null,
            isLoading: true,
            reviewSortType: 'likes',
            quizSortType: 'likes',
            reviews: [],
            onelineReviews: [],
            headerSearchQuery: ''
        };
    },
    computed: {
        isLoggedIn() {
            return store.currentUser !== null;
        },
        currentUserId() {
            return store.currentUser?.id;
        },
        isExcludedBook() {
            if (!this.book) return false;
            return store.isExcludedCategory(this.book.categoryName);
        },
        hasReview() {
            if (!this.isLoggedIn) return false;
            return store.hasReviewForBook(
                store.currentUser.id, 
                this.bookId,
                this.book?.title,
                this.book?.author
            );
        },
        hasQuiz() {
            if (!this.isLoggedIn) return false;
            return store.hasQuizForBook(store.currentUser.id, this.bookId);
        },
        availableQuizzes() {
            if (!this.book) return [];
            return store.getQuizzesByBook(this.bookId, this.book.title, this.book.author);
        },
        averageRating() {
            if (this.reviews.length === 0) return 0;
            const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
            return sum / this.reviews.length;
        },
        reviewCount() {
            return this.reviews.length;
        },
        sortedOnelineReviews() {
            if (this.reviewSortType === 'likes') {
                return [...this.onelineReviews].sort((a, b) => {
                    const likesA = store.getLikeCount('oneline', a.id);
                    const likesB = store.getLikeCount('oneline', b.id);
                    return likesB - likesA;
                });
            } else {
                return [...this.onelineReviews].sort((a, b) => b.id - a.id);
            }
        },
        sortedQuizzes() {
            if (this.quizSortType === 'likes') {
                return [...this.availableQuizzes].sort((a, b) => {
                    const likesA = store.getLikeCount('quiz', a.id);
                    const likesB = store.getLikeCount('quiz', b.id);
                    return likesB - likesA;
                });
            } else {
                return [...this.availableQuizzes].sort((a, b) => b.id - a.id);
            }
        }
    },
    async mounted() {
        await this.loadBookDetail();
        this.loadReviews();
    },
    methods: {
        headerSearch() {
            if (!this.headerSearchQuery.trim()) {
                alert('검색어를 입력해주세요.');
                return;
            }
            this.$router.push({
                path: '/search',
                query: { q: this.headerSearchQuery }
            });
        },
        async loadBookDetail() {
            this.isLoading = true;
            try {
                const results = await bookAPI.searchAladin(this.bookId);
                if (results.length > 0) {
                    this.book = results[0];
                }
            } catch (error) {
                console.error('책 정보 로드 실패:', error);
            } finally {
                this.isLoading = false;
            }
        },
        loadReviews() {
            if (!this.book) return;
            
            const allReviews = store.getReviews();
            
            this.reviews = allReviews.filter(r => {
                if (r.status !== 'approved') return false;
                if (!r.onelineReview) return false;
                
                const reviewBookId = r.bookId || r.book?.isbn;
                if (reviewBookId == this.bookId) return true;
                
                return r.book?.title === this.book.title && 
                       r.book?.author === this.book.author;
            });
            
            this.onelineReviews = this.reviews;
        },
        goBack() {
            this.$router.back();
        },
        startReview() {
            if (!this.isLoggedIn) {
                alert('로그인이 필요합니다.');
                this.$router.push('/login');
                return;
            }
            this.$router.push(`/review/${this.bookId}`);
        },
        startQuiz() {
            if (!this.isLoggedIn) {
                alert('로그인이 필요합니다.');
                this.$router.push('/login');
                return;
            }
            
            if (this.availableQuizzes.length === 0) {
                alert('아직 등록된 퀴즈가 없습니다.');
                return;
            }
            
            this.$router.push(`/user-quiz/${this.availableQuizzes[0].id}`);
        },
        startUserQuiz(quizId) {
            this.$router.push(`/user-quiz/${quizId}`);
        },
        viewReview(reviewId) {
            this.$router.push(`/review-detail/${reviewId}`);
        },
        toggleLike(targetType, targetId, authorId) {
            if (!this.isLoggedIn) {
                alert('로그인이 필요합니다.');
                return;
            }
            
            if (authorId === this.currentUserId) {
                alert('자신의 글에는 공감할 수 없습니다.');
                return;
            }
            
            if (store.hasLiked(this.currentUserId, targetType, targetId)) {
                store.removeLike(this.currentUserId, targetType, targetId);
            } else {
                store.addLike({
                    id: Date.now(),
                    userId: this.currentUserId,
                    targetType: targetType,
                    targetId: targetId,
                    createdAt: new Date().toISOString()
                });
            }
            
            this.$forceUpdate();
        },
        hasLiked(targetType, targetId) {
            if (!this.isLoggedIn) return false;
            return store.hasLiked(this.currentUserId, targetType, targetId);
        },
        getLikeCount(targetType, targetId) {
            return store.getLikeCount(targetType, targetId);
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/dashboard');
        }
    }
};
