// 아이디 찾기 컴포넌트
const FindAccount = {
    template: `
        <div class="login-container">
            <div class="login-box">
                <h1>🔍 아이디 찾기</h1>
                <div v-if="!verified">
                    <p style="color: #666; margin-bottom: 20px;">등록된 핸드폰 번호로 인증하세요.</p>
                    <div class="form-group">
                        <label>핸드폰 번호</label>
                        <input type="tel" v-model="phone" placeholder="010-1234-5678">
                    </div>
                    <button @click="sendVerificationCode" class="btn" :disabled="!phone || codeSent">
                        {{ codeSent ? '인증번호 발송됨' : '인증번호 받기' }}
                    </button>
                    
                    <div v-if="codeSent" style="margin-top: 20px;">
                        <div class="alert-box success">
                            인증번호가 {{ phone }}로 발송되었습니다. (시뮬레이션: {{ verificationCode }})
                        </div>
                        <div class="form-group">
                            <label>인증번호</label>
                            <input type="text" v-model="inputCode" placeholder="6자리 숫자" maxlength="6">
                        </div>
                        <button @click="verifyCode" class="btn">인증 확인</button>
                    </div>
                </div>
                
                <div v-else>
                    <div class="alert-box success">
                        <strong>찾은 아이디:</strong><br>
                        {{ foundEmail }}
                    </div>
                    <button @click="$router.push('/login')" class="btn">로그인하기</button>
                </div>
                
                <div class="link-text">
                    <router-link to="/login">로그인으로 돌아가기</router-link>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            phone: '',
            codeSent: false,
            verificationCode: '',
            inputCode: '',
            verified: false,
            foundEmail: ''
        };
    },
    methods: {
        sendVerificationCode() {
            const user = store.findUserByPhone(this.phone);
            if (!user) {
                alert('등록된 핸드폰 번호가 아닙니다.');
                return;
            }
            
            this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            this.codeSent = true;
            console.log('인증번호:', this.verificationCode);
        },
        verifyCode() {
            if (this.inputCode === this.verificationCode) {
                const user = store.findUserByPhone(this.phone);
                this.foundEmail = user.email;
                this.verified = true;
            } else {
                alert('인증번호가 일치하지 않습니다.');
            }
        }
    }
};
