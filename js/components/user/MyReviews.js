const MyReviews = {
    template: `
        <div>
            <div class="top-search-bar">
                <div class="top-search-container">
                    <div class="top-search-box">
                        <input v-model="searchQuery" 
                               class="top-search-input"
                               placeholder="도서명 또는 저자를 입력하세요..." 
                               @keyup.enter="searchBooks">
                        
                        <button class="top-search-button" @click="searchBooks">검색</button>
                    </div>
                    
                    <div class="top-auth-buttons">
                        <router-link to="/my-page" class="top-auth-link">마이페이지</router-link>
                    </div>
                </div>
            </div>
            
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand" @click="$router.push('/dashboard')" style="cursor: pointer;">
                        📚 독서 인증 플랫폼
                    </div>
                    <div class="navbar-nav">
                        <router-link to="/my-reviews" class="nav-link active">내 감상문</router-link>
                        <router-link to="/completed-quizzes" class="nav-link">내 퀴즈</router-link>
                        <div class="dropdown">
                            <a class="nav-link">포인트 ▼</a>
                            <div class="dropdown-content">
                                <router-link to="/points-exchange">포인트 교환소</router-link>
                                <router-link to="/points-history">적립 내역</router-link>
                                <router-link to="/points-requests">신청 내역</router-link>
                            </div>
                        </div>
                        <a href="#" @click.prevent="logout" class="nav-link">로그아웃</a>
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
    data() {
        return {
            searchQuery: ''
        };
    },
    computed: {
        myReviews() {
            return store.getReviews()
                .filter(r => r.userId === store.currentUser.id)
                .sort((a, b) => b.id - a.id);
        }
    },
    methods: {
        searchBooks() {
            if (!this.searchQuery.trim()) {
                alert('검색어를 입력해주세요.');
                return;
            }
            this.$router.push({
                path: '/search',
                query: { q: this.searchQuery }
            });
        },
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
