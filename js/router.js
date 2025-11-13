// 라우터 설정
const { createRouter, createWebHashHistory } = VueRouter;

const routes = [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
    { path: '/find-account', component: FindAccount },
    { path: '/find-password', component: FindPassword },
    { path: '/dashboard', component: UserDashboard },
    { path: '/search', component: SearchResults },
    { path: '/review/:id', component: ReviewWrite },
    { path: '/quiz/:id', component: Quiz },
    { path: '/my-reviews', component: MyReviews },
    { path: '/review-detail/:id', component: ReviewDetail },
    { path: '/completed-quizzes', component: CompletedQuizzes },
    { path: '/quiz-result/:id', component: QuizResultDetail },
    { path: '/points-exchange', component: PointsExchange },
    { path: '/points-history', component: PointsHistory },
    { path: '/points-requests', component: PointsRequests },
    { path: '/my-page', component: MyPage },
    { path: '/admin', component: AdminDashboard },
    { path: '/admin/reviews', component: AdminReviews },
    { path: '/admin/books', component: AdminBooks },
    { path: '/admin/rewards', component: AdminRewards },
    { path: '/admin/stats', component: AdminStats }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// 라우터 가드
router.beforeEach((to, from, next) => {
    // 로그인 없이 접근 가능한 페이지
    const publicPages = ['/login', '/signup', '/find-account', '/find-password', '/dashboard', '/search'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = store.currentUser;

    // 로그인이 필요한 페이지에 로그인 없이 접근 시
    if (authRequired && !loggedIn) {
        return next('/login');
    }

    // 관리자 페이지 접근 제어
    if (to.path.startsWith('/admin') && loggedIn && loggedIn.type !== 'admin') {
        return next('/dashboard');
    }

    // 관리자가 일반 사용자 페이지 접근 시 (로그인, 회원가입, 대시보드, 검색 제외)
    if (!publicPages.includes(to.path) && !to.path.startsWith('/admin') && loggedIn && loggedIn.type === 'admin') {
        return next('/admin');
    }

    next();
});
