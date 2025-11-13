// 퀴즈 결과 상세보기 컴포넌트
const QuizResultDetail = {
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
                    <div class="back-button">
                        <button @click="$router.back()" class="btn btn-sm btn-secondary">← 목록으로</button>
                    </div>
                    
                    <div v-if="quizResult" class="detail-container">
                        <div class="detail-header">
                            <div style="display: flex; gap: 20px; align-items: start; flex-wrap: wrap;">
                                <img v-if="quizResult.book.cover" :src="quizResult.book.cover" :alt="quizResult.book.title"
                                     style="width: 150px; height: 200px; object-fit: cover; border-radius: 8px;">
                                <div style="flex: 1;">
                                    <h2>{{ quizResult.book.title }} - 퀴즈 결과</h2>
                                    <p style="color: #666; margin-top: 8px;">{{ quizResult.book.author }}</p>
                                    
                                    <div class="detail-meta" style="border-top: none; padding-top: 0; margin-top: 16px;">
                                        <span><strong>응시일:</strong> {{ quizResult.date }}</span>
                                        <span><strong>점수:</strong> {{ quizResult.score }}점</span>
                                        <span><strong>정답률:</strong> {{ quizResult.correctAnswers }} / {{ quizResult.totalQuestions }}</span>
                                        <span><strong>결과:</strong> 
                                            <span :class="['badge', quizResult.isPassed ? 'badge-approved' : 'badge-rejected']">
                                                {{ quizResult.isPassed ? '통과 ✓' : '불합격 ✗' }}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div v-if="quizResult.isPassed" class="alert-box success" style="margin-top: 20px;">
                            <strong>🎉 축하합니다!</strong><br>
                            퀴즈를 통과하여 50 포인트를 획득하셨습니다!
                        </div>
                        
                        <div v-else class="alert-box warning" style="margin-top: 20px;">
                            <strong>아쉽습니다!</strong><br>
                            80점 이상 받아야 포인트를 획득할 수 있습니다. 다음에 다시 도전해보세요!
                        </div>
                        
                        <div style="margin-top: 40px;">
                            <h3 style="margin-bottom: 20px;">문제별 결과</h3>
                            <div v-for="(answer, index) in quizResult.answers" :key="index" class="quiz-question">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <h4 style="margin: 0;">{{ index + 1 }}. {{ answer.question }}</h4>
                                    <span :class="['badge', answer.isCorrect ? 'badge-approved' : 'badge-rejected']">
                                        {{ answer.isCorrect ? '정답 ✓' : '오답 ✗' }}
                                    </span>
                                </div>
                                <div class="quiz-options">
                                    <div v-for="(option, optIndex) in getQuizOptions(quizResult.bookId, index)" :key="optIndex"
                                         :class="getOptionClass(answer, optIndex)">
                                        {{ optIndex + 1 }}. {{ option }}
                                        <span v-if="optIndex === answer.correctAnswer" style="margin-left: 8px;">
                                            ✓ 정답
                                        </span>
                                        <span v-if="optIndex === answer.selectedAnswer && !answer.isCorrect" style="margin-left: 8px;">
                                            ✗ 내가 선택한 답
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 40px; padding: 30px; background: #f8f9fa; border-radius: 8px;">
                            <h3 style="margin-bottom: 16px;">📊 퀴즈 요약</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-top: 20px;">
                                <div>
                                    <p style="color: #666; font-size: 14px; margin-bottom: 4px;">총 문제 수</p>
                                    <p style="font-size: 28px; font-weight: bold; color: #333;">{{ quizResult.totalQuestions }}개</p>
                                </div>
                                <div>
                                    <p style="color: #666; font-size: 14px; margin-bottom: 4px;">정답 수</p>
                                    <p style="font-size: 28px; font-weight: bold; color: #4caf50;">{{ quizResult.correctAnswers }}개</p>
                                </div>
                                <div>
                                    <p style="color: #666; font-size: 14px; margin-bottom: 4px;">오답 수</p>
                                    <p style="font-size: 28px; font-weight: bold; color: #f44336;">{{ quizResult.totalQuestions - quizResult.correctAnswers }}개</p>
                                </div>
                                <div>
                                    <p style="color: #666; font-size: 14px; margin-bottom: 4px;">최종 점수</p>
                                    <p style="font-size: 28px; font-weight: bold; color: #667eea;">{{ quizResult.score }}점</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div v-else>
                        <div class="alert-box danger">
                            <p>퀴즈 결과를 찾을 수 없습니다.</p>
                        </div>
                        <button @click="$router.push('/completed-quizzes')" class="btn btn-sm">목록으로</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            quizResultId: this.$route.params.id,
            quizResult: null
        };
    },
    mounted() {
        const results = store.getQuizResults();
        this.quizResult = results.find(q => q.id == this.quizResultId);
    },
    methods: {
        getQuizOptions(bookId, questionIndex) {
            const quiz = store.quizzes.find(q => q.bookId == bookId);
            return quiz ? quiz.questions[questionIndex].options : [];
        },
        getOptionClass(answer, optIndex) {
            if (optIndex === answer.correctAnswer) {
                return 'quiz-option correct';
            }
            if (optIndex === answer.selectedAnswer && !answer.isCorrect) {
                return 'quiz-option incorrect';
            }
            return 'quiz-option';
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
