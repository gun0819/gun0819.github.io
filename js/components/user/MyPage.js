// 마이페이지 컴포넌트
const MyPage = {
    template: `
        <div>
            <nav class="navbar">
                <div class="container">
                    <div class="navbar-brand" @click="$router.push('/dashboard')" style="cursor: pointer;">
                        📚 독서 인증 플랫폼
                    </div>
                    <div class="navbar-nav">
                        <router-link v-if="isLoggedIn" to="/my-reviews" class="nav-link">내 감상문</router-link>
                        <router-link v-if="isLoggedIn" to="/completed-quizzes" class="nav-link">내 퀴즈</router-link>
                        <div v-if="isLoggedIn" class="dropdown">
                            <a class="nav-link">포인트 ▼</a>
                            <div class="dropdown-content">
                                <router-link to="/points-exchange">포인트 교환소</router-link>
                                <router-link to="/points-history">적립 내역</router-link>
                                <router-link to="/points-requests">신청 내역</router-link>
                            </div>
                        </div>
                        <router-link v-if="isLoggedIn" to="/my-page" class="nav-link">마이페이지</router-link>
                        <template v-if="isLoggedIn">
                            <a href="#" @click.prevent="logout" class="nav-link">로그아웃</a>
                        </template>
                        <template v-else>
                            <router-link to="/signup" class="nav-link">회원가입</router-link>
                            <span style="color: #ddd; padding: 0 8px;">|</span>
                            <router-link to="/login" class="nav-link">로그인</router-link>
                        </template>
                    </div>
                </div>
            </nav>
            <div class="container">
                <div class="dashboard">
                    <div class="profile-card">
                        <div class="avatar">👤</div>
                        <h2>{{ user.nickname }}</h2>
                        <p>{{ user.email }}</p>
                    </div>
                    
                    <h2>내 정보 수정 ✏️</h2>
                    
                    <div class="form-group">
                        <label>이름</label>
                        <input type="text" v-model="editForm.name" placeholder="이름">
                    </div>
                    
                    <div class="form-group">
                        <label>닉네임</label>
                        <input type="text" v-model="editForm.nickname" placeholder="닉네임">
                        <p v-if="nicknameError" class="error">{{ nicknameError }}</p>
                    </div>
                    
                    <div class="form-group">
                        <label>핸드폰 번호</label>
                        <input type="tel" v-model="editForm.phone" placeholder="010-1234-5678">
                    </div>
                    
                    <button @click="updateProfile" class="btn btn-sm">프로필 저장</button>
                    
                    <hr style="margin: 40px 0;">
                    
                    <h3>비밀번호 변경 🔐</h3>
                    
                    <div class="form-group">
                        <label>현재 비밀번호</label>
                        <input type="password" v-model="passwordForm.current" placeholder="현재 비밀번호">
                    </div>
                    
                    <div class="form-group">
                        <label>새 비밀번호</label>
                        <input type="password" v-model="passwordForm.new" placeholder="8자 이상">
                    </div>
                    
                    <div class="form-group">
                        <label>새 비밀번호 확인</label>
                        <input type="password" v-model="passwordForm.confirm" placeholder="비밀번호 확인">
                        <p v-if="passwordForm.confirm && passwordForm.new !== passwordForm.confirm" class="error">
                            비밀번호가 일치하지 않습니다.
                        </p>
                    </div>
                    
                    <button @click="changePassword" class="btn btn-sm btn-secondary">비밀번호 변경</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            user: store.currentUser,
            editForm: {
                name: store.currentUser.name,
                nickname: store.currentUser.nickname,
                phone: store.currentUser.phone
            },
            passwordForm: {
                current: '',
                new: '',
                confirm: ''
            },
            nicknameError: ''
        };
    },
    methods: {
        updateProfile() {
            if (this.editForm.nickname !== this.user.nickname) {
                const users = store.getUsers();
                const exists = users.some(u => u.nickname === this.editForm.nickname && u.id !== this.user.id);
                if (exists) {
                    this.nicknameError = '이미 사용 중인 닉네임입니다.';
                    return;
                }
            }
            
            store.updateUser(this.user.id, {
                name: this.editForm.name,
                nickname: this.editForm.nickname,
                phone: this.editForm.phone
            });
            
            this.user = store.currentUser;
            alert('프로필이 업데이트되었습니다.');
        },
        changePassword() {
            const users = store.getUsers();
            const currentUser = users.find(u => u.id === this.user.id);
            
            if (currentUser.password !== this.passwordForm.current) {
                alert('현재 비밀번호가 일치하지 않습니다.');
                return;
            }
            
            if (this.passwordForm.new.length < 8) {
                alert('새 비밀번호는 8자 이상이어야 합니다.');
                return;
            }
            
            if (this.passwordForm.new !== this.passwordForm.confirm) {
                alert('새 비밀번호가 일치하지 않습니다.');
                return;
            }
            
            store.updateUser(this.user.id, { password: this.passwordForm.new });
            
            this.passwordForm = { current: '', new: '', confirm: '' };
            alert('비밀번호가 변경되었습니다.');
        },
        logout() {
            store.clearCurrentUser();
            this.$router.push('/login');
        }
    }
};
