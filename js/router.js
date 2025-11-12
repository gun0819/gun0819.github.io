// 라우터 설정
const { createRouter, createWebHashHistory } = VueRouter;

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
    { path: '/find-account', component: FindAccount },
    { path: '/find-password', component: FindPassword },
    { path: '/dashboard', component: UserDashboard },
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
    const publicPages = ['/', '/login', '/signup', '/find-account', '/find-password'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = store.currentUser;

    if (authRequired && !loggedIn) {
        return next('/login');
    }

    if (to.path.startsWith('/admin') && loggedIn && loggedIn.type !== 'admin') {
        return next('/dashboard');
    }

    if (!to.path.startsWith('/admin') && !publicPages.includes(to.path) && loggedIn && loggedIn.type === 'admin') {
        return next('/admin');
    }

    next();
});
