// 포인트 신청 내역 컴포넌트
const PointsRequests = {
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
                    <h2>포인트 신청 내역 🎁</h2>
                    <div style="margin-bottom: 20px;">
                        <button @click="$router.push('/points-exchange')" class="btn btn-sm">+ 새로운 보상 신청하기</button>
                    </div>
                    <div v-if="myRequests.length > 0" class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>보상명</th>
                                    <th>사용 포인트</th>
                                    <th>신청일</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="request in myRequests" :key="request.id">
                                    <td>{{ request.reward.name }}</td>
                                    <td><strong>{{ request.pointsSpent }} P</strong></td>
                                    <td>{{ request.date }}</td>
                                    <td>
                                        <span :class="['badge', 'badge-' + request.status]">
                                            {{ getStatusText(request.status) }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else style="text-align: center; padding: 40px; color: #666;">
                        <p>아직 신청한 보상이 없습니다.</p>
                        <button @click="$router.push('/points-exchange')" class="btn btn-sm" style="margin-top: 20px;">보상 신청하기</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    computed: {
        myRequests() {
            return store.getRewardRequests().filter(r => r.userId === store.currentUser.id);
        }
    },
    methods: {
        getStatusText(status) {
            const statusMap = {
                'pending': '처리 대기',
                'approved': '승인 완료',
                'rejected': '보류 (포인트 반환됨)'
            };
            return statusMap[status] || status;
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/dashboard');
        }
    }
};
