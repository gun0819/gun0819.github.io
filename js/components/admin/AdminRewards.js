// 관리자 보상 관리 컴포넌트
const AdminRewards = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand">📚 관리자 페이지</div>
                    <div class="navbar-nav">
                        <router-link to="/admin" class="nav-link">대시보드</router-link>
                        <router-link to="/admin/reviews" class="nav-link">감상문 관리</router-link>
                        <router-link to="/admin/books" class="nav-link">도서 관리</router-link>
                        <router-link to="/admin/rewards" class="nav-link active">보상 관리</router-link>
                        <router-link to="/admin/stats" class="nav-link">통계</router-link>
                        <a href="#" @click.prevent="logout" class="nav-link">로그아웃</a>
                    </div>
                </div>
            </nav>
            <div class="container">
                <div class="dashboard">
                    <h2>보상 신청 관리 🎁</h2>
                    <div v-if="requests.length > 0" class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>사용자</th>
                                    <th>이메일</th>
                                    <th>보상 내용</th>
                                    <th>사용 포인트</th>
                                    <th>신청일</th>
                                    <th>상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="request in requests" :key="request.id">
                                    <td>{{ request.userNickname || request.userName }}</td>
                                    <td>{{ request.userEmail }}</td>
                                    <td>{{ request.reward.name }}</td>
                                    <td><strong>{{ request.pointsSpent }} P</strong></td>
                                    <td>{{ request.date }}</td>
                                    <td>
                                        <span :class="['badge', 'badge-' + request.status]">
                                            {{ getStatusText(request.status) }}
                                        </span>
                                    </td>
                                    <td>
                                        <div v-if="request.status === 'pending'" class="button-group">
                                            <button @click="approveRequest(request)" class="btn btn-sm btn-success">승인</button>
                                            <button @click="rejectRequest(request)" class="btn btn-sm btn-danger">보류</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else style="text-align: center; padding: 40px; color: #666;">
                        <p>처리할 보상 신청이 없습니다.</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            requests: store.getRewardRequests()
        };
    },
    methods: {
        getStatusText(status) {
            const statusMap = {
                'pending': '처리 대기',
                'approved': '승인 완료',
                'rejected': '보류'
            };
            return statusMap[status] || status;
        },
        approveRequest(request) {
            if (confirm(`${request.userNickname || request.userName}님의 보상 신청을 승인하시겠습니까?`)) {
                store.updateRewardRequest(request.id, { status: 'approved' });
                alert('보상 신청이 승인되었습니다.');
                this.requests = store.getRewardRequests();
            }
        },
        rejectRequest(request) {
            if (confirm(`${request.userNickname || request.userName}님의 보상 신청을 보류하시겠습니까?\n\n포인트는 사용자에게 반환됩니다.`)) {
                store.addUserPoints(request.userEmail, request.pointsSpent, `보상 신청 보류: ${request.reward.name}`);
                store.updateRewardRequest(request.id, { status: 'rejected' });
                alert('보상 신청이 보류되었으며, 포인트가 반환되었습니다.');
                this.requests = store.getRewardRequests();
            }
        },
        logout() {
            store.clearCurrentUser();
            // 즉시 UI 업데이트를 위해 페이지 새로고침
            window.location.href = '/#/dashboard';
        }
    }
};
