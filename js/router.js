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
    const publicPages = ['/login', '/signup', '/find-account', '/find-password'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = store.currentUser;

    // 로그인이 필요한데 로그인 안 되어있으면
    if (authRequired && !loggedIn) {
        return next('/login');
    }

    // 로그인 되어있는데 로그인 페이지 가려고 하면
    if (loggedIn && publicPages.includes(to.path)) {
        if (loggedIn.type === 'admin') {
            return next('/admin');
        }
        return next('/dashboard');
    }

    // 관리자 페이지 접근 제어
    if (to.path.startsWith('/admin')) {
        if (!loggedIn || loggedIn.type !== 'admin') {
            return next('/login');
        }
    }

    // 일반 사용자가 관리자 페이지 말고 접근
    if (loggedIn && loggedIn.type === 'user' && to.path.startsWith('/admin')) {
        return next('/dashboard');
    }

    next();
});
