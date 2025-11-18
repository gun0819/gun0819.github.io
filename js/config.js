// 설정 및 상수
const CONFIG = {
    // 알라딘 TTB 키 (발급받은 키로 변경하세요)
    ALADIN_TTB_KEY: 'ttbgun081901601002',
    
    // LocalStorage 키
    STORAGE_KEYS: {
        USERS: 'reading_platform_users',
        CURRENT_USER: 'reading_platform_current_user',
        REVIEWS: 'reading_platform_reviews',
        USER_POINTS: 'reading_platform_points',
        QUIZ_RESULTS: 'reading_platform_quiz_results',
        REWARD_REQUESTS: 'reading_platform_reward_requests',
        POINT_HISTORY: 'reading_platform_point_history',
        LIKES: 'reading_platform_likes',
        COMMENTS: 'reading_platform_comments',
        USER_QUIZZES: 'reading_platform_user_quizzes',
        MONTHLY_POINTS: 'reading_platform_monthly_points'
    },
    
    // 포인트 관련 설정
    POINTS: {
        REVIEW_APPROVAL: 100,      // 감상문 승인 시
        QUIZ_PASS: 50,              // 퀴즈 통과 시
        LIKES_PER_100: 100,         // 100공감당
        MONTHLY_LIMIT_ACTIVITY: 10000,  // 월 활동 포인트 한도 (감상문+퀴즈)
        MONTHLY_LIMIT_LIKES: 10000      // 월 공감 포인트 한도
    },
    
    // 감상문 설정
    REVIEW: {
        MIN_LENGTH: 100,
        MAX_LENGTH: 10000
    },
    
    // 포인트 제외 카테고리 (알라딘 API 카테고리명)
    EXCLUDED_CATEGORIES: [
        '초등학교참고서',
        '중학교참고서', 
        '고등학교참고서',
        '수험서/자격증',
        '공무원 수험서',
        '고시/공무원',
        '웹소설',
        '인터넷소설'
    ]
};
