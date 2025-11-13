// 퀴즈 풀기 컴포넌트
const Quiz = {
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
                    <div v-if="isLoading" class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>퀴즈를 불러오는 중...</p>
                    </div>
                    
                    <div v-else-if="alreadyCompleted" style="text-align: center; padding: 60px 20px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
                        <h2>이미 완료한 퀴즈입니다</h2>
                        <p style="color: #666; margin: 20px 0;">이 책의 퀴즈는 이미 응시하셨습니다.</p>
                        <div style="margin-top: 30px;">
                            <button @click="$router.push('/completed-quizzes')" class="btn btn-sm" style="margin-right: 10px;">
                                퀴즈 결과 보기
                            </button>
                            <button @click="$router.push('/dashboard')" class="btn btn-sm btn-secondary">
                                홈으로
                            </button>
                        </div>
                    </div>
                    
                    <div v-else-if="book && !quizCompleted">
                        <div class="back-button">
                            <button @click="goBack" class="btn btn-sm btn-secondary">← 뒤로가기</button>
                        </div>
                        
                        <h2>독서 퀴즈 🎯</h2>
                        
                        <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
                            <img v-if="book.cover" :src="book.cover" :alt="book.title" 
                                 style="width: 150px; height: 200px; object-fit: cover; border-radius: 8px;">
                            <div style="flex: 1;">
                                <h3>{{ book.title }}</h3>
                                <p><strong>저자:</strong> {{ book.author }}</p>
                                <div class="alert-box info" style="margin-top: 16px;">
                                    <strong>📌 퀴즈 안내</strong><br>
                                    • 총 {{ quiz.questions.length }}문제<br>
                                    • 정답률 80% 이상이면 50 포인트 획득!<br>
                                    • 한 번 제출하면 수정할 수 없습니다
                                </div>
                            </div>
                        </div>
                        
                        <div v-if="quiz">
                            <div v-for="(q, index) in quiz.questions" :key="index" class="quiz-question">
                                <h4>{{ index + 1 }}. {{ q.question }}</h4>
                                <div class="quiz-options">
                                    <div v-for="(option, optIndex) in q.options" :key="optIndex"
                                         @click="selectAnswer(index, optIndex)"
                                         :class="['quiz-option', {selected: answers[index] === optIndex}]">
                                        {{ optIndex + 1 }}. {{ option }}
                                    </div>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                                <p style="color: #666; margin-bottom: 16px;">
                                    답변 완료: {{ answers.length }} / {{ quiz.questions.length }}
                                </p>
                                <button @click="submitQuiz" 
                                        :disabled="answers.length !== quiz.questions.length" 
                                        class="btn"
                                        style="min-width: 200px;">
                                    {{ answers.length === quiz.questions.length ? '제출하기' : '모든 문제에 답해주세요' }}
                                </button>
                                <button @click="goBack" class="btn btn-secondary" style="margin-left: 10px;">취소</button>
                            </div>
                        </div>
                        <div v-else>
                            <div class="alert-box warning">
                                <strong>죄송합니다!</strong><br>
                                이 책에 대한 퀴즈가 아직 준비되지 않았습니다.<br>
                                다른 책의 퀴즈를 시도해보세요.
                            </div>
                            <button @click="$router.push('/dashboard')" class="btn btn-sm">홈으로 돌아가기</button>
                        </div>
                    </div>
                    
                    <div v-else-if="quizCompleted" style="text-align: center; padding: 40px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">
                            {{ score >= 80 ? '🎉' : '😢' }}
                        </div>
                        <h2>퀴즈 완료!</h2>
                        <div class="point-display">{{ score }}점</div>
                        <p style="font-size: 18px; color: #666; margin-bottom: 20px;">
                            {{ quiz.questions.length }}문제 중 {{ correctAnswers }}개 정답
                        </p>
                        <p v-if="score >= 80" style="color: #4caf50; font-weight: bold; font-size: 20px;">
                            축하합니다! 50 포인트를 획득하셨습니다! 🎁
                        </p>
                        <p v-else style="color: #f44336; font-size: 18px;">
                            아쉽네요. 80점 이상이어야 포인트를 획득할 수 있습니다.<br>
                            <span style="font-size: 14px; color: #666; margin-top: 8px; display: inline-block;">
                                (책을 다시 읽고 나중에 도전해보세요!)
                            </span>
                        </p>
                        <div style="margin-top: 30px;">
                            <button @click="viewResult" class="btn btn-sm" style="margin-right: 10px;">결과 상세보기</button>
                            <button @click="$router.push('/dashboard')" class="btn btn-sm btn-secondary">홈으로</button>
                        </div>
                    </div>
                    
                    <div v-else-if="!isLoading">
                        <div class="alert-box danger">
                            <p>책 정보를 찾을 수 없습니다.</p>
                        </div>
                        <button @click="$router.push('/dashboard')" class="btn btn-sm">홈으로</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            bookId: this.$route.params.id,
            book: null,
            quiz: null,
            answers: [],
            quizCompleted: false,
            alreadyCompleted: false,
            score: 0,
            correctAnswers: 0,
            isLoading: true,
            resultId: null
        };
    },
    async mounted() {
        // 이미 제출한 퀴즈인지 확인
        if (store.currentUser && store.hasQuizForBook(store.currentUser.id, this.bookId)) {
            this.alreadyCompleted = true;
            this.isLoading = false;
            return;
        }
        
        try {
            // 알라딘 API에서 책 정보 가져오기
            const results = await bookAPI.searchAladin(this.bookId);
            if (results.length > 0) {
                this.book = results[0];
            }
        } catch (error) {
            console.error('책 정보 로드 실패:', error);
        }
        
        // 퀴즈 찾기 (ISBN 또는 bookId로)
        this.quiz = store.quizzes.find(q => q.bookId == this.bookId);
        
        this.isLoading = false;
    },
    methods: {
        goBack() {
            this.$router.back();
        },
        selectAnswer(questionIndex, optionIndex) {
            // answers 배열을 업데이트 (Vue 3의 반응성 유지)
            this.answers[questionIndex] = optionIndex;
            this.answers = [...this.answers]; // 배열 재할당으로 반응성 보장
        },
        submitQuiz() {
            if (this.answers.length !== this.quiz.questions.length) {
                alert('모든 문제에 답해주세요.');
                return;
            }
            
            // 재제출 방지 확인
            if (store.hasQuizForBook(store.currentUser.id, this.bookId)) {
                alert('이미 제출한 퀴즈입니다.');
                this.$router.push('/completed-quizzes');
                return;
            }
            
            let correct = 0;
            const answerDetails = [];
            
            this.quiz.questions.forEach((q, index) => {
                const isCorrect = this.answers[index] === q.answer;
                if (isCorrect) {
                    correct++;
                }
                answerDetails.push({
                    question: q.question,
                    selectedAnswer: this.answers[index],
                    correctAnswer: q.answer,
                    isCorrect: isCorrect
                });
            });
            
            this.correctAnswers = correct;
            this.score = Math.round((correct / this.quiz.questions.length) * 100);
            this.quizCompleted = true;
            
            const quizResult = {
                id: Date.now(),
                userId: store.currentUser.id,
                userName: store.currentUser.name,
                userNickname: store.currentUser.nickname,
                bookId: this.bookId,
                book: this.book,
                quizId: this.quiz.id,
                score: this.score,
                correctAnswers: this.correctAnswers,
                totalQuestions: this.quiz.questions.length,
                answers: answerDetails,
                date: new Date().toLocaleDateString(),
                isPassed: this.score >= 80
            };
            
            this.resultId = quizResult.id;
            store.addQuizResult(quizResult);
            
            // 80점 이상이면 포인트 지급
            if (this.score >= 80) {
                store.addUserPoints(store.currentUser.email, 50, `퀴즈 통과: ${this.book.title}`);
            }
        },
        viewResult() {
            this.$router.push(`/quiz-result/${this.resultId}`);
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
