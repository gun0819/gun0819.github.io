// 사용자 대시보드 (메인 UI)
const UserDashboard = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand">📚 독서 인증 플랫폼</div>
                    <div class="navbar-nav">
                        <router-link to="/dashboard" class="nav-link active">홈</router-link>
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
            
            <div class="main-search-container">
                <div class="main-search-box">
                    <input v-model="searchQuery" 
                           class="main-search-input"
                           placeholder="책 제목을 검색하세요..." 
                           @input="onSearchInput"
                           @keyup.enter="searchBooks"
                           @focus="showAutocomplete = true">
                    
                    <div v-if="showAutocomplete && searchQuery.length > 0" 
                         class="autocomplete-dropdown">
                        <div v-if="isAutocompleteLoading" class="autocomplete-loading">검색 중...</div>
                        <div v-else-if="autocompleteResults.length > 0">
                            <div v-for="book in autocompleteResults" 
                                 :key="book.id" 
                                 class="autocomplete-item"
                                 @click="selectBook(book)">
                                <img v-if="book.cover" :src="book.cover" :alt="book.title">
                                <div v-else style="width: 50px; height: 70px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center;">📚</div>
                                <div class="autocomplete-item-content">
                                    <div class="autocomplete-item-title">{{ book.title }}</div>
                                    <div class="autocomplete-item-author">{{ book.author }} · {{ book.publisher }}</div>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="!isAutocompleteLoading" class="autocomplete-no-results">검색 결과가 없습니다</div>
                    </div>
                    
                    <button class="main-search-button" @click="searchBooks" :disabled="isLoading">
                        {{ isLoading ? '검색 중...' : '검색' }}
                    </button>
                </div>
            </div>
            
            <div class="container">
                <div class="stats-grid">
                    <div class="stat-card" @click="$router.push('/my-reviews')">
                        <h3>{{ reviewCount }}</h3>
                        <p>작성한 감상문</p>
                    </div>
                    <div class="stat-card" @click="$router.push('/completed-quizzes')">
                        <h3>{{ quizCount }}</h3>
                        <p>완료한 퀴즈</p>
                    </div>
                    <div class="stat-card" @click="$router.push('/points-exchange')">
                        <h3>{{ user.points }}</h3>
                        <p>보유 포인트</p>
                    </div>
                </div>

                <div class="bestseller-section">
                    <div class="bestseller-header">
                        <h3>{{ currentFilterName }}</h3>
                        <div class="bestseller-filters">
                            <button :class="['filter-btn', {active: currentFilter === 'bestseller'}]" 
                                    @click="changeFilter('bestseller')">올해 인기 순</button>
                            <button :class="['filter-btn', {active: currentFilter === 'month'}]" 
                                    @click="changeFilter('month')">이번달 인기 순</button>
                            <button :class="['filter-btn', {active: currentFilter === 'review-year'}]" 
                                    @click="changeFilter('review-year')">올해 감상문 많은 순</button>
                            <button :class="['filter-btn', {active: currentFilter === 'review-month'}]" 
                                    @click="changeFilter('review-month')">이번달 감상문 많은 순</button>
                        </div>
                    </div>
                    
                    <div v-if="isLoadingBestseller" class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>도서 목록을 불러오는 중...</p>
                    </div>
                    
                    <div v-else-if="currentBooks.length > 0" class="bestseller-slider">
                        <div class="slider-nav prev" @click="prevSlide">‹</div>
                        <div class="bestseller-track" :style="{transform: 'translateX(' + slideOffset + 'px)'}">
                            <div v-for="book in currentBooks" :key="book.id" class="book-card" @click="selectBook(book)">
                                <div style="position: relative;">
                                    <img v-if="book.cover" :src="book.cover" :alt="book.title" class="book-card-cover">
                                    <div v-else class="book-card-cover" style="display: flex; align-items: center; justify-content: center; font-size: 48px;">📚</div>
                                    <div v-if="book.rank" class="book-card-rank">{{ book.rank }}</div>
                                </div>
                                <div class="book-card-title">{{ book.title }}</div>
                                <div class="book-card-author">{{ book.author }}</div>
                            </div>
                        </div>
                        <div class="slider-nav next" @click="nextSlide">›</div>
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
                    <p v-if="selectedBook.description" style="margin-top: 16px; color: #666; font-size: 14px;">
                        {{ selectedBook.description.substring(0, 150) }}...
                    </p>
                    <div class="modal-actions">
                        <button @click="startReview" class="btn btn-sm">감상문 작성</button>
                        <button @click="startQuiz" class="btn btn-sm">퀴즈 풀기</button>
                        <button @click="selectedBook = null" class="btn btn-sm btn-secondary">닫기</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            user: store.currentUser,
            reviewCount: store.getReviews().filter(r => r.userId === store.currentUser.id).length,
            quizCount: store.getQuizResults().filter(q => q.userId === store.currentUser.id).length,
            
            searchQuery: '',
            showAutocomplete: false,
            autocompleteResults: [],
            isAutocompleteLoading: false,
            autocompleteTimeout: null,
            isLoading: false,
            selectedBook: null,
            
            currentFilter: 'bestseller',
            currentBooks: [],
            isLoadingBestseller: false,
            slideOffset: 0,
            slideIndex: 0,
            autoSlideInterval: null
        };
    },
    computed: {
        currentFilterName() {
            const names = {
                'bestseller': '올해 인기 도서',
                'month': '이번달 인기 도서',
                'review-year': '올해 감상문이 많은 도서',
                'review-month': '이번달 감상문이 많은 도서'
            };
            return names[this.currentFilter] || '도서 목록';
        }
    },
    async mounted() {
        document.addEventListener('click', this.handleClickOutside);
        await this.loadBestsellers();
        this.startAutoSlide();
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        if (this.autocompleteTimeout) {
            clearTimeout(this.autocompleteTimeout);
        }
        this.stopAutoSlide();
    },
    methods: {
        handleClickOutside(event) {
            const searchBox = event.target.closest('.main-search-box');
            if (!searchBox) {
                this.showAutocomplete = false;
            }
        },
        
        onSearchInput() {
            if (this.searchQuery.length === 0) {
                this.showAutocomplete = false;
                this.autocompleteResults = [];
                return;
            }

            this.showAutocomplete = true;
            
            if (this.autocompleteTimeout) {
                clearTimeout(this.autocompleteTimeout);
            }

            this.autocompleteTimeout = setTimeout(() => {
                this.fetchAutocomplete();
            }, 300);
        },
        
        async fetchAutocomplete() {
            if (!this.searchQuery.trim()) {
                this.autocompleteResults = [];
                return;
            }

            this.isAutocompleteLoading = true;

            try {
                const results = await bookAPI.searchAladin(this.searchQuery);
                this.autocompleteResults = results.slice(0, 5);
            } catch (error) {
                console.error('자동완성 에러:', error);
                this.autocompleteResults = [];
            } finally {
                this.isAutocompleteLoading = false;
            }
        },
        
        async searchBooks() {
            this.showAutocomplete = false;

            if (!this.searchQuery.trim()) {
                return;
            }

            this.isLoading = true;

            try {
                const results = await bookAPI.searchAladin(this.searchQuery);
                if (results.length > 0) {
                    this.selectBook(results[0]);
                } else {
                    alert('검색 결과가 없습니다.');
                }
            } catch (error) {
                console.error('검색 에러:', error);
                alert('도서 검색 중 오류가 발생했습니다.');
            } finally {
                this.isLoading = false;
            }
        },
        
        selectBook(book) {
            this.selectedBook = book;
            this.showAutocomplete = false;
        },
        
        startReview() {
            const bookId = this.selectedBook.isbn || this.selectedBook.id;
            
            if (store.hasReviewForBook(store.currentUser.id, bookId)) {
                alert('이미 감상문을 제출한 도서입니다.');
                return;
            }
            this.$router.push(`/review/${bookId}`);
        },
        
        startQuiz() {
            const bookId = this.selectedBook.isbn || this.selectedBook.id;
            
            if (store.hasQuizForBook(store.currentUser.id, bookId)) {
                alert('이미 퀴즈를 푼 책입니다.');
                return;
            }
            this.$router.push(`/quiz/${bookId}`);
        },
        
        async changeFilter(filter) {
            this.currentFilter = filter;
            this.slideIndex = 0;
            this.slideOffset = 0;
            await this.loadBestsellers();
        },
        
        async loadBestsellers() {
            this.isLoadingBestseller = true;
            
            try {
                if (this.currentFilter === 'bestseller') {
                    this.currentBooks = await bookAPI.getBestseller('Bestseller');
                } else if (this.currentFilter === 'month') {
                    this.currentBooks = await bookAPI.getBestseller('ItemNewSpecial');
                } else if (this.currentFilter === 'review-year' || this.currentFilter === 'review-month') {
                    const allBooks = await bookAPI.getBestseller('Bestseller');
                    const reviews = store.getReviews();
                    
                    const now = new Date();
                    const startOfYear = new Date(now.getFullYear(), 0, 1);
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    
                    const bookReviewCounts = {};
                    
                    reviews.forEach(review => {
                        const reviewDate = new Date(review.date);
                        const bookIsbn = review.book?.isbn || review.bookId;
                        
                        let shouldCount = false;
                        if (this.currentFilter === 'review-year') {
                            shouldCount = reviewDate >= startOfYear;
                        } else {
                            shouldCount = reviewDate >= startOfMonth;
                        }
                        
                        if (shouldCount && bookIsbn) {
                            bookReviewCounts[bookIsbn] = (bookReviewCounts[bookIsbn] || 0) + 1;
                        }
                    });
                    
                    allBooks.forEach(book => {
                        book.reviewCount = bookReviewCounts[book.isbn] || 0;
                    });
                    
                    this.currentBooks = allBooks
                        .sort((a, b) => b.reviewCount - a.reviewCount)
                        .map((book, index) => ({ ...book, rank: index + 1 }));
                }
            } catch (error) {
                console.error('베스트셀러 로드 에러:', error);
                this.currentBooks = [];
            } finally {
                this.isLoadingBestseller = false;
            }
        },
        
        prevSlide() {
            if (this.slideIndex > 0) {
                this.slideIndex--;
                this.slideOffset = -this.slideIndex * 200;
            }
        },
        
        nextSlide() {
            const maxSlides = Math.max(0, this.currentBooks.length - 5);
            if (this.slideIndex < maxSlides) {
                this.slideIndex++;
                this.slideOffset = -this.slideIndex * 200;
            }
        },
        
        startAutoSlide() {
            this.autoSlideInterval = setInterval(() => {
                const maxSlides = Math.max(0, this.currentBooks.length - 5);
                if (this.slideIndex < maxSlides) {
                    this.nextSlide();
                } else {
                    this.slideIndex = 0;
                    this.slideOffset = 0;
                }
            }, 3000);
        },
        
        stopAutoSlide() {
            if (this.autoSlideInterval) {
                clearInterval(this.autoSlideInterval);
            }
        },
        
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
