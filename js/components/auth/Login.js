// 로그인 컴포넌트
const Login = {
    template: `
        <div class="login-container">
            <div class="login-box">
                <h1>📚 독서 인증 플랫폼</h1>
                <div v-if="errorMessage" class="alert-box danger">{{ errorMessage }}</div>
                <form @submit.prevent="handleLogin">
                    <div class="form-group">
                        <label>이메일</label>
                        <input type="email" v-model="email" required placeholder="email@example.com">
                    </div>
                    <div class="form-group">
                        <label>비밀번호</label>
                        <input type="password" v-model="password" required placeholder="비밀번호를 입력하세요">
                    </div>
                    <button type="submit" class="btn">로그인</button>
                </form>
                <div class="link-text">
                    <router-link to="/find-account">아이디 찾기</router-link> | 
                    <router-link to="/find-password">비밀번호 찾기</router-link>
                </div>
                <div class="link-text">
                    계정이 없으신가요? <router-link to="/signup">회원가입</router-link>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            errorMessage: ''
        };
    },
    methods: {
        handleLogin() {
            const user = store.findUserByEmail(this.email);
            
            if (!user) {
                this.errorMessage = '등록되지 않은 이메일입니다.';
                return;
            }
            
            if (user.password !== this.password) {
                this.errorMessage = '비밀번호가 일치하지 않습니다.';
                return;
            }

            const loginUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                nickname: user.nickname,
                phone: user.phone,
                type: user.type,
                points: store.getUserPoints(user.email)
            };
            
            store.setCurrentUser(loginUser);
            
            if (user.type === 'admin') {
                this.$router.push('/admin');
            } else {
                this.$router.push('/dashboard');
            }
        }
    }
};
