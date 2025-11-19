// 내 감상문 목록 컴포넌트
const MyReviews = {
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
                            <router-link to="/my-page" class="nav-link">마이페이지</router-link>
                            <a href="#" @click.prevent="logout" class="nav-link">로그아웃</a>
                        </div>
                    </div>
                </div>
            </nav>
            
            <div class="container">
                <div class="dashboard">
                    <h2>작성한 감상문 📝</h2>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 20px; flex-wrap: wrap;">
                        <button @click="$router.push('/dashboard')" class="btn btn-sm">+ 새로운 감상문 작성하기</button>
                        
                        <!-- 감상문 검색 -->
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <select v-model="searchType" style="padding: 8px; border: 1px solid #e0e0e0; border-radius: 8px;">
                                <option value="title">도서명</option>
                                <option value="date">작성일</option>
                            </select>
                            <input v-model="searchQuery" 
                                   type="text" 
                                   :placeholder="searchType === 'title' ? '도서명 검색...' : '날짜 검색 (예: 2024)'"
                                   style="padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px; min-width: 200px;">
                            <button @click="searchQuery = ''" class="btn btn-sm btn-secondary">초기화</button>
                        </div>
                    </div>
                    
                    <div v-if="filteredReviews.length > 0">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width: 200px;">도서명</th>
                                        <th style="width: 300px;">내용</th>
                                        <th style="width: 120px;">작성일</th>
                                        <th style="width: 100px;">별점</th>
                                        <th style="width: 100px;">상태</th>
                                        <th style="width: 120px;">공개 설정</th>
                                        <th style="width: 100px;">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="review in filteredReviews" :key="review.id">
                                        <td class="clickable" @click="goToBookDetail(review)">
                                            <strong>{{ review.book.title }}</strong>
                                        </td>
                                        <td class="clickable" @click="viewDetail(review.id)" style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                            {{ review.content.substring(0, 50) }}...
                                        </td>
                                        <td style="white-space: nowrap;">{{ review.date }}</td>
                                        <td style="white-space: nowrap;">{{ '⭐'.repeat(review.rating) }}</td>
                                        <td style="white-space: nowrap;">
                                            <span :class="['badge', 'badge-' + review.status]">
                                                {{ getStatusText(review.status) }}
                                            </span>
                                        </td>
                                        <td style="white-space: nowrap;">
                                            <button v-if="review.status === 'approved'" 
                                                    @click="togglePublic(review)" 
                                                    class="btn btn-sm"
                                                    style="padding: 6px 12px; font-size: 12px;">
                                                {{ review.isPublic ? '🔓 공개' : '🔒 비공개' }}
                                            </button>
                                            <span v-else style="color: #999; font-size: 12px;">-</span>
                                        </td>
                                        <td style="white-space: nowrap;">
                                            <button v-if="review.status === 'pending' || review.status === 'rejected'" 
                                                    @click="editReview(review)" 
                                                    class="btn btn-sm"
                                                    style="padding: 6px 12px;">
                                                수정
                                            </button>
                                            <span v-else style="color: #999; font-size: 12px;">-</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div v-else-if="searchQuery" style="text-align: center; padding: 60px 20px; color: #666;">
                        <div style="font-size: 64px; margin-bottom: 16px;">🔍</div>
                        <h3 style="margin-bottom: 12px; color: #333;">검색 결과가 없습니다</h3>
                        <p>다른 검색어로 다시 시도해보세요.</p>
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
            headerSearchQuery: '',
            searchQuery: '',
            searchType: 'title'
        };
    },
    computed: {
        myReviews() {
            return store.getReviews()
                .filter(r => r.userId === store.currentUser.id)
                .sort((a, b) => b.id - a.id);
        },
        filteredReviews() {
            if (!this.searchQuery.trim()) {
                return this.myReviews;
            }
            
            const query = this.searchQuery.toLowerCase();
            return this.myReviews.filter(review => {
                if (this.searchType === 'title') {
                    return review.book.title.toLowerCase().includes(query);
                } else {
                    return review.date.includes(query);
                }
            });
        }
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
        getStatusText(status) {
            const statusMap = {
                'pending': '승인 대기',
                'approved': '승인 완료',
                'rejected': '반려'
            };
            return statusMap[status] || status;
        },
        goToBookDetail(review) {
            const bookId = review.bookId || review.book?.isbn || review.book?.id;
            this.$router.push(`/book/${bookId}`);
        },
        viewDetail(reviewId) {
            this.$router.push(`/review-detail/${reviewId}`);
        },
        editReview(review) {
            this.$router.push(`/review/${review.bookId}?reviewId=${review.id}`);
        },
        togglePublic(review) {
            const newStatus = !review.isPublic;
            store.updateReview(review.id, { isPublic: newStatus });
            review.isPublic = newStatus;
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/dashboard');
        }
    }
};
