// 초기 데이터 설정
(function initializeData() {
    const users = storage.get(CONFIG.STORAGE_KEYS.USERS);
    
    const hasTestUsers = users && users.some(u => u.email === 'user@test.com');
    
    if (!hasTestUsers) {
        const testUsers = [
            {
                id: 1001,
                name: '김독서',
                nickname: '리담',
                email: 'user@test.com',
                phone: '010-1234-5678',
                password: 'user1234',
                type: 'user',
                createdAt: new Date().toISOString()
            },
            {
                id: 1002,
                name: '김독서2',
                nickname: '도담',
                email: 'user2@test.com',
                phone: '010-2345-6789',
                password: 'user1234',
                type: 'user',
                createdAt: new Date().toISOString()
            },
            {
                id: 9001,
                name: '관리자',
                nickname: '도서관리자',
                email: 'admin@test.com',
                phone: '010-9999-9999',
                password: 'admin1234',
                type: 'admin',
                createdAt: new Date().toISOString()
            }
        ];
        
        storage.set(CONFIG.STORAGE_KEYS.USERS, testUsers);
        
        const initialPoints = {
            'user@test.com': 150,
            'user2@test.com': 250,
            'admin@test.com': 0
        };
        storage.set(CONFIG.STORAGE_KEYS.USER_POINTS, initialPoints);
    }
})();

// 초기화
if (!storage.get(CONFIG.STORAGE_KEYS.REVIEWS)) {
    storage.set(CONFIG.STORAGE_KEYS.REVIEWS, []);
}
if (!storage.get(CONFIG.STORAGE_KEYS.USER_POINTS)) {
    storage.set(CONFIG.STORAGE_KEYS.USER_POINTS, {});
}
if (!storage.get(CONFIG.STORAGE_KEYS.QUIZ_RESULTS)) {
    storage.set(CONFIG.STORAGE_KEYS.QUIZ_RESULTS, []);
}
if (!storage.get(CONFIG.STORAGE_KEYS.REWARD_REQUESTS)) {
    storage.set(CONFIG.STORAGE_KEYS.REWARD_REQUESTS, []);
}
if (!storage.get(CONFIG.STORAGE_KEYS.POINT_HISTORY)) {
    storage.set(CONFIG.STORAGE_KEYS.POINT_HISTORY, []);
}
if (!storage.get(CONFIG.STORAGE_KEYS.LIKES)) {
    storage.set(CONFIG.STORAGE_KEYS.LIKES, []);
}
if (!storage.get(CONFIG.STORAGE_KEYS.COMMENTS)) {
    storage.set(CONFIG.STORAGE_KEYS.COMMENTS, []);
}
if (!storage.get(CONFIG.STORAGE_KEYS.USER_QUIZZES)) {
    storage.set(CONFIG.STORAGE_KEYS.USER_QUIZZES, []);
}
if (!storage.get(CONFIG.STORAGE_KEYS.MONTHLY_POINTS)) {
    storage.set(CONFIG.STORAGE_KEYS.MONTHLY_POINTS, {});
}

// 데이터 스토어
const store = {
    currentUser: storage.get(CONFIG.STORAGE_KEYS.CURRENT_USER),
    
    // 사용자 관리
    getUsers() {
        return storage.get(CONFIG.STORAGE_KEYS.USERS) || [];
    },
    
    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        storage.set(CONFIG.STORAGE_KEYS.USERS, users);
    },
    
    findUserByEmail(email) {
        return this.getUsers().find(u => u.email === email);
    },
    
    findUserByPhone(phone) {
        return this.getUsers().find(u => u.phone === phone);
    },
    
    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            storage.set(CONFIG.STORAGE_KEYS.USERS, users);
            
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = { ...this.currentUser, ...updates };
                storage.set(CONFIG.STORAGE_KEYS.CURRENT_USER, this.currentUser);
            }
        }
    },
    
    // 감상문 관리
    getReviews() {
        return storage.get(CONFIG.STORAGE_KEYS.REVIEWS) || [];
    },
    
    addReview(review) {
        const reviews = this.getReviews();
        reviews.push(review);
        storage.set(CONFIG.STORAGE_KEYS.REVIEWS, reviews);
    },
    
    updateReview(reviewId, updates) {
        const reviews = this.getReviews();
        const index = reviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
            reviews[index] = { ...reviews[index], ...updates };
            storage.set(CONFIG.STORAGE_KEYS.REVIEWS, reviews);
        }
    },
    
    // 퀴즈 결과 관리
    getQuizResults() {
        return storage.get(CONFIG.STORAGE_KEYS.QUIZ_RESULTS) || [];
    },
    
    addQuizResult(result) {
        const results = this.getQuizResults();
        results.push(result);
        storage.set(CONFIG.STORAGE_KEYS.QUIZ_RESULTS, results);
    },
    
    // 보상 요청 관리
    getRewardRequests() {
        return storage.get(CONFIG.STORAGE_KEYS.REWARD_REQUESTS) || [];
    },
    
    addRewardRequest(request) {
        const requests = this.getRewardRequests();
        requests.push(request);
        storage.set(CONFIG.STORAGE_KEYS.REWARD_REQUESTS, requests);
    },
    
    updateRewardRequest(requestId, updates) {
        const requests = this.getRewardRequests();
        const index = requests.findIndex(r => r.id === requestId);
        if (index !== -1) {
            requests[index] = { ...requests[index], ...updates };
            storage.set(CONFIG.STORAGE_KEYS.REWARD_REQUESTS, requests);
        }
    },
    
    // 포인트 히스토리
    getPointHistory() {
        return storage.get(CONFIG.STORAGE_KEYS.POINT_HISTORY) || [];
    },
    
    addPointHistory(history) {
        const histories = this.getPointHistory();
        histories.push(history);
        storage.set(CONFIG.STORAGE_KEYS.POINT_HISTORY, histories);
    },
    
    // 포인트 관리 (월별 제한 적용)
    getUserPoints(email) {
        const points = storage.get(CONFIG.STORAGE_KEYS.USER_POINTS) || {};
        return points[email] || 0;
    },
    
    getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    },
    
    getMonthlyPoints(email) {
        const monthlyPoints = storage.get(CONFIG.STORAGE_KEYS.MONTHLY_POINTS) || {};
        const currentMonth = this.getCurrentMonth();
        
        if (!monthlyPoints[email]) {
            monthlyPoints[email] = {};
        }
        if (!monthlyPoints[email][currentMonth]) {
            monthlyPoints[email][currentMonth] = {
                activity: 0,  // 감상문 + 퀴즈
                likes: 0      // 공감
            };
        }
        
        return monthlyPoints[email][currentMonth];
    },
    
    canEarnActivityPoints(email, amount) {
        const monthly = this.getMonthlyPoints(email);
        return (monthly.activity + amount) <= CONFIG.POINTS.MONTHLY_LIMIT_ACTIVITY;
    },
    
    canEarnLikesPoints(email, amount) {
        const monthly = this.getMonthlyPoints(email);
        return (monthly.likes + amount) <= CONFIG.POINTS.MONTHLY_LIMIT_LIKES;
    },
    
    addUserPoints(email, amount, reason, type = 'activity') {
        const currentMonth = this.getCurrentMonth();
        
        // 월별 제한 체크
        let actualAmount = amount;
        if (type === 'activity' && !this.canEarnActivityPoints(email, amount)) {
            const monthly = this.getMonthlyPoints(email);
            actualAmount = Math.max(0, CONFIG.POINTS.MONTHLY_LIMIT_ACTIVITY - monthly.activity);
            if (actualAmount === 0) {
                alert('이번 달 활동 포인트 한도(10,000P)에 도달했습니다.');
                return false;
            }
        } else if (type === 'likes' && amount > 0 && !this.canEarnLikesPoints(email, amount)) {
            const monthly = this.getMonthlyPoints(email);
            actualAmount = Math.max(0, CONFIG.POINTS.MONTHLY_LIMIT_LIKES - monthly.likes);
            if (actualAmount === 0) {
                alert('이번 달 공감 포인트 한도(10,000P)에 도달했습니다.');
                return false;
            }
        }
        
        // 포인트 추가
        const points = storage.get(CONFIG.STORAGE_KEYS.USER_POINTS) || {};
        points[email] = (points[email] || 0) + actualAmount;
        storage.set(CONFIG.STORAGE_KEYS.USER_POINTS, points);
        
        // 월별 포인트 업데이트
        if (actualAmount !== 0) {
            const monthlyPoints = storage.get(CONFIG.STORAGE_KEYS.MONTHLY_POINTS) || {};
            if (!monthlyPoints[email]) monthlyPoints[email] = {};
            if (!monthlyPoints[email][currentMonth]) {
                monthlyPoints[email][currentMonth] = { activity: 0, likes: 0 };
            }
            
            if (type === 'activity') {
                monthlyPoints[email][currentMonth].activity += actualAmount;
            } else if (type === 'likes') {
                monthlyPoints[email][currentMonth].likes += actualAmount;
            }
            
            storage.set(CONFIG.STORAGE_KEYS.MONTHLY_POINTS, monthlyPoints);
        }
        
        // 포인트 히스토리 추가
        const user = this.findUserByEmail(email);
        if (user) {
            this.addPointHistory({
                id: Date.now(),
                userId: user.id,
                userName: user.name,
                userNickname: user.nickname,
                amount: actualAmount,
                reason: reason,
                balance: points[email],
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            });
        }
        
        // 현재 사용자 업데이트
        if (this.currentUser && this.currentUser.email === email) {
            this.currentUser.points = points[email];
        }
        
        return true;
    },
    
    // 공감 관리
    getLikes() {
        return storage.get(CONFIG.STORAGE_KEYS.LIKES) || [];
    },
    
    addLike(like) {
        const likes = this.getLikes();
        likes.push(like);
        storage.set(CONFIG.STORAGE_KEYS.LIKES, likes);
        
        // 100공감마다 포인트 지급
        this.checkLikeMilestone(like.targetType, like.targetId);
    },
    
    removeLike(userId, targetType, targetId) {
        let likes = this.getLikes();
        likes = likes.filter(l => !(l.userId === userId && l.targetType === targetType && l.targetId === targetId));
        storage.set(CONFIG.STORAGE_KEYS.LIKES, likes);
    },
    
    hasLiked(userId, targetType, targetId) {
        const likes = this.getLikes();
        return likes.some(l => l.userId === userId && l.targetType === targetType && l.targetId === targetId);
    },
    
    getLikeCount(targetType, targetId) {
        const likes = this.getLikes();
        return likes.filter(l => l.targetType === targetType && l.targetId === targetId).length;
    },
    
    checkLikeMilestone(targetType, targetId) {
        const likeCount = this.getLikeCount(targetType, targetId);
        
        // 100의 배수일 때만 포인트 지급
        if (likeCount % 100 === 0) {
            let targetAuthorEmail = null;
            
            if (targetType === 'review') {
                const review = this.getReviews().find(r => r.id === targetId);
                if (review) {
                    const user = this.getUsers().find(u => u.id === review.userId);
                    targetAuthorEmail = user?.email;
                }
            } else if (targetType === 'oneline') {
                const review = this.getReviews().find(r => r.id === targetId);
                if (review) {
                    const user = this.getUsers().find(u => u.id === review.userId);
                    targetAuthorEmail = user?.email;
                }
            } else if (targetType === 'comment') {
                const comment = this.getComments().find(c => c.id === targetId);
                if (comment) {
                    const user = this.getUsers().find(u => u.id === comment.userId);
                    targetAuthorEmail = user?.email;
                }
            }
            
            if (targetAuthorEmail) {
                this.addUserPoints(
                    targetAuthorEmail, 
                    CONFIG.POINTS.LIKES_PER_100, 
                    `${likeCount}공감 달성`,
                    'likes'
                );
            }
        }
    },
    
    // 댓글 관리
    getComments() {
        return storage.get(CONFIG.STORAGE_KEYS.COMMENTS) || [];
    },
    
    addComment(comment) {
        const comments = this.getComments();
        comments.push(comment);
        storage.set(CONFIG.STORAGE_KEYS.COMMENTS, comments);
    },
    
    getCommentsByReview(reviewId) {
        return this.getComments().filter(c => c.reviewId === reviewId);
    },
    
    // 사용자 생성 퀴즈 관리
    getUserQuizzes() {
        return storage.get(CONFIG.STORAGE_KEYS.USER_QUIZZES) || [];
    },
    
    addUserQuiz(quiz) {
        const quizzes = this.getUserQuizzes();
        quizzes.push(quiz);
        storage.set(CONFIG.STORAGE_KEYS.USER_QUIZZES, quizzes);
    },
    
    getQuizzesByBook(bookId, bookTitle, bookAuthor) {
        const userQuizzes = this.getUserQuizzes();
        return userQuizzes.filter(q => {
            return q.bookId == bookId || 
                   (q.bookTitle === bookTitle && q.bookAuthor === bookAuthor);
        });
    },
    
    // 현재 사용자
    setCurrentUser(user) {
        this.currentUser = user;
        storage.set(CONFIG.STORAGE_KEYS.CURRENT_USER, user);
    },
    
    clearCurrentUser() {
        this.currentUser = null;
        storage.remove(CONFIG.STORAGE_KEYS.CURRENT_USER);
    },
    
    // 중복 체크 (제목 + 저자로 판단)
    hasReviewForBook(userId, bookId, bookTitle, bookAuthor) {
        const reviews = this.getReviews();
        return reviews.some(r => {
            if (r.userId !== userId) return false;
            if (r.status === 'rejected') return false;
            
            // ISBN이 있으면 ISBN으로 비교
            const reviewBookId = r.bookId || r.book?.id || r.book?.isbn;
            if (reviewBookId == bookId) return true;
            
            // ISBN이 없으면 제목 + 저자로 비교
            const reviewTitle = r.book?.title || '';
            const reviewAuthor = r.book?.author || '';
            return reviewTitle === bookTitle && reviewAuthor === bookAuthor;
        });
    },
    
    // 구 퀴즈 중복 체크 (북 ID 기반) - 하위 호환성 유지
    hasQuizForBook(userId, bookId) {
        const results = this.getQuizResults();
        return results.some(q => {
            const quizBookId = q.bookId || q.book?.id || q.book?.isbn;
            return q.userId === userId && quizBookId == bookId;
        });
    },
    
    // NEW: 퀴즈 중복 체크 (퀴즈 ID 기반)
    hasCompletedQuiz(userId, quizId) {
        const results = this.getQuizResults();
        return results.some(q => {
            return q.userId === userId && q.quizId == quizId;
        });
    },
    
    // 도서 카테고리 체크
    isExcludedCategory(categoryName) {
        if (!categoryName) return false;
        
        return CONFIG.EXCLUDED_CATEGORIES.some(excluded => 
            categoryName.includes(excluded)
        );
    },
    
    // 관리자 등록 퀴즈 (기존 퀴즈)
    quizzes: [
        {
            id: 1,
            bookId: '9788932917245',
            questions: [
                {
                    type: 'multiple',
                    question: '어린 왕자가 사는 별의 이름은?',
                    options: ['B-612', 'B-512', 'A-612', 'C-612'],
                    answer: 0
                },
                {
                    type: 'multiple',
                    question: '어린 왕자가 지구에서 처음 만난 동물은?',
                    options: ['여우', '뱀', '장미', '양'],
                    answer: 1
                }
            ]
        }
    ]
};
