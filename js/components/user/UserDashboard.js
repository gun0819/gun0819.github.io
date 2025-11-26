// 사용자 대시보드 (메인 UI) - 카테고리별 베스트셀러
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
                    
                    <div v-else-if="currentBooks.length > 0" class="bestseller-slider" 
                         @wheel="handleWheel" 
                         ref="sliderContainer"
                         style="position: relative; overflow: hidden; padding: 20px 0;">
                        <div class="slider-nav prev" @click="prevSlide">‹</div>
                        <div class="bestseller-track" :style="{transform: 'translateX(' + slideOffset + 'px)'}">
                            <div v-for="book in currentBooks" :key="book.id" class="book-card" @click="goToBookDetail(book)">
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
            const timeName = this.currentTimeFilter === 'bestseller' ? '올해 인기 도서' : '이번달 인기 도서';
            const categoryName = this.currentCategoryFilter === 'all' ? '' : ` - ${this.currentCategoryFilter}`;
            return timeName + categoryName;
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
            await this.loadBestsellers();
        },
        async loadBestsellers() {
            this.isLoadingBestseller = true;
            try {
                // 카테고리 ID 매핑
                let categoryId = null;
                if (this.currentCategoryFilter === '소설') {
                    categoryId = 1;
                } else if (this.currentCategoryFilter === '경제') {
                    categoryId = 170;
                } else if (this.currentCategoryFilter === '자기계발') {
                    categoryId = 336;
                } else if (this.currentCategoryFilter === '에세이') {
                    categoryId = 55890;
                }
                
                // 시간 필터에 따라 QueryType 결정
                if (this.currentTimeFilter === 'bestseller') {
                    this.currentBooks = await bookAPI.getBestseller('Bestseller', categoryId);
                } else if (this.currentTimeFilter === 'month') {
                    this.currentBooks = await bookAPI.getBestseller('ItemNewSpecial', categoryId);
                }
            } catch (error) {
                console.error('베스트셀러 로드 에러:', error);
                this.currentBooks = [];
            } finally {
                this.isLoadingBestseller = false;
            }
        },
        handleWheel(event) {
            event.preventDefault();
            const delta = event.deltaY;
            
            if (delta < 0) {
                // 위로 스크롤 = 이전 슬라이드 (랭킹 높은 곳으로)
                this.prevSlide();
            } else if (delta > 0) {
                // 아래로 스크롤 = 다음 슬라이드 (랭킹 낮은 곳으로)
                this.nextSlide();
            }
        },
        prevSlide() {
            const maxBooks = this.currentBooks.length;
            if (maxBooks === 0) return;
            
            // 순환: 0번째에서 뒤로가면 마지막으로
            if (this.slideIndex <= 0) {
                this.slideIndex = Math.max(0, maxBooks - 5);
            } else {
                this.slideIndex--;
            }
            this.slideOffset = -this.slideIndex * 200;
        },
        nextSlide() {
            const maxBooks = this.currentBooks.length;
            if (maxBooks === 0) return;
            
            const maxSlides = Math.max(0, maxBooks - 5);
            
            // 순환: 마지막에서 앞으로가면 처음으로
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
