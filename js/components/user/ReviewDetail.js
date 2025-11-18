// 감상문 상세보기 컴포넌트 (댓글 시스템 추가)
const ReviewDetail = {
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
                                        <span><strong>작성자:</strong> {{ review.userNickname }}</span>
                                        <span><strong>작성일:</strong> {{ review.date }}</span>
                                        <span><strong>별점:</strong> {{ '⭐'.repeat(review.rating) }} ({{ review.rating }}점)</span>
                                        <span><strong>상태:</strong> 
                                            <span :class="['badge', 'badge-' + review.status]">
                                                {{ getStatusText(review.status) }}
                                            </span>
                                        </span>
                                        <span v-if="review.status === 'approved'">
                                            <strong>공개:</strong> {{ review.isPublic ? '공개' : '비공개' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div v-if="review.status === 'rejected'" class="alert-box danger">
                            <strong>⚠️ 반려 사유:</strong> {{ review.rejectionReason }}
                        </div>
                        
                        <!-- 한줄 평 (항상 표시) -->
                        <div class="detail-content" style="margin-top: 20px; background: #f8f9fa; padding: 16px; border-radius: 8px;">
                            <h4 style="margin-bottom: 12px;">💬 한줄 평</h4>
                            <p style="font-size: 16px; color: #333;">{{ review.onelineReview }}</p>
                            <button v-if="review.status === 'approved'"
                                    @click="toggleLike('oneline', review.id, review.userId)" 
                                    :class="['like-btn', {liked: hasLiked('oneline', review.id)}]"
                                    :disabled="!isLoggedIn || review.userId === currentUserId"
                                    style="margin-top: 12px;">
                                {{ hasLiked('oneline', review.id) ? '❤️' : '🤍' }}
                                {{ getLikeCount('oneline', review.id) }}
                            </button>
                        </div>
                        
                        <!-- 감상문 본문 (공개인 경우만) -->
                        <div v-if="review.isPublic || isMyReview" class="detail-content" style="margin-top: 30px;">
                            <h3 style="margin-bottom: 15px;">📝 감상문 내용</h3>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; line-height: 1.8;">
                                <p style="white-space: pre-wrap;">{{ review.content }}</p>
                            </div>
                            <p style="text-align: right; color: #666; font-size: 14px; margin-top: 8px;">
                                {{ review.content.length }}자
                            </p>
                            
                            <button v-if="review.status === 'approved' && review.isPublic"
                                    @click="toggleLike('review', review.id, review.userId)" 
                                    :class="['like-btn', {liked: hasLiked('review', review.id)}]"
                                    :disabled="!isLoggedIn || review.userId === currentUserId"
                                    style="margin-top: 16px;">
                                {{ hasLiked('review', review.id) ? '❤️' : '🤍' }}
                                {{ getLikeCount('review', review.id) }}
                            </button>
                        </div>
                        
                        <div v-else-if="review.status === 'approved'" class="alert-box info" style="margin-top: 30px;">
                            이 감상문은 비공개 설정되어 있습니다.
                        </div>
                        
                        <!-- 본인 감상문인 경우 공개/비공개 토글 -->
                        <div v-if="isMyReview && review.status === 'approved'" class="button-group" style="margin-top: 20px;">
                            <button @click="togglePublic" class="btn btn-sm">
                                {{ review.isPublic ? '🔒 비공개로 전환' : '🔓 공개로 전환' }}
                            </button>
                        </div>
                        
                        <!-- 수정 버튼 (승인 대기 또는 반려 상태) -->
                        <div v-if="isMyReview && (review.status === 'pending' || review.status === 'rejected')" 
                             class="button-group" style="margin-top: 30px;">
                            <button @click="editReview" class="btn btn-sm">수정하기</button>
                        </div>
                        
                        <!-- 댓글 섹션 (승인된 공개 감상문만) -->
                        <div v-if="review.status === 'approved' && review.isPublic" class="comments-section">
                            <h3>💬 댓글 ({{ comments.length }})</h3>
                            
                            <!-- 댓글 입력 -->
                            <div v-if="isLoggedIn" class="comment-input">
                                <textarea v-model="commentText" 
                                          placeholder="댓글을 입력하세요..."
                                          rows="3"
                                          maxlength="500"></textarea>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                                    <span style="font-size: 12px; color: #666;">{{ commentText.length }} / 500자</span>
                                    <button @click="addComment" 
                                            class="btn btn-sm"
                                            :disabled="!commentText.trim()">
                                        댓글 작성
                                    </button>
                                </div>
                            </div>
                            
                            <div v-else class="alert-box info">
                                댓글을 작성하려면 로그인이 필요합니다.
                            </div>
                            
                            <!-- 댓글 목록 -->
                            <div v-if="comments.length > 0" class="comment-list">
                                <div v-for="comment in sortedComments" :key="comment.id" class="comment-card">
                                    <div class="comment-header">
                                        <div>
                                            <span class="comment-author">{{ comment.userNickname }}</span>
                                            <span class="comment-date">{{ comment.date }}</span>
                                        </div>
                                    </div>
                                    <p class="comment-content">{{ comment.content }}</p>
                                    <button @click="toggleLike('comment', comment.id, comment.userId)" 
                                            :class="['like-btn', {liked: hasLiked('comment', comment.id)}]"
                                            :disabled="!isLoggedIn || comment.userId === currentUserId">
                                        {{ hasLiked('comment', comment.id) ? '❤️' : '🤍' }}
                                        {{ getLikeCount('comment', comment.id) }}
                                    </button>
                                </div>
                            </div>
                            
                            <div v-else style="text-align: center; padding: 40px; color: #666;">
                                <p>아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
                            </div>
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
            review: null,
            commentText: '',
            comments: []
        };
    },
    computed: {
        isLoggedIn() {
            return store.currentUser !== null;
        },
        currentUserId() {
            return store.currentUser?.id;
        },
        isMyReview() {
            return this.isLoggedIn && this.review && this.review.userId === this.currentUserId;
        },
        sortedComments() {
            return [...this.comments].sort((a, b) => b.id - a.id);
        }
    },
    mounted() {
        const reviews = store.getReviews();
        this.review = reviews.find(r => r.id == this.reviewId);
        
        if (this.review) {
            this.loadComments();
        }
    },
    methods: {
        loadComments() {
            this.comments = store.getCommentsByReview(this.reviewId);
        },
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
        togglePublic() {
            const newStatus = !this.review.isPublic;
            store.updateReview(this.review.id, { isPublic: newStatus });
            this.review.isPublic = newStatus;
            alert(newStatus ? '감상문이 공개되었습니다.' : '감상문이 비공개되었습니다.');
        },
        addComment() {
            if (!this.commentText.trim()) {
                alert('댓글을 입력해주세요.');
                return;
            }
            
            const comment = {
                id: Date.now(),
                reviewId: this.reviewId,
                userId: store.currentUser.id,
                userNickname: store.currentUser.nickname,
                content: this.commentText,
                createdAt: new Date().toISOString(),
                date: new Date().toLocaleDateString()
            };
            
            store.addComment(comment);
            this.loadComments();
            this.commentText = '';
            alert('댓글이 작성되었습니다!');
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
