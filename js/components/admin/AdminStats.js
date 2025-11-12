// 관리자 통계 컴포넌트
const AdminStats = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand">📚 관리자 페이지</div>
                    <div class="navbar-nav">
                        <router-link to="/admin" class="nav-link">대시보드</router-link>
                        <router-link to="/admin/reviews" class="nav-link">감상문 관리</router-link>
                        <router-link to="/admin/books" class="nav-link">도서 관리</router-link>
                        <router-link to="/admin/rewards" class="nav-link">보상 관리</router-link>
                        <router-link to="/admin/stats" class="nav-link active">통계</router-link>
                        <a href="#" @click.prevent="logout" class="nav-link">로그아웃</a>
                    </div>
                </div>
            </nav>
            <div class="container">
                <div class="dashboard">
                    <h2>통계 및 리포트 📊</h2>
                    
                    <h3>플랫폼 현황</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>{{ totalUsers }}</h3>
                            <p>총 사용자</p>
                        </div>
                        <div class="stat-card">
                            <h3>{{ totalReviews }}</h3>
                            <p>전체 감상문</p>
                        </div>
                        <div class="stat-card">
                            <h3>{{ totalQuizzes }}</h3>
                            <p>퀴즈 응시 수</p>
                        </div>
                        <div class="stat-card">
                            <h3>{{ totalPoints }}</h3>
                            <p>총 지급 포인트</p>
                        </div>
                    </div>

                    <h3>승인 현황</h3>
                    <div class="card-grid">
                        <div class="card">
                            <h3>감상문 승인률</h3>
                            <p style="font-size: 36px; color: #667eea; font-weight: bold;">{{ approvalRate }}%</p>
                            <p>승인: {{ approvedReviews }}개 / 전체: {{ totalReviews }}개</p>
                        </div>
                        <div class="card">
                            <h3>퀴즈 통과율</h3>
                            <p style="font-size: 36px; color: #4caf50; font-weight: bold;">{{ quizPassRate }}%</p>
                            <p>통과: {{ passedQuizzes }}개 / 전체: {{ totalQuizzes }}개</p>
                        </div>
                        <div class="card">
                            <h3>보상 신청</h3>
                            <p style="font-size: 36px; color: #ffc107; font-weight: bold;">{{ totalRewards }}개</p>
                            <p>승인: {{ approvedRewards }}개 / 대기: {{ pendingRewards }}개</p>
                        </div>
                    </div>

                    <h3>사용자별 통계</h3>
                    <div v-if="userStats.length > 0" class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>사용자</th>
                                    <th>감상문</th>
                                    <th>퀴즈</th>
                                    <th>포인트</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="stat in userStats" :key="stat.id">
                                    <td>{{ stat.nickname }}</td>
                                    <td>{{ stat.reviewCount }}개</td>
                                    <td>{{ stat.quizCount }}개</td>
                                    <td><strong>{{ stat.points }} P</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        const reviews = store.getReviews();
        const quizzes = store.getQuizResults();
        const rewards = store.getRewardRequests();
        const users = store.getUsers().filter(u => u.type === 'user');
        const points = storage.get(CONFIG.STORAGE_KEYS.USER_POINTS) || {};
        
        return {
            totalUsers: users.length,
            totalReviews: reviews.length,
            approvedReviews: reviews.filter(r => r.status === 'approved').length,
            totalQuizzes: quizzes.length,
            passedQuizzes: quizzes.filter(q => q.isPassed).length,
            totalRewards: rewards.length,
            approvedRewards: rewards.filter(r => r.status === 'approved').length,
            pendingRewards: rewards.filter(r => r.status === 'pending').length,
            totalPoints: Object.values(points).reduce((a, b) => a + b, 0),
            userStats: users.map(user => ({
                id: user.id,
                nickname: user.nickname,
                reviewCount: reviews.filter(r => r.userId === user.id).length,
                quizCount: quizzes.filter(q => q.userId === user.id).length,
                points: points[user.email] || 0
            }))
        };
    },
    computed: {
        approvalRate() {
            return this.totalReviews > 0 
                ? Math.round((this.approvedReviews / this.totalReviews) * 100) 
                : 0;
        },
        quizPassRate() {
            return this.totalQuizzes > 0 
                ? Math.round((this.passedQuizzes / this.totalQuizzes) * 100) 
                : 0;
        }
    },
    methods: {
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
