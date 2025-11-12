// 관리자 대시보드 컴포넌트
const AdminDashboard = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand">📚 관리자 페이지</div>
                    <div class="navbar-nav">
                        <router-link to="/admin" class="nav-link active">대시보드</router-link>
                        <router-link to="/admin/reviews" class="nav-link">감상문 관리</router-link>
                        <router-link to="/admin/books" class="nav-link">도서 관리</router-link>
                        <router-link to="/admin/rewards" class="nav-link">보상 관리</router-link>
                        <router-link to="/admin/stats" class="nav-link">통계</router-link>
                        <a href="#" @click.prevent="logout" class="nav-link">로그아웃</a>
                    </div>
                </div>
            </nav>
            <div class="container">
                <div class="dashboard">
                    <h2>관리자 대시보드 👨‍💼</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>{{ totalUsers }}</h3>
                            <p>총 사용자</p>
                        </div>
                        <div class="stat-card" @click="$router.push('/admin/reviews')">
                            <h3>{{ pendingReviews }}</h3>
                            <p>승인 대기 감상문</p>
                        </div>
                        <div class="stat-card" @click="$router.push('/admin/rewards')">
                            <h3>{{ pendingRewards }}</h3>
                            <p>보상 신청 대기</p>
                        </div>
                        <div class="stat-card">
                            <h3>{{ totalReviews }}</h3>
                            <p>전체 감상문</p>
                        </div>
                    </div>

                    <h3>최근 활동</h3>
                    <div class="card-grid">
                        <div class="card">
                            <h3>📝 승인 대기 감상문</h3>
                            <p>{{ pendingReviews }}개의 감상문이 승인을 기다리고 있습니다.</p>
                            <button @click="$router.push('/admin/reviews')" class="btn btn-sm">확인하기</button>
                        </div>
                        <div class="card">
                            <h3>🎁 보상 신청</h3>
                            <p>{{ pendingRewards }}개의 보상 신청이 처리를 기다리고 있습니다.</p>
                            <button @click="$router.push('/admin/rewards')" class="btn btn-sm">확인하기</button>
                        </div>
                        <div class="card">
                            <h3>📊 통계</h3>
                            <p>플랫폼 사용 통계를 확인하세요.</p>
                            <button @click="$router.push('/admin/stats')" class="btn btn-sm">보기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            totalUsers: store.getUsers().length,
            pendingReviews: store.getReviews().filter(r => r.status === 'pending').length,
            pendingRewards: store.getRewardRequests().filter(r => r.status === 'pending').length,
            totalReviews: store.getReviews().length
        };
    },
    methods: {
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
