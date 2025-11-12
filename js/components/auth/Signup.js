// 회원가입 컴포넌트
const Signup = {
    template: `
        <div class="login-container">
            <div class="login-box">
                <h1>📚 회원가입</h1>
                <div v-if="errorMessage" class="alert-box danger">{{ errorMessage }}</div>
                <form @submit.prevent="handleSignup">
                    <div class="form-group">
                        <label>사용자 유형</label>
                        <select v-model="userType">
                            <option value="user">일반 사용자</option>
                            <option value="admin">관리자</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>이름 *</label>
                        <input type="text" v-model="name" required placeholder="홍길동">
                    </div>
                    <div class="form-group">
                        <label>닉네임 *</label>
                        <input type="text" v-model="nickname" required placeholder="독서왕">
                    </div>
                    <div class="form-group">
                        <label>이메일 *</label>
                        <input type="email" v-model="email" required placeholder="email@example.com">
                    </div>
                    <div class="form-group">
                        <label>핸드폰 번호 *</label>
                        <input type="tel" v-model="phone" required placeholder="010-1234-5678">
                    </div>
                    <div class="form-group">
                        <label>비밀번호 (8자 이상) *</label>
                        <input type="password" v-model="password" required minlength="8">
                    </div>
                    <div class="form-group">
                        <label>비밀번호 확인 *</label>
                        <input type="password" v-model="passwordConfirm" required>
                    </div>
                    <button type="submit" class="btn">회원가입</button>
                </form>
                <div class="link-text">
                    이미 계정이 있으신가요? <router-link to="/login">로그인</router-link>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            name: '',
            nickname: '',
            email: '',
            phone: '',
            password: '',
            passwordConfirm: '',
            userType: 'user',
            errorMessage: ''
        };
    },
    methods: {
        handleSignup() {
            if (this.password !== this.passwordConfirm) {
                this.errorMessage = '비밀번호가 일치하지 않습니다.';
                return;
            }
            
            if (store.findUserByEmail(this.email)) {
                this.errorMessage = '이미 등록된 이메일입니다.';
                return;
            }

            const newUser = {
                id: Date.now(),
                name: this.name,
                nickname: this.nickname,
                email: this.email,
                phone: this.phone,
                password: this.password,
                type: this.userType,
                createdAt: new Date().toISOString()
            };

            store.addUser(newUser);
            alert('회원가입이 완료되었습니다! 로그인해주세요.');
            this.$router.push('/login');
        }
    }
};
