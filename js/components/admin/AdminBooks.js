// 관리자 도서 관리 컴포넌트
const AdminBooks = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand">📚 관리자 페이지</div>
                    <div class="navbar-nav">
                        <router-link to="/admin" class="nav-link">대시보드</router-link>
                        <router-link to="/admin/reviews" class="nav-link">감상문 관리</router-link>
                        <router-link to="/admin/books" class="nav-link active">도서 관리</router-link>
                        <router-link to="/admin/rewards" class="nav-link">보상 관리</router-link>
                        <router-link to="/admin/stats" class="nav-link">통계</router-link>
                        <a href="#" @click.prevent="logout" class="nav-link">로그아웃</a>
                    </div>
                </div>
            </nav>
            <div class="container">
                <div class="dashboard">
                    <h2>도서 관리 📚</h2>
                    <div class="alert-box info">
                        <strong>알림:</strong> 이 플랫폼은 알라딘 API를 사용하여 실시간으로 도서 정보를 가져옵니다.
                        별도의 도서 등록이 필요하지 않습니다.
                    </div>
                    <div class="card-grid">
                        <div class="card">
                            <h3>📖 도서 검색</h3>
                            <p>사용자들은 알라딘 API를 통해 실시간으로 도서를 검색할 수 있습니다.</p>
                        </div>
                        <div class="card">
                            <h3>🎯 퀴즈 관리</h3>
                            <p>현재 등록된 퀴즈: {{ quizCount }}개</p>
                            <p style="font-size: 12px; color: #666;">퀴즈는 store.js의 quizzes 배열에서 관리됩니다.</p>
                        </div>
                        <div class="card">
                            <h3>📊 감상문 통계</h3>
                            <p>전체 감상문: {{ reviewCount }}개</p>
                            <p>승인된 감상문: {{ approvedCount }}개</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            quizCount: store.quizzes.length,
            reviewCount: store.getReviews().length,
            approvedCount: store.getReviews().filter(r => r.status === 'approved').length
        };
    },
    methods: {
        logout() {
            store.clearCurrentUser();
            // 즉시 UI 업데이트를 위해 페이지 새로고침
            window.location.href = '/#/dashboard';
        }
    }
};
