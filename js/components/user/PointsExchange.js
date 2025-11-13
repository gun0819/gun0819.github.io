// 포인트 교환소 컴포넌트
const PointsExchange = {
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
                    <h2>포인트 교환소 💎</h2>
                    <div class="point-display">{{ currentPoints }} P</div>
                    
                    <h3>보상 신청</h3>
                    <div class="card-grid">
                        <div v-for="reward in rewards" :key="reward.id" class="card">
                            <h3>{{ reward.name }}</h3>
                            <p>{{ reward.description }}</p>
                            <p style="font-size: 24px; color: #667eea; font-weight: bold;">{{ reward.points }} P</p>
                            <button @click="requestReward(reward)" 
                                    :disabled="currentPoints < reward.points" 
                                    class="btn btn-sm">
                                {{ currentPoints >= reward.points ? '신청하기' : '포인트 부족' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            currentPoints: store.getUserPoints(store.currentUser.email),
            rewards: [
                { id: 1, name: '스타벅스 아메리카노', description: '따뜻한 커피 한 잔', points: 100 },
                { id: 2, name: '교보문고 도서상품권', description: '5,000원 상품권', points: 200 },
                { id: 3, name: '영화 관람권', description: 'CGV 영화 관람권', points: 300 },
                { id: 4, name: '교보문고 도서상품권', description: '10,000원 상품권', points: 400 }
            ]
        };
    },
    methods: {
        requestReward(reward) {
            if (confirm(`${reward.name}을(를) ${reward.points} 포인트로 신청하시겠습니까?`)) {
                store.addUserPoints(store.currentUser.email, -reward.points, `보상 신청: ${reward.name}`);
                this.currentPoints = store.getUserPoints(store.currentUser.email);
                
                const request = {
                    id: Date.now(),
                    userId: store.currentUser.id,
                    userName: store.currentUser.name,
                    userNickname: store.currentUser.nickname,
                    userEmail: store.currentUser.email,
                    reward: reward,
                    pointsSpent: reward.points,
                    status: 'pending',
                    date: new Date().toLocaleDateString()
                };
                
                store.addRewardRequest(request);
                alert('보상이 신청되었습니다! 관리자 확인 후 지급됩니다.');
                this.$router.push('/points-requests');
            }
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
