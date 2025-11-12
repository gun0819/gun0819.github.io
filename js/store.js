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

// 데이터 스토어
const store = {
    currentUser: storage.get(CONFIG.STORAGE_KEYS.CURRENT_USER),
    
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
    
    getQuizResults() {
        return storage.get(CONFIG.STORAGE_KEYS.QUIZ_RESULTS) || [];
    },
    
    addQuizResult(result) {
        const results = this.getQuizResults();
        results.push(result);
        storage.set(CONFIG.STORAGE_KEYS.QUIZ_RESULTS, results);
    },
    
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
    
    getPointHistory() {
        return storage.get(CONFIG.STORAGE_KEYS.POINT_HISTORY) || [];
    },
    
    addPointHistory(history) {
        const histories = this.getPointHistory();
        histories.push(history);
        storage.set(CONFIG.STORAGE_KEYS.POINT_HISTORY, histories);
    },
    
    getUserPoints(email) {
        const points = storage.get(CONFIG.STORAGE_KEYS.USER_POINTS) || {};
        return points[email] || 0;
    },
    
    addUserPoints(email, amount, reason) {
        const points = storage.get(CONFIG.STORAGE_KEYS.USER_POINTS) || {};
        points[email] = (points[email] || 0) + amount;
        storage.set(CONFIG.STORAGE_KEYS.USER_POINTS, points);
        
        const user = this.findUserByEmail(email);
        if (user) {
            this.addPointHistory({
                id: Date.now(),
                userId: user.id,
                userName: user.name,
                userNickname: user.nickname,
                amount: amount,
                reason: reason,
                balance: points[email],
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            });
        }
        
        if (this.currentUser && this.currentUser.email === email) {
            this.currentUser.points = points[email];
        }
    },
    
    setCurrentUser(user) {
        this.currentUser = user;
        storage.set(CONFIG.STORAGE_KEYS.CURRENT_USER, user);
    },
    
    clearCurrentUser() {
        this.currentUser = null;
        storage.remove(CONFIG.STORAGE_KEYS.CURRENT_USER);
    },
    
    hasReviewForBook(userId, bookId) {
        const reviews = this.getReviews();
        return reviews.some(r => {
            const reviewBookId = r.bookId || r.book?.id || r.book?.isbn;
            return r.userId === userId && 
                   (reviewBookId == bookId || r.book?.isbn == bookId) && 
                   r.status !== 'rejected';
        });
    },
    
    hasQuizForBook(userId, bookId) {
        const results = this.getQuizResults();
        return results.some(q => {
            const quizBookId = q.bookId || q.book?.id || q.book?.isbn;
            return q.userId === userId && 
                   (quizBookId == bookId || q.book?.isbn == bookId);
        });
    },
    
    quizzes: [
        {
            id: 1,
            bookId: '9788932917245',
            questions: [
                {
                    question: '어린 왕자가 사는 별의 이름은?',
                    options: ['B-612', 'B-512', 'A-612', 'C-612'],
                    answer: 0
                },
                {
                    question: '어린 왕자가 지구에서 처음 만난 동물은?',
                    options: ['여우', '뱀', '장미', '양'],
                    answer: 1
                }
            ]
        }
    ]
};
