// 포인트 교환소 컴포넌트 (이미지 추가)
const PointsExchange = {
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
                    <h2>포인트 교환소 💎</h2>
                    <div class="point-display">{{ currentPoints }} P</div>
                    
                    <!-- 월별 한도 안내 -->
                    <div class="alert-box info" style="margin-bottom: 30px;">
                        <strong>📌 월별 포인트 한도 안내</strong><br>
                        • 활동 포인트 (감상문 + 퀴즈): {{ monthlyActivity }} / 10,000P<br>
                        • 공감 포인트: {{ monthlyLikes }} / 10,000P<br>
                        • 이번 달 남은 활동 포인트: {{ remainingActivity }}P<br>
                        • 이번 달 남은 공감 포인트: {{ remainingLikes }}P
                    </div>
                    
                    <h3>보상 신청</h3>
                    <div class="reward-grid">
                        <div v-for="reward in rewards" :key="reward.id" class="reward-card">
                            <div class="reward-content">
                                <div class="reward-info">
                                    <h3>{{ reward.name }}</h3>
                                    <p>{{ reward.description }}</p>
                                    <p class="reward-price">{{ reward.points.toLocaleString() }} P</p>
                                    <button @click="requestReward(reward)" 
                                            :disabled="currentPoints < reward.points" 
                                            class="btn btn-sm">
                                        {{ currentPoints >= reward.points ? '신청하기' : '포인트 부족' }}
                                    </button>
                                </div>
                                <div class="reward-image">
                                    <div v-if="reward.emoji" class="reward-emoji">{{ reward.emoji }}</div>
                                    <img v-else-if="reward.image" :src="reward.image" :alt="reward.name">
                                </div>
                            </div>
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
                { 
                    id: 1, 
                    name: '스타벅스 아메리카노', 
                    description: '따뜻한 커피 한 잔', 
                    points: 4500,
                    emoji: '☕',
                    image: 'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[9200000002487]_20210426091745467.jpg'
                },
                { 
                    id: 2, 
                    name: '교보문고 도서상품권 5,000원', 
                    description: '5,000원 상품권', 
                    points: 5000,
                    emoji: '📚',
                    image: 'https://contents.kyobobook.co.kr/resources/fo/images/common/ink/img_giftcard_01.png'
                },
                { 
                    id: 3, 
                    name: '교보문고 도서상품권 10,000원', 
                    description: '10,000원 상품권', 
                    points: 10000,
                    emoji: '📚',
                    image: 'https://contents.kyobobook.co.kr/resources/fo/images/common/ink/img_giftcard_01.png'
                },
                { 
                    id: 4, 
                    name: '교보문고 도서상품권 20,000원', 
                    description: '20,000원 상품권', 
                    points: 20000,
                    emoji: '📚',
                    image: 'https://contents.kyobobook.co.kr/resources/fo/images/common/ink/img_giftcard_01.png'
                },
                { 
                    id: 5, 
                    name: '교보문고 도서상품권 30,000원', 
                    description: '30,000원 상품권', 
                    points: 30000,
                    emoji: '📚',
                    image: 'https://contents.kyobobook.co.kr/resources/fo/images/common/ink/img_giftcard_01.png'
                }
            ]
        };
    },
    computed: {
        monthlyPoints() {
            return store.getMonthlyPoints(store.currentUser.email);
        },
        monthlyActivity() {
            return this.monthlyPoints.activity || 0;
        },
        monthlyLikes() {
            return this.monthlyPoints.likes || 0;
        },
        remainingActivity() {
            return Math.max(0, 10000 - this.monthlyActivity);
        },
        remainingLikes() {
            return Math.max(0, 10000 - this.monthlyLikes);
        }
    },
    methods: {
        requestReward(reward) {
            if (confirm(`${reward.name}을(를) ${reward.points.toLocaleString()} 포인트로 신청하시겠습니까?`)) {
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
