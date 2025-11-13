// 포인트 적립 내역 컴포넌트
const PointsHistory = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand" @click="$router.push('/dashboard')" style="cursor: pointer;">
                        📚 독서 인증 플랫폼
                    </div>
                    <div class="navbar-nav">
                        <router-link to="/my-reviews" class="nav-link">내 감상문</router-link>
                        <router-link to="/completed-quizzes" class="nav-link">내 퀴즈</router-link>
                        <div class="dropdown">
                            <a class="nav-link active">포인트 ▼</a>
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
            <div class="container">
                <div class="dashboard">
                    <h2>포인트 적립 내역 📊</h2>
                    <div class="point-display">현재 포인트: {{ currentPoints }} P</div>
                    
                    <div v-if="myHistory.length > 0" class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>날짜</th>
                                    <th>시간</th>
                                    <th>내용</th>
                                    <th>포인트</th>
                                    <th>잔액</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="history in myHistory" :key="history.id">
                                    <td>{{ history.date }}</td>
                                    <td>{{ history.time }}</td>
                                    <td>{{ history.reason }}</td>
                                    <td>
                                        <strong :style="{color: history.amount > 0 ? '#28a745' : '#dc3545'}">
                                            {{ history.amount > 0 ? '+' : '' }}{{ history.amount }} P
                                        </strong>
                                    </td>
                                    <td>{{ history.balance }} P</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else style="text-align: center; padding: 40px; color: #666;">
                        <p>아직 포인트 적립 내역이 없습니다.</p>
                        <button @click="$router.push('/dashboard')" class="btn btn-sm" style="margin-top: 20px;">포인트 모으러 가기</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    computed: {
        myHistory() {
            return store.getPointHistory()
                .filter(h => h.userId === store.currentUser.id)
                .sort((a, b) => b.id - a.id);
        },
        currentPoints() {
            return store.getUserPoints(store.currentUser.email);
        }
    },
    methods: {
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
