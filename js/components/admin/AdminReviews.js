// 관리자 감상문 관리 컴포넌트
const AdminReviews = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand">📚 관리자 페이지</div>
                    <div class="navbar-nav">
                        <router-link to="/admin" class="nav-link">대시보드</router-link>
                        <router-link to="/admin/reviews" class="nav-link active">감상문 관리</router-link>
                        <router-link to="/admin/books" class="nav-link">도서 관리</router-link>
                        <router-link to="/admin/rewards" class="nav-link">보상 관리</router-link>
                        <router-link to="/admin/stats" class="nav-link">통계</router-link>
                        <a href="#" @click.prevent="logout" class="nav-link">로그아웃</a>
                    </div>
                </div>
            </nav>
            <div class="container">
                <div class="dashboard">
                    <h2>감상문 관리 📝</h2>
                    <div v-if="reviews.length > 0" class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>사용자</th>
                                    <th>도서명</th>
                                    <th>작성일</th>
                                    <th>별점</th>
                                    <th>상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="review in reviews" :key="review.id">
                                    <td>{{ review.userNickname || review.userName }}</td>
                                    <td>{{ review.book.title }}</td>
                                    <td>{{ review.date }}</td>
                                    <td>{{ '⭐'.repeat(review.rating) }}</td>
                                    <td>
                                        <span :class="['badge', 'badge-' + review.status]">
                                            {{ getStatusText(review.status) }}
                                        </span>
                                    </td>
                                    <td>
                                        <button v-if="review.status === 'pending'" 
                                                @click="viewReview(review)" 
                                                class="btn btn-sm">
                                            검토
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else style="text-align: center; padding: 40px; color: #666;">
                        <p>검토할 감상문이 없습니다.</p>
                    </div>
                </div>
            </div>

            <div v-if="selectedReview" class="modal-overlay" @click.self="selectedReview = null">
                <div class="modal">
                    <h3>감상문 검토</h3>
                    <p><strong>도서:</strong> {{ selectedReview.book.title }}</p>
                    <p><strong>작성자:</strong> {{ selectedReview.userNickname || selectedReview.userName }}</p>
                    <p><strong>작성일:</strong> {{ selectedReview.date }}</p>
                    <p><strong>별점:</strong> {{ '⭐'.repeat(selectedReview.rating) }}</p>
                    <div class="form-group">
                        <label>내용</label>
                        <textarea :value="selectedReview.content" readonly rows="10"></textarea>
                    </div>
                    <div class="modal-actions">
                        <button @click="approveReview(selectedReview)" class="btn btn-sm btn-success">승인 (100P 지급)</button>
                        <button @click="showRejectForm = true" class="btn btn-sm btn-danger">반려</button>
                        <button @click="closeModal" class="btn btn-sm btn-secondary">닫기</button>
                    </div>
                    
                    <div v-if="showRejectForm" style="margin-top: 20px;">
                        <div class="form-group">
                            <label>반려 사유</label>
                            <textarea v-model="rejectionReason" rows="4" placeholder="반려 사유를 입력하세요..."></textarea>
                        </div>
                        <button @click="rejectReview(selectedReview)" class="btn btn-sm btn-danger" :disabled="!rejectionReason">
                            반려 확정
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            reviews: store.getReviews(),
            selectedReview: null,
            showRejectForm: false,
            rejectionReason: ''
        };
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
        viewReview(review) {
            this.selectedReview = review;
            this.showRejectForm = false;
            this.rejectionReason = '';
        },
        approveReview(review) {
            store.updateReview(review.id, { status: 'approved' });
            const user = store.getUsers().find(u => u.id === review.userId);
            if (user) {
                store.addUserPoints(user.email, 100, `감상문 승인: ${review.book.title}`);
            }
            alert('감상문이 승인되었습니다. 사용자에게 100 포인트가 지급되었습니다.');
            this.closeModal();
            this.reviews = store.getReviews();
        },
        rejectReview(review) {
            if (!this.rejectionReason) {
                alert('반려 사유를 입력해주세요.');
                return;
            }
            
            store.updateReview(review.id, { 
                status: 'rejected',
                rejectionReason: this.rejectionReason
            });
            alert('감상문이 반려되었습니다.');
            this.closeModal();
            this.reviews = store.getReviews();
        },
        closeModal() {
            this.selectedReview = null;
            this.showRejectForm = false;
            this.rejectionReason = '';
        },
        logout() {
            store.clearCurrentUser();
            // 즉시 UI 업데이트를 위해 페이지 새로고침
            window.location.href = '/#/dashboard';
        }
    }
};
