// 검색 결과 페이지 컴포넌트
const SearchResults = {
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
                        <button @click="$router.push('/dashboard')" class="btn btn-sm btn-secondary">← 메인으로</button>
                    </div>
                    
                    <h2>검색 결과: "{{ searchQuery }}" 📚</h2>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                        <p style="color: #666;">총 {{ books.length }}개의 도서를 찾았습니다.</p>
                        <div class="bestseller-filters">
                            <button :class="['filter-btn', {active: sortBy === 'Accuracy'}]" 
                                    @click="changeSortBy('Accuracy')">정확도순</button>
                            <button :class="['filter-btn', {active: sortBy === 'PublishTime'}]" 
                                    @click="changeSortBy('PublishTime')">최신순</button>
                            <button :class="['filter-btn', {active: sortBy === 'Title'}]" 
                                    @click="changeSortBy('Title')">제목순</button>
                        </div>
                    </div>
                    
                    <div v-if="isLoading" class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>검색 중...</p>
                    </div>
                    
                    <div v-else-if="books.length > 0" class="card-grid">
                        <div v-for="book in books" :key="book.id" class="card" @click="selectBook(book)" style="cursor: pointer;">
                            <img v-if="book.cover" :src="book.cover" :alt="book.title" class="book-cover">
                            <div v-else class="book-cover" style="display: flex; align-items: center; justify-content: center; font-size: 48px; background: #f5f5f5;">
                                📚
                            </div>
                            <h3>{{ book.title }}</h3>
                            <p><strong>저자:</strong> {{ book.author }}</p>
                            <p v-if="book.publisher"><strong>출판사:</strong> {{ book.publisher }}</p>
                            <p v-if="book.pubDate" style="font-size: 12px; color: #999;">{{ book.pubDate }}</p>
                        </div>
                    </div>
                    
                    <div v-else style="text-align: center; padding: 60px 20px; color: #666;">
                        <div style="font-size: 64px; margin-bottom: 16px;">🔍</div>
                        <h3 style="margin-bottom: 12px; color: #333;">검색 결과가 없습니다</h3>
                        <p>다른 검색어로 다시 시도해보세요.</p>
                    </div>
                </div>
            </div>
            
            <div v-if="selectedBook" class="modal-overlay" @click.self="selectedBook = null">
                <div class="modal">
                    <img v-if="selectedBook.cover" :src="selectedBook.cover" :alt="selectedBook.title"
                         style="width: 100%; max-width: 200px; margin: 0 auto 20px; display: block; border-radius: 8px;">
                    <h3>{{ selectedBook.title }}</h3>
                    <p><strong>저자:</strong> {{ selectedBook.author }}</p>
                    <p v-if="selectedBook.publisher"><strong>출판사:</strong> {{ selectedBook.publisher }}</p>
                    <p v-if="selectedBook.pubDate"><strong>출간일:</strong> {{ selectedBook.pubDate }}</p>
                    <p v-if="selectedBook.description" style="margin-top: 16px; color: #666; font-size: 14px;">
                        {{ selectedBook.description.substring(0, 200) }}...
                    </p>
                    <div v-if="!isLoggedIn" class="alert-box warning" style="margin-top: 20px;">
                        감상문 작성과 퀴즈 풀기는 로그인 후 이용 가능합니다.
                    </div>
                    <div class="modal-actions">
                        <button v-if="isLoggedIn" @click="startReview" class="btn btn-sm">감상문 작성</button>
                        <button v-if="isLoggedIn" @click="startQuiz" class="btn btn-sm">퀴즈 풀기</button>
                        <button v-if="!isLoggedIn" @click="$router.push('/login')" class="btn btn-sm">로그인하기</button>
                        <button @click="selectedBook = null" class="btn btn-sm btn-secondary">닫기</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            searchQuery: this.$route.query.q || '',
            sortBy: this.$route.query.sort || 'Accuracy',
            books: [],
            isLoading: false,
            selectedBook: null
        };
    },
    computed: {
        isLoggedIn() {
            return store.currentUser !== null;
        }
    },
    async mounted() {
        if (this.searchQuery) {
            await this.performSearch();
        }
    },
    methods: {
        async performSearch() {
            this.isLoading = true;
            try {
                this.books = await bookAPI.searchAladin(this.searchQuery, 1, this.sortBy);
            } catch (error) {
                console.error('검색 오류:', error);
                alert('검색 중 오류가 발생했습니다.');
                this.books = [];
            } finally {
                this.isLoading = false;
            }
        },
        async changeSortBy(newSort) {
            this.sortBy = newSort;
            this.$router.push({ query: { q: this.searchQuery, sort: newSort } });
            await this.performSearch();
        },
        selectBook(book) {
            this.selectedBook = book;
        },
        startReview() {
            if (!this.isLoggedIn) {
                alert('로그인이 필요합니다.');
                this.$router.push('/login');
                return;
            }
            
            const bookId = this.selectedBook.isbn || this.selectedBook.id;
            
            if (store.hasReviewForBook(store.currentUser.id, bookId)) {
                alert('이미 감상문을 제출한 도서입니다.');
                return;
            }
            this.$router.push(`/review/${bookId}`);
        },
        startQuiz() {
            if (!this.isLoggedIn) {
                alert('로그인이 필요합니다.');
                this.$router.push('/login');
                return;
            }
            
            const bookId = this.selectedBook.isbn || this.selectedBook.id;
            
            if (store.hasQuizForBook(store.currentUser.id, bookId)) {
                alert('이미 퀴즈를 푼 책입니다.');
                return;
            }
            this.$router.push(`/quiz/${bookId}`);
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
