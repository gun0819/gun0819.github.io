// 사용자 대시보드 (메인 UI)
const UserDashboard = {
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
                        <router-link v-if="!isLoggedIn" to="/signup" class="nav-link">회원가입</router-link>
                        <router-link v-if="!isLoggedIn" to="/login" class="nav-link">로그인</router-link>
                        <a v-if="isLoggedIn" href="#" @click.prevent="logout" class="nav-link">로그아웃</a>
                    </div>
                </div>
            </nav>
            
            <div class="top-search-bar">
                <div class="top-search-container">
                    <div class="top-search-box">
                        <div class="form-group" style="margin: 0; position: relative; flex: 1;">
                            <input v-model="searchQuery" 
                                   class="top-search-input"
                                   placeholder="도서명 또는 저자를 입력하세요..." 
                                   @input="onSearchInput"
                                   @keyup.enter="searchBooks"
                                   @focus="showAutocomplete = true">
                            
                            <!-- 자동완성 드롭다운 -->
                            <div v-if="showAutocomplete && autocompleteResults.length > 0" 
                                 class="autocomplete-dropdown">
                                <div v-if="isAutocompleteLoading" class="autocomplete-loading">
                                    검색 중...
                                </div>
                                <div v-else>
                                    <div v-for="book in autocompleteResults" 
                                         :key="book.id" 
                                         class="autocomplete-item"
                                         @click="selectAutocompleteBook(book)">
                                        <img v-if="book.cover" :src="book.cover" :alt="book.title">
                                        <div v-else style="width: 50px; height: 70px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📚</div>
                                        <div class="autocomplete-item-content">
                                            <div class="autocomplete-item-title">{{ book.title }}</div>
                                            <div class="autocomplete-item-author">{{ book.author }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="showAutocomplete && !isAutocompleteLoading && searchQuery.length >= 2 && autocompleteResults.length === 0" 
                                 class="autocomplete-dropdown">
                                <div class="autocomplete-no-results">검색 결과가 없습니다</div>
                            </div>
                        </div>
                        
                        <button class="top-search-button" @click="searchBooks" :disabled="isLoading">
                            {{ isLoading ? '검색 중...' : '검색' }}
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="container">
                <div v-if="isLoggedIn" class="stats-grid">
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
                                    <div v-else class="book-card-cover" style="display: flex; align-items: center; justify-content: center; font-size: 48px; background: #f5f5f5;">📚</div>
                                    <div v-if="book.rank" class="book-card-rank">{{ book.rank }}</div>
                                </div>
                                <div class="book-card-title">{{ book.title }}</div>
                                <div class="book-card-author">{{ book.author }}</div>
                            </div>
                        </div>
                        <div class="slider-nav next" @click="nextSlide">›</div>
                    </div>
                    
                    <div v-else style="text-align: center; padding: 40px; color: #666;">
                        <p>도서 목록을 불러올 수 없습니다.</p>
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
            user: store.currentUser || { points: 0 },
            reviewCount: store.currentUser ? store.getReviews().filter(r => r.userId === store.currentUser.id).length : 0,
            quizCount: store.currentUser ? store.getQuizResults().filter(q => q.userId === store.currentUser.id).length : 0,
            
            searchQuery: '',
            isLoading: false,
            selectedBook: null,
            
            // 자동완성 관련
            showAutocomplete: false,
            autocompleteResults: [],
            isAutocompleteLoading: false,
            autocompleteTimeout: null,
            
            currentFilter: 'bestseller',
            currentBooks: [],
            isLoadingBestseller: false,
            slideOffset: 0,
            slideIndex: 0,
            autoSlideInterval: null
        };
    },
    computed: {
        isLoggedIn() {
            return store.currentUser !== null;
        },
        currentFilterName() {
            const names = {
                'bestseller': '올해 인기 도서',
                'month': '이번달 인기 도서'
            };
            return names[this.currentFilter] || '도서 목록';
        }
    },
    async mounted() {
        await this.loadBestsellers();
        this.startAutoSlide();
        
        // 외부 클릭 시 자동완성 닫기
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        this.stopAutoSlide();
        document.removeEventListener('click', this.handleClickOutside);
        if (this.autocompleteTimeout) {
            clearTimeout(this.autocompleteTimeout);
        }
    },
    methods: {
        handleClickOutside(event) {
            const searchBox = event.target.closest('.top-search-box');
            if (!searchBox) {
                this.showAutocomplete = false;
            }
        },
        onSearchInput() {
            // 입력값이 2글자 미만이면 자동완성 숨김
            if (this.searchQuery.length < 2) {
                this.showAutocomplete = false;
                this.autocompleteResults = [];
                return;
            }
            
            // 이전 타이머 취소
            if (this.autocompleteTimeout) {
                clearTimeout(this.autocompleteTimeout);
            }
            
            // 500ms 후에 검색 (debounce)
            this.autocompleteTimeout = setTimeout(async () => {
                await this.loadAutocomplete();
            }, 500);
        },
        async loadAutocomplete() {
            if (this.searchQuery.length < 2) return;
            
            this.isAutocompleteLoading = true;
            this.showAutocomplete = true;
            
            try {
                // 정확도순으로 최대 10개 결과만 가져오기
                const results = await bookAPI.searchAladin(this.searchQuery, 1, 'Accuracy');
                this.autocompleteResults = results.slice(0, 10);
            } catch (error) {
                console.error('자동완성 검색 오류:', error);
                this.autocompleteResults = [];
            } finally {
                this.isAutocompleteLoading = false;
            }
        },
        selectAutocompleteBook(book) {
            this.selectedBook = book;
            this.showAutocomplete = false;
            this.searchQuery = book.title;
        },
        searchBooks() {
            if (!this.searchQuery.trim()) {
                alert('검색어를 입력해주세요.');
                return;
            }
            this.showAutocomplete = false;
            this.$router.push({
                path: '/search',
                query: { q: this.searchQuery }
            });
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
            this.$router.push('/dashboard');
        }
    }
};
