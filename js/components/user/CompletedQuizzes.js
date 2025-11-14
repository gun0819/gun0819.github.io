// 완료한 퀴즈 목록 컴포넌트
const CompletedQuizzes = {
template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand" @click="$router.push('/dashboard')" style="cursor: pointer;">
                        📚 독서 인증 플랫폼
                    </div>
                    <div class="navbar-nav">
                        <router-link to="/my-reviews" class="nav-link">내 감상문</router-link>
                        <router-link to="/completed-quizzes" class="nav-link active">내 퀴즈</router-link>
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
                </div>
            </nav>
            <div class="container">
                <div class="dashboard">
                    <h2>완료한 퀴즈 🎯</h2>
                    
                    <div v-if="myQuizzes.length > 0">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>도서명</th>
                                        <th>응시일</th>
                                        <th>점수</th>
                                        <th>정답 수</th>
                                        <th>결과</th>
                                        <th>상세</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="quiz in myQuizzes" :key="quiz.id">
                                        <td>{{ quiz.book.title }}</td>
                                        <td>{{ quiz.date }}</td>
                                        <td><strong>{{ quiz.score }}점</strong></td>
                                        <td>{{ quiz.correctAnswers }} / {{ quiz.totalQuestions }}</td>
                                        <td>
                                            <span :class="['badge', quiz.isPassed ? 'badge-approved' : 'badge-rejected']">
                                                {{ quiz.isPassed ? '통과 ✓' : '불합격 ✗' }}
                                            </span>
                                        </td>
                                        <td class="clickable" @click="viewDetail(quiz.id)">
                                            상세보기
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                            <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px;">📊 나의 퀴즈 통계</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                                <div>
                                    <p style="color: #666; font-size: 14px; margin-bottom: 4px;">총 응시 퀴즈</p>
                                    <p style="font-size: 24px; font-weight: bold; color: #667eea;">{{ myQuizzes.length }}개</p>
                                </div>
                                <div>
                                    <p style="color: #666; font-size: 14px; margin-bottom: 4px;">통과한 퀴즈</p>
                                    <p style="font-size: 24px; font-weight: bold; color: #4caf50;">{{ passedCount }}개</p>
                                </div>
                                <div>
                                    <p style="color: #666; font-size: 14px; margin-bottom: 4px;">평균 점수</p>
                                    <p style="font-size: 24px; font-weight: bold; color: #333;">{{ averageScore }}점</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div v-else style="text-align: center; padding: 60px 20px; color: #666;">
                        <div style="font-size: 64px; margin-bottom: 16px;">🎯</div>
                        <h3 style="margin-bottom: 12px; color: #333;">아직 완료한 퀴즈가 없습니다</h3>
                        <p style="margin-bottom: 24px;">도서를 검색하고 퀴즈에 도전해보세요!</p>
                        <button @click="$router.push('/dashboard')" class="btn btn-sm">퀴즈 도전하기</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    computed: {
        isLoggedIn() {
            return store.currentUser !== null;
        },
        myQuizzes() {
            return store.getQuizResults()
                .filter(q => q.userId === store.currentUser.id)
                .sort((a, b) => b.id - a.id); // 최신순 정렬
        },
        passedCount() {
            return this.myQuizzes.filter(q => q.isPassed).length;
        },
        averageScore() {
            if (this.myQuizzes.length === 0) return 0;
            const total = this.myQuizzes.reduce((sum, q) => sum + q.score, 0);
            return Math.round(total / this.myQuizzes.length);
        }
    },
    methods: {
        viewDetail(quizId) {
            this.$router.push(`/quiz-result/${quizId}`);
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/dashboard');
        }
    }
};
