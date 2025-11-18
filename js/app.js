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
console.log('');
console.log('🆕 새로운 기능:');
console.log('   • 도서 상세 페이지 (교보문고 스타일)');
console.log('   • 공감 시스템 (100공감당 100포인트)');
console.log('   • 댓글 시스템');
console.log('   • 사용자 퀴즈 생성');
console.log('   • 한줄 평 (무조건 공개)');
console.log('   • 월별 포인트 한도 (활동 10,000P + 공감 10,000P)');
