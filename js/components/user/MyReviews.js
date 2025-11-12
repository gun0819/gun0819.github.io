const MyReviews = {
    template: `
        <div>
            <nav class="navbar"><div class="container"><div class="navbar-brand">📚 독서 인증 플랫폼</div>
            <div class="navbar-nav"><router-link to="/dashboard" class="nav-link">홈</router-link>
            <router-link to="/my-reviews" class="nav-link active">내 감상문</router-link>
            <a href="#" @click.prevent="logout" class="nav-link">로그아웃</a></div></div></nav>
            <div class="container"><div class="dashboard"><h2>내 감상문</h2>
            <div v-if="myReviews.length > 0" class="table-container"><table><thead><tr>
            <th>도서명</th><th>작성일</th><th>별점</th><th>상태</th></tr></thead>
            <tbody><tr v-for="review in myReviews" :key="review.id">
            <td>{{ review.book.title }}</td><td>{{ review.date }}</td>
            <td>{{ '⭐'.repeat(review.rating) }}</td>
            <td><span :class="['badge', 'badge-' + review.status]">{{ getStatusText(review.status) }}</span></td>
            </tr></tbody></table></div>
            <div v-else style="text-align: center; padding: 40px;"><p>작성한 감상문이 없습니다.</p></div>
            </div></div>
        </div>
    `,
    computed: {
        myReviews() { return store.getReviews().filter(r => r.userId === store.currentUser.id); }
    },
    methods: {
        getStatusText(status) {
            return {'pending': '승인 대기', 'approved': '승인 완료', 'rejected': '반려'}[status] || status;
        },
        logout() { store.clearCurrentUser(); this.$router.push('/login'); }
    }
};
