// 감상문 작성 컴포넌트 (붙여넣기 차단)
const ReviewWrite = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-content">
                        <div class="navbar-left">
                            <div class="navbar-brand" @click="$router.push('/dashboard')" style="cursor: pointer;">
                                📚 독서 인증 플랫폼
                            </div>
                            
                            <!-- 통합 검색바 -->
                            <div class="navbar-search">
                                <input v-model="headerSearchQuery" 
                                       class="navbar-search-input"
                                       placeholder="도서 검색..." 
                                       @keyup.enter="headerSearch">
                                <button class="navbar-search-button" @click="headerSearch">검색</button>
                            </div>
                        </div>
                        
                        <div class="navbar-nav">
                            <router-link to="/my-reviews" class="nav-link">내 감상문</router-link>
                            <router-link to="/completed-quizzes" class="nav-link">내 퀴즈</router-link>
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
                </div>
            </nav>
            
            <div class="container">
                <div class="dashboard">
                    <div v-if="isLoading" class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>책 정보를 불러오는 중...</p>
                    </div>
                    
                    <div v-else-if="alreadySubmitted" style="text-align: center; padding: 60px 20px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
                        <h2>이미 제출한 감상문입니다</h2>
                        <p style="color: #666; margin: 20px 0;">이 책의 감상문은 이미 제출하셨습니다.</p>
                        <div style="margin-top: 30px;">
                            <button @click="$router.push('/my-reviews')" class="btn btn-sm" style="margin-right: 10px;">
                                내 감상문 보기
                            </button>
                            <button @click="$router.push('/dashboard')" class="btn btn-sm btn-secondary">
                                홈으로
                            </button>
                        </div>
                    </div>
                    
                    <div v-else-if="book">
                        <div class="back-button">
                            <button @click="goBack" class="btn btn-sm btn-secondary">← 뒤로가기</button>
                        </div>
                        
                        <h2>{{ isEdit ? '감상문 수정' : '감상문 작성' }} ✍️</h2>
                        
                        <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
                            <img v-if="book.cover" :src="book.cover" :alt="book.title" 
                                 style="width: 150px; height: 200px; object-fit: cover; border-radius: 8px;">
                            <div style="flex: 1;">
                                <h3>{{ book.title }}</h3>
                                <p><strong>저자:</strong> {{ book.author }}</p>
                                <p v-if="book.publisher"><strong>출판사:</strong> {{ book.publisher }}</p>
                                <p v-if="book.isbn"><strong>ISBN:</strong> {{ book.isbn }}</p>
                                <div v-if="isExcludedBook" class="alert-box warning" style="margin-top: 12px;">
                                    <strong>⚠️ 주의</strong><br>
                                    이 책은 문제집/자격증/수험서 카테고리로 감상문 작성 시 포인트가 지급되지 않습니다.
                                </div>
                            </div>
                        </div>
                        
                        <div v-if="existingReview && existingReview.status === 'rejected'" class="alert-box danger">
                            <strong>반려 사유:</strong> {{ existingReview.rejectionReason }}
                        </div>
                        
                        <!-- 승인 후 수정 불가 경고 -->
                        <div v-if="!isEdit" class="alert-box warning" style="margin-bottom: 20px;">
                            <strong>⚠️ 중요 안내</strong><br>
                            • 승인이 완료되면 감상문을 수정하거나 삭제할 수 없습니다.<br>
                            • 승인 대기 중에만 수정이 가능합니다.<br>
                            • 승인 후에는 공개/비공개 설정만 변경할 수 있습니다.<br>
                            • 신중하게 작성해주세요!
                        </div>

                        <!-- 한줄 평 (무조건 공개) -->
                        <div class="form-group">
                            <label>한줄 평 (필수) * ⚠️ 무조건 공개됩니다</label>
                            <input type="text" 
                                   v-model="onelineReview" 
                                   placeholder="이 책을 한 줄로 표현한다면? (최대 100자)"
                                   maxlength="100"
                                   @paste="preventPaste">
                            <p class="info">
                                한줄 평은 공개/비공개 설정과 관계없이 모든 사용자에게 공개됩니다.
                            </p>
                            <p style="text-align: right; color: #666; font-size: 12px;">
                                {{ onelineReview.length }} / 100자
                            </p>
                        </div>

                        <!-- 감상문 본문 (붙여넣기 차단) -->
                        <div class="form-group">
                            <label>감상문 (100자 이상, 10,000자 이하) * 
                                <span style="color: #f44336; font-size: 12px;">※ 붙여넣기가 차단됩니다</span>
                            </label>
                            <textarea v-model="reviewText" 
                                      rows="15" 
                                      placeholder="책을 읽고 느낀 점을 자유롭게 작성해주세요..."
                                      :maxlength="10000"
                                      @paste="preventPaste"
                                      @contextmenu="preventContextMenu"></textarea>
                            <p style="text-align: right; color: #666; margin-top: 5px;">
                                {{ reviewText.length }} / 10,000자
                                <span v-if="reviewText.length >= 100" style="color: #4caf50;">✓ (최소 100자 달성)</span>
                                <span v-else style="color: #f44336;">✗ (최소 100자 필요)</span>
                            </p>
                        </div>

                        <!-- 별점 (감상문 작성 칸 아래로 이동) -->
                        <div class="form-group">
                            <label>별점 (필수) *</label>
                            <div style="font-size: 32px;">
                                <span v-for="i in 5" :key="i" @click="rating = i" style="cursor: pointer;">
                                    {{ i <= rating ? '⭐' : '☆' }}
                                </span>
                            </div>
                            <p v-if="rating === 0" class="error">별점을 선택해주세요.</p>
                            <p v-else style="color: #666; font-size: 14px; margin-top: 8px;">
                                {{ rating }}점 / 5점
                            </p>
                        </div>

                        <!-- 공개/비공개 설정 (레이아웃 개선) -->
                        <div class="form-group">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" v-model="isPublic" id="publicCheckbox" style="width: 18px; height: 18px; margin: 0; cursor: pointer;">
                                <label for="publicCheckbox" style="margin: 0; cursor: pointer; font-weight: 600; font-size: 16px;">
                                    감상문 공개하기
                                </label>
                            </div>
                            <p class="info" style="margin-top: 8px; margin-left: 26px;">
                                체크 해제 시 감상문 본문은 비공개되지만, 한줄 평과 별점은 무조건 공개됩니다.
                            </p>
                        </div>

                        <!-- 퀴즈 작성 옵션 (레이아웃 개선) -->
                        <div class="form-group" style="margin-top: 40px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" v-model="wantToCreateQuiz" id="quizCheckbox" style="width: 18px; height: 18px; margin: 0; cursor: pointer;">
                                <label for="quizCheckbox" style="margin: 0; cursor: pointer; font-weight: 600; font-size: 16px;">
                                    다른 사용자를 위해 퀴즈를 만들어주시겠어요? 🎯
                                </label>
                            </div>
                            <p class="info" style="margin-top: 8px; margin-left: 26px;">
                                퀴즈를 만들면 다른 사용자들이 이 책을 더 깊이 이해하는 데 도움이 됩니다!
                            </p>
                        </div>

                        <!-- 퀴즈 작성 UI -->
                        <div v-if="wantToCreateQuiz" class="quiz-creation-section">
                            <h3>📝 퀴즈 만들기</h3>
                            <p style="color: #666; margin-bottom: 20px;">
                                객관식, 주관식, 서술형 문제를 자유롭게 만들어보세요.
                            </p>

                            <div class="form-group">
                                <label>문제 유형 선택</label>
                                <select v-model="currentQuizType" style="width: 200px;">
                                    <option value="multiple">객관식</option>
                                    <option value="short">주관식</option>
                                    <option value="essay">서술형</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>문제</label>
                                <input type="text" 
                                       v-model="currentQuestion" 
                                       placeholder="문제를 입력하세요">
                            </div>

                            <!-- 객관식 옵션 -->
                            <div v-if="currentQuizType === 'multiple'" class="quiz-options-input">
                                <label>보기 (정답에 체크하세요)</label>
                                <div v-for="(opt, idx) in currentOptions" :key="idx" 
                                     style="display: flex; gap: 8px; margin-bottom: 8px;">
                                    <input type="radio" 
                                           :name="'answer'" 
                                           :value="idx"
                                           v-model="currentAnswer"
                                           style="width: auto;">
                                    <input type="text" 
                                           v-model="currentOptions[idx]"
                                           :placeholder="'보기 ' + (idx + 1)"
                                           style="flex: 1;">
                                    <button @click="removeOption(idx)" 
                                            class="btn btn-sm btn-danger"
                                            v-if="currentOptions.length > 2">
                                        삭제
                                    </button>
                                </div>
                                <button @click="addOption" 
                                        class="btn btn-sm"
                                        v-if="currentOptions.length < 5">
                                    + 보기 추가
                                </button>
                            </div>

                            <!-- 주관식/서술형 정답 -->
                            <div v-else class="form-group">
                                <label>{{ currentQuizType === 'short' ? '정답' : '예시 답안' }}</label>
                                <textarea v-model="currentAnswerText"
                                          :rows="currentQuizType === 'essay' ? 5 : 2"
                                          :placeholder="currentQuizType === 'short' ? '정답을 입력하세요' : '예시 답안을 입력하세요'"></textarea>
                                <p class="info">
                                    {{ currentQuizType === 'short' ? 
                                       '주관식은 정확한 정답을 입력해주세요.' : 
                                       '서술형은 예시 답안만 제공됩니다. 다른 사용자가 스스로 채점합니다.' }}
                                </p>
                            </div>

                            <div style="display: flex; gap: 10px; margin-top: 16px;">
                                <button @click="addQuizQuestion" class="btn btn-sm">
                                    문제 추가
                                </button>
                                <button @click="resetQuizForm" class="btn btn-sm btn-secondary">
                                    입력 초기화
                                </button>
                            </div>

                            <!-- 추가된 문제 목록 -->
                            <div v-if="quizQuestions.length > 0" style="margin-top: 30px;">
                                <h4>추가된 문제 ({{ quizQuestions.length }}개)</h4>
                                <div v-for="(q, idx) in quizQuestions" :key="idx" class="quiz-question-item">
                                    <div style="display: flex; justify-content: space-between; align-items: start;">
                                        <div style="flex: 1;">
                                            <p><strong>{{ idx + 1 }}. [{{ getQuizTypeName(q.type) }}] {{ q.question }}</strong></p>
                                            <p v-if="q.type === 'multiple'" style="font-size: 14px; color: #666; margin-top: 8px;">
                                                보기: {{ q.options.join(', ') }}<br>
                                                정답: {{ q.options[q.answer] }}
                                            </p>
                                            <p v-else style="font-size: 14px; color: #666; margin-top: 8px;">
                                                {{ q.type === 'short' ? '정답: ' : '예시 답안: ' }}{{ q.answerText }}
                                            </p>
                                        </div>
                                        <button @click="removeQuizQuestion(idx)" 
                                                class="btn btn-sm btn-danger">
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="button-group" style="margin-top: 30px;">
                            <button @click="submitReview" 
                                    :disabled="!canSubmit" 
                                    class="btn">
                                {{ isEdit ? '수정 완료' : '제출하기' }}
                            </button>
                            <button @click="goBack" class="btn btn-secondary">취소</button>
                        </div>
                    </div>
                    
                    <div v-else-if="!isLoading">
                        <div class="alert-box danger">
                            <p>책 정보를 찾을 수 없습니다.</p>
                        </div>
                        <button @click="$router.push('/dashboard')" class="btn btn-sm">홈으로 돌아가기</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            bookId: this.$route.params.id,
            reviewId: this.$route.query.reviewId,
            book: null,
            existingReview: null,
            isEdit: false,
            alreadySubmitted: false,
            reviewText: '',
            onelineReview: '',
            rating: 0,
            isPublic: true,
            isLoading: true,
            headerSearchQuery: '',
            
            // 퀴즈 작성
            wantToCreateQuiz: false,
            quizQuestions: [],
            currentQuizType: 'multiple',
            currentQuestion: '',
            currentOptions: ['', '', '', ''],
            currentAnswer: 0,
            currentAnswerText: ''
        };
    },
    computed: {
        isExcludedBook() {
            if (!this.book) return false;
            return store.isExcludedCategory(this.book.categoryName);
        },
        canSubmit() {
            return this.rating > 0 && 
                   this.onelineReview.trim().length > 0 &&
                   this.reviewText.length >= 100 && 
                   this.reviewText.length <= 10000;
        }
    },
    async mounted() {
        // 수정 모드 확인
        if (this.reviewId) {
            const reviews = store.getReviews();
            this.existingReview = reviews.find(r => r.id == this.reviewId);
            if (this.existingReview) {
                this.isEdit = true;
                this.reviewText = this.existingReview.content;
                this.onelineReview = this.existingReview.onelineReview || '';
                this.rating = this.existingReview.rating;
                this.isPublic = this.existingReview.isPublic !== undefined ? this.existingReview.isPublic : true;
            }
        } else {
            // 신규 작성 시 중복 체크
            await this.loadBook();
            if (this.book && store.currentUser && store.hasReviewForBook(
                store.currentUser.id, 
                this.bookId,
                this.book.title,
                this.book.author
            )) {
                this.alreadySubmitted = true;
                this.isLoading = false;
                return;
            }
        }
        
        await this.loadBook();
        this.isLoading = false;
    },
    methods: {
        headerSearch() {
            if (!this.headerSearchQuery.trim()) {
                alert('검색어를 입력해주세요.');
                return;
            }
            this.$router.push({
                path: '/search',
                query: { q: this.headerSearchQuery }
            });
        },
        // 붙여넣기 차단
        preventPaste(event) {
            event.preventDefault();
            alert('붙여넣기는 허용되지 않습니다. 직접 작성해주세요.');
        },
        // 우클릭 메뉴 차단 (붙여넣기 방지)
        preventContextMenu(event) {
            event.preventDefault();
            return false;
        },
        async loadBook() {
            try {
                const results = await bookAPI.searchAladin(this.bookId);
                if (results.length > 0) {
                    this.book = results[0];
                }
            } catch (error) {
                console.error('책 정보 로드 실패:', error);
            }
        },
        goBack() {
            this.$router.back();
        },
        submitReview() {
            // 유효성 검사
            if (this.rating === 0) {
                alert('별점을 선택해주세요.');
                return;
            }
            
            if (!this.onelineReview.trim()) {
                alert('한줄 평을 작성해주세요.');
                return;
            }
            
            if (this.reviewText.length < 100) {
                alert('감상문은 최소 100자 이상 작성해주세요.');
                return;
            }
            
            if (this.reviewText.length > 10000) {
                alert('감상문은 최대 10,000자까지 작성 가능합니다.');
                return;
            }
            
            if (this.isEdit) {
                // 수정 모드
                const updates = {
                    content: this.reviewText,
                    onelineReview: this.onelineReview,
                    rating: this.rating,
                    isPublic: this.isPublic,
                    status: 'pending'
                };
                
                store.updateReview(this.existingReview.id, updates);
                alert('감상문이 수정되었습니다! 관리자 재승인을 기다려주세요.');
            } else {
                // 신규 작성 - 재제출 방지 체크
                if (store.hasReviewForBook(
                    store.currentUser.id, 
                    this.bookId,
                    this.book.title,
                    this.book.author
                )) {
                    alert('이미 감상문을 제출한 도서입니다.');
                    this.$router.push('/my-reviews');
                    return;
                }
                
                const review = {
                    id: Date.now(),
                    userId: store.currentUser.id,
                    userName: store.currentUser.name,
                    userNickname: store.currentUser.nickname,
                    bookId: this.bookId,
                    book: this.book,
                    content: this.reviewText,
                    onelineReview: this.onelineReview,
                    rating: this.rating,
                    isPublic: this.isPublic,
                    status: 'pending',
                    date: new Date().toLocaleDateString()
                };
                
                store.addReview(review);
                
                // 퀴즈 등록
                if (this.wantToCreateQuiz && this.quizQuestions.length > 0) {
                    const quiz = {
                        id: Date.now() + 1,
                        bookId: this.bookId,
                        bookTitle: this.book.title,
                        bookAuthor: this.book.author,
                        creatorId: store.currentUser.id,
                        creatorNickname: store.currentUser.nickname,
                        questions: this.quizQuestions,
                        createdAt: new Date().toISOString()
                    };
                    store.addUserQuiz(quiz);
                    alert('감상문과 퀴즈가 제출되었습니다! 관리자 승인 후 포인트가 지급됩니다.');
                } else {
                    const pointMessage = this.isExcludedBook ? 
                        '감상문이 제출되었습니다! (문제집/수험서 카테고리는 포인트가 지급되지 않습니다)' :
                        '감상문이 제출되었습니다! 관리자 승인 후 100 포인트가 지급됩니다.';
                    alert(pointMessage);
                }
            }
            
            this.$router.push('/my-reviews');
        },
        
        // 퀴즈 관련 메서드
        addOption() {
            if (this.currentOptions.length < 5) {
                this.currentOptions.push('');
            }
        },
        removeOption(idx) {
            if (this.currentOptions.length > 2) {
                this.currentOptions.splice(idx, 1);
                if (this.currentAnswer >= this.currentOptions.length) {
                    this.currentAnswer = 0;
                }
            }
        },
        addQuizQuestion() {
            if (!this.currentQuestion.trim()) {
                alert('문제를 입력해주세요.');
                return;
            }
            
            const question = {
                type: this.currentQuizType,
                question: this.currentQuestion
            };
            
            if (this.currentQuizType === 'multiple') {
                const filledOptions = this.currentOptions.filter(o => o.trim());
                if (filledOptions.length < 2) {
                    alert('최소 2개 이상의 보기를 입력해주세요.');
                    return;
                }
                question.options = filledOptions;
                question.answer = this.currentAnswer;
            } else {
                if (!this.currentAnswerText.trim()) {
                    alert(this.currentQuizType === 'short' ? '정답을 입력해주세요.' : '예시 답안을 입력해주세요.');
                    return;
                }
                question.answerText = this.currentAnswerText;
            }
            
            this.quizQuestions.push(question);
            this.resetQuizForm();
        },
        removeQuizQuestion(idx) {
            this.quizQuestions.splice(idx, 1);
        },
        resetQuizForm() {
            this.currentQuestion = '';
            this.currentOptions = ['', '', '', ''];
            this.currentAnswer = 0;
            this.currentAnswerText = '';
        },
        getQuizTypeName(type) {
            const names = {
                'multiple': '객관식',
                'short': '주관식',
                'essay': '서술형'
            };
            return names[type] || type;
        },
        logout() {
            store.clearCurrentUser();
            // 즉시 UI 업데이트를 위해 페이지 새로고침
            window.location.href = '/#/dashboard';
        }
    }
};
