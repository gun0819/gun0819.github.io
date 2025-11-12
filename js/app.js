// Vue 앱 초기화
const { createApp } = Vue;

const app = createApp({
    template: '<router-view></router-view>'
});

app.use(router);
app.mount('#app');

console.log('✅ 독서 인증 플랫폼이 시작되었습니다!');
console.log('📌 테스트 계정:');
console.log('   일반 사용자: user@test.com / user1234');
console.log('   관리자: admin@test.com / admin1234');
