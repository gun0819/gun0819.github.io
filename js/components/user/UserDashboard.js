// 사용자 대시보드 (메인 UI)
const UserDashboard = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-content">
                        <div class="navbar-left">
                            <div class="navbar-brand" @click="$router.push('/dashboard')" style="cursor: pointer;">
                                📚 독서 인증 플랫폼
                            </div>
                            
                            <!-- 통합 검색바 (위치 조정) -->
                            <div class="navbar-search" style="margin-right: auto;">
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
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <!-- 시간 필터 -->
                            <div class="bestseller-filters">
                                <button :class="['filter-btn', {active: currentTimeFilter === 'bestseller'}]" 
                                        @click="changeTimeFilter('bestseller')">올해 인기순</button>
                                <button :class="['filter-btn', {active: currentTimeFilter === 'month'}]" 
                                        @click="changeTimeFilter('month')">이번달 인기순</button>
                            </div>
                            <!-- 분야 필터 -->
                            <div class="bestseller-filters">
                                <button :class="['filter-btn', {active: currentCategoryFilter === 'all'}]" 
                                        @click="changeCategoryFilter('all')">전체</button>
                                <button :class="['filter-btn', {active: currentCategoryFilter === '소설'}]" 
                                        @click="changeCategoryFilter('소설')">소설</button>
                                <button :class="['filter-btn', {active: currentCategoryFilter === '경제'}]" 
                                        @click="changeCategoryFilter('경제')">경제</button>
                                <button :class="['filter-btn', {active: currentCategoryFilter === '자기계발'}]" 
                                        @click="changeCategoryFilter('자기계발')">자기계발</button>
                                <button :class="['filter-btn', {active: currentCategoryFilter === '에세이'}]" 
                                        @click="changeCategoryFilter('에세이')">에세이</button>
                            </div>
                        </div>
                    </div>
                    
                    <div v-if="isLoadingBestseller" class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>도서 목록을 불러오는 중...</p>
                    </div>
                    
                    <div v-else-if="displayedBooks.length > 0" class="bestseller-slider" 
                         @wheel="handleWheel" 
                         ref="sliderContainer"
                         style="position: relative; overflow: hidden; padding: 20px 0;">
                        <div class="slider-nav prev" @click="prevSlide">‹</div>
                        <div class="bestseller-track" :style="{transform: 'translateX(' + slideOffset + 'px)'}">
                            <div v-for="(book, index) in displayedBooks" :key="book.id" class="book-card" @click="goToBookDetail(book)">
                                <div style="position: relative;">
                                    <img v-if="book.cover" :src="book.cover" :alt="book.title" class="book-card-cover">
                                    <div v-else class="book-card-cover" style="display: flex; align-items: center; justify-content: center; font-size: 48px; background: #f5f5f5;">📚</div>
                                    <div class="book-card-rank">{{ index + 1 }}</div>
                                </div>
                                <div class="book-card-title">{{ book.title }}</div>
                                <div class="book-card-author">{{ book.author }}</div>
                            </div>
                        </div>
                        <div class="slider-nav next" @click="nextSlide">›</div>
                    </div>
                    
                    <div v-else style="text-align: center; padding: 40px; color: #666;">
                        <p>해당 분야의 도서가 없습니다.</p>
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
            
            headerSearchQuery: '',
            
            currentTimeFilter: 'bestseller',
            currentCategoryFilter: 'all',
            allBooks: [],  // 전체 책 목록
            categoryBooks: {},  // 분야별 책 목록 {소설: [...], 경제: [...]}
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
            const timeName = this.currentTimeFilter === 'bestseller' ? '올해 인기 도서' : '이번달 인기 도서';
            const categoryName = this.currentCategoryFilter === 'all' ? '' : ` - ${this.currentCategoryFilter}`;
            return timeName + categoryName;
        },
        displayedBooks() {
            if (this.currentCategoryFilter === 'all') {
                return this.allBooks.slice(0, 50);
            }
            return this.categoryBooks[this.currentCategoryFilter] || [];
        }
    },
    async mounted() {
        await this.loadBestsellers();
        this.startAutoSlide();
    },
    beforeUnmount() {
        this.stopAutoSlide();
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
        goToBookDetail(book) {
            const bookId = book.isbn || book.id;
            this.$router.push(`/book/${bookId}`);
        },
        async changeTimeFilter(filter) {
            this.currentTimeFilter = filter;
            this.slideIndex = 0;
            this.slideOffset = 0;
            await this.loadBestsellers();
        },
        async changeCategoryFilter(filter) {
            this.currentCategoryFilter = filter;
            this.slideIndex = 0;
            this.slideOffset = 0;
        },
        async loadBestsellers() {
            this.isLoadingBestseller = true;
            try {
                let books = [];
                if (this.currentTimeFilter === 'bestseller') {
                    books = await bookAPI.getBestseller('Bestseller');
                } else if (this.currentTimeFilter === 'month') {
                    books = await bookAPI.getBestseller('ItemNewSpecial');
                }
                
                this.allBooks = books;
                
                // 분야별로 책 분류 (각 분야별로 1-50위)
                const categories = ['소설', '경제', '자기계발', '에세이'];
                this.categoryBooks = {};
                
                categories.forEach(category => {
                    const filtered = books.filter(book => {
                        if (!book.genre) return false;
                        return book.genre.includes(category);
                    }).slice(0, 50);  // 각 분야별로 최대 50권
                    
                    this.categoryBooks[category] = filtered;
                });
                
            } catch (error) {
                console.error('베스트셀러 로드 에러:', error);
                this.allBooks = [];
                this.categoryBooks = {};
            } finally {
                this.isLoadingBestseller = false;
            }
        },
        handleWheel(event) {
            event.preventDefault();
            const delta = event.deltaY;
            
            if (delta < 0) {
                this.prevSlide();
            } else if (delta > 0) {
                this.nextSlide();
            }
        },
        prevSlide() {
            const maxBooks = this.displayedBooks.length;
            if (maxBooks === 0) return;
            
            if (this.slideIndex <= 0) {
                this.slideIndex = Math.max(0, maxBooks - 5);
            } else {
                this.slideIndex--;
            }
            this.slideOffset = -this.slideIndex * 200;
        },
        nextSlide() {
            const maxBooks = this.displayedBooks.length;
            if (maxBooks === 0) return;
            
            const maxSlides = Math.max(0, maxBooks - 5);
            
            if (this.slideIndex >= maxSlides) {
                this.slideIndex = 0;
            } else {
                this.slideIndex++;
            }
            this.slideOffset = -this.slideIndex * 200;
        },
        startAutoSlide() {
            this.autoSlideInterval = setInterval(() => {
                this.nextSlide();
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
