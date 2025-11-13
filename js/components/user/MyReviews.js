// 내 감상문 목록 컴포넌트
const MyReviews = {
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
                    <h2>작성한 감상문 📝</h2>
                    
                    <div style="margin-bottom: 20px;">
                        <button @click="$router.push('/dashboard')" class="btn btn-sm">+ 새로운 감상문 작성하기</button>
                    </div>
                    
                    <div v-if="myReviews.length > 0">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>도서명</th>
                                        <th>작성일</th>
                                        <th>별점</th>
                                        <th>상태</th>
                                        <th>내용</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="review in myReviews" :key="review.id">
                                        <td>{{ review.book.title }}</td>
                                        <td>{{ review.date }}</td>
                                        <td>{{ '⭐'.repeat(review.rating) }}</td>
                                        <td>
                                            <span :class="['badge', 'badge-' + review.status]">
                                                {{ getStatusText(review.status) }}
                                            </span>
                                        </td>
                                        <td class="clickable" @click="viewDetail(review.id)">
                                            {{ review.content.substring(0, 30) }}...
                                        </td>
                                        <td>
                                            <button v-if="review.status === 'pending' || review.status === 'rejected'" 
                                                    @click="editReview(review)" 
                                                    class="btn btn-sm">
                                                수정
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div v-else style="text-align: center; padding: 60px 20px; color: #666;">
                        <div style="font-size: 64px; margin-bottom: 16px;">📝</div>
                        <h3 style="margin-bottom: 12px; color: #333;">아직 작성한 감상문이 없습니다</h3>
                        <p style="margin-bottom: 24px;">도서를 검색하고 감상문을 작성해보세요!</p>
                        <button @click="$router.push('/dashboard')" class="btn btn-sm">도서 검색하기</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    computed: {
        isLoggedIn() {
            return store.currentUser !== null;
        },
        myReviews() {
            return store.getReviews()
                .filter(r => r.userId === store.currentUser.id)
                .sort((a, b) => b.id - a.id); // 최신순 정렬
        }
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
        viewDetail(reviewId) {
            this.$router.push(`/review-detail/${reviewId}`);
        },
        editReview(review) {
            this.$router.push(`/review/${review.bookId}?reviewId=${review.id}`);
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
