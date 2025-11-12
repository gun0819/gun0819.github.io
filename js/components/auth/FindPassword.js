// 비밀번호 찾기 컴포넌트
const FindPassword = {
    template: `
        <div class="login-container">
            <div class="login-box">
                <h1>🔑 비밀번호 찾기</h1>
                <div v-if="step === 1">
                    <p style="color: #666; margin-bottom: 20px;">이메일과 핸드폰 번호를 입력하세요.</p>
                    <div class="form-group">
                        <label>이메일</label>
                        <input type="email" v-model="email" placeholder="email@example.com">
                    </div>
                    <div class="form-group">
                        <label>핸드폰 번호</label>
                        <input type="tel" v-model="phone" placeholder="010-1234-5678">
                    </div>
                    <button @click="sendVerificationCode" class="btn" :disabled="!email || !phone">
                        인증번호 받기
                    </button>
                </div>
                
                <div v-else-if="step === 2">
                    <div class="alert-box success">
                        인증번호가 {{ phone }}로 발송되었습니다. (시뮬레이션: {{ verificationCode }})
                    </div>
                    <div class="form-group">
                        <label>인증번호</label>
                        <input type="text" v-model="inputCode" placeholder="6자리 숫자" maxlength="6">
                    </div>
                    <button @click="verifyCode" class="btn">인증 확인</button>
                </div>
                
                <div v-else-if="step === 3">
                    <p style="color: #666; margin-bottom: 20px;">새로운 비밀번호를 설정하세요.</p>
                    <div class="form-group">
                        <label>새 비밀번호</label>
                        <input type="password" v-model="newPassword" minlength="8" placeholder="8자 이상">
                    </div>
                    <div class="form-group">
                        <label>비밀번호 확인</label>
                        <input type="password" v-model="confirmPassword" placeholder="비밀번호 확인">
                        <p v-if="confirmPassword && newPassword !== confirmPassword" class="error">
                            비밀번호가 일치하지 않습니다.
                        </p>
                    </div>
                    <button @click="resetPassword" class="btn" 
                            :disabled="!newPassword || newPassword !== confirmPassword || newPassword.length < 8">
                        비밀번호 변경
                    </button>
                </div>
                
                <div class="link-text">
                    <router-link to="/login">로그인으로 돌아가기</router-link>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            step: 1,
            email: '',
            phone: '',
            verificationCode: '',
            inputCode: '',
            newPassword: '',
            confirmPassword: '',
            userId: null
        };
    },
    methods: {
        sendVerificationCode() {
            const user = store.findUserByEmail(this.email);
            if (!user) {
                alert('등록되지 않은 이메일입니다.');
                return;
            }
            
            if (user.phone !== this.phone) {
                alert('이메일과 핸드폰 번호가 일치하지 않습니다.');
                return;
            }
            
            this.userId = user.id;
            this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            this.step = 2;
            console.log('인증번호:', this.verificationCode);
        },
        verifyCode() {
            if (this.inputCode === this.verificationCode) {
                this.step = 3;
            } else {
                alert('인증번호가 일치하지 않습니다.');
            }
        },
        resetPassword() {
            store.updateUser(this.userId, { password: this.newPassword });
            alert('비밀번호가 변경되었습니다. 로그인해주세요.');
            this.$router.push('/login');
        }
    }
};
