<template>
  <view class="container">
    <view class="wrapper">
      <view class="left-top-sign">GMU</view>
      <view class="welcome"> 欢迎登录 </view>
      <view class="input-content">
        <view class="input-item">
          <image src="/static/login/user.png" />
          <input type="text" placeholder="请输入学号" v-model="username" :maxlength="maxlength"/>
        </view>
        <view class="input-item">
          <image src="/static/login/psd.png" />
          <input type="password" placeholder="请输入密码" v-model="password" :maxlength="maxlength"/>
        </view>
      </view>
      <button
        :class="['confirm-btn',username && password ? 'btn-hover' : 'btn-default',]"
        @click="login"
      >
        登录
      </button>
      <!-- <view class="revise-section"> 忘记密码 </view> -->
    </view>
    <!-- 底部注册区域 -->
    <view class="register-section">
      修改密码?
      <text @click="revise">点击登录</text>
    </view>
    <!-- 修改密码弹出层 -->
    <e-modal :visible.sync="visible">
      <view class="popup">
        <view class="info" v-if="flag"><icon type="warn" size="16"></icon>登录失败</view>
        <view class="username"><text>*</text>账号<input v-model="user" type="text"/></view>
        <view class="password"><text>*</text>密码<input v-model="pwd" type="password"/></view>
        <button type="primary" @click="Login">登录</button>
      </view>
    </e-modal>
  </view>
</template>

<script>
import { Login } from '../../api/index'
export default {
  data() {
    return {
      username: "",
      password: "",
      maxlength:15, //输入框最大输入长度
      visible: false,
      flag:false, //控制是否显示‘登录失败’
      user:"",
      pwd:""
    };
  },
  methods: {
    //点击登录
    async login() {
      const {username, password} = this;
      // 1. 收集表单项数据
      //前端验证
      if (!username) {
        //提示用户
        uni.showToast({
          title: "学号不能为空",
          icon: "none",
        });
        return;
      }
      if (!password) {
        //提示用户
        uni.showToast({
          title: "密码不能为空",
          icon: "none",
        });
        return;
      }
      //后端验证
      const result = await Login(username, password)
      if (result.data.code === "200") {
        uni.showToast({
          title: "登录成功",
        });
        uni.setStorageSync("JSESSIONID", result.cookies[0]);
        const users = result.data.data.role;
        //登录成功后跳转至选择寝室列表界面,判断角色
        // 学生登录
        if (users == "ROLE_student") {
          uni.navigateTo({
            url: `/pages/checkedlist/index?username=${this.username}`,
          });
        } else if (users == "ROLE_stucadres") {
          //学生干部
          uni.reLaunch({
            url: `/pages/insDormlist/index`,
          });
          uni.setStorageSync('checker', users);
        } else if (users == "ROLE_headmaster") {
          //班主任
          uni.navigateTo({
            url: `/pages/teaDormlist/index?username=${this.username}&checker=${users}`,
          });
        } else if (users == "ROLE_instructor") {
          //辅导员
          uni.reLaunch({
            url: `/pages/insDormlist/index`,
          });
          uni.setStorageSync('checker', users);
        }
      } else if (result.data.code === 404) {
        uni.showToast({
          title: "用户名或密码错误",
          icon: "none",
        });
      } else {
        uni.showToast({
          title: "登录失败，请重新登录",
          icon: "none",
        });
      }
    },
    // 点击修改密码,显示弹出层
    revise() {
      this.visible = true;
    },
    // 点击弹出层登录
    async Login() {
      const {user,pwd} = this;
      if (!user) {
        this.flag = true
        return;
      }
      if (!pwd) {
        this.flag = true
        return;
      }
      const result = await Login(user, pwd);
      if (result.data.code === '200') {
        //存储cookie到本地
        uni.setStorageSync("JSESSIONID", result.cookies[0]);
        uni.navigateTo({
          url: "/pages/revisePwd/index?user=" + this.user,
        });
        // 登录成功，隐藏弹出层, 并清空用户名和密码
        this.visible = false;
        this.user = '';
        this.pwd = '';
      }else {
        this.flag = true
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  padding: 200rpx 0;
  box-sizing: border-box;
  .wrapper {
    position: relative;
    z-index: 90;
    padding-bottom: 40rpx;
    .left-top-sign {
      font-size: 120rpx;
      color: #f8f8f8;
      position: relative;
      left: 0;
    }
    .welcome {
      position: relative;
      left: 50rpx;
      top: -90rpx;
      font-size: 46rpx;
      color: #555;
    }
    .input-content {
      padding: 0 60rpx;
      .input-item {
        display: flex;
        flex-direction: row;
        padding: 0 30rpx;
        background: #f8f6fc;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 10rpx;
        margin-bottom: 50rpx;
        image {
          width: 50rpx;
          height: 50rpx;
          margin-top: 15rpx;
        }
        input {
          flex: 1;
          height: 80rpx;
          line-height: 80rpx;
          font-size: 30rpx;
          width: 100%;
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    .confirm-btn {
      width: 630rpx !important;
      height: 76rpx;
      line-height: 76rpx;
      border-radius: 50rpx;
      margin-top: 70rpx;
      color: #fff;
      font-size: 32rpx;
      padding: 0;
    }
    // .revise-section {
    //   font-size: 26rpx;
    //   color: #4399fc;
    //   text-align: center;
    //   margin-top: 20rpx;
    // }
  }
  .register-section {
    position: absolute;
    left: 0;
    bottom: 40rpx;
    width: 100%;
    font-size: 24rpx;
    color: #606266;
    text-align: center;
    text {
      color: #4399fc;
      margin-left: 10rpx;
    }
  }
  // 动态添加登录按钮的背景颜色
  .btn-default {
    background-color: #aaa;
  }
  .btn-hover {
    background-color: #00702b;
  }
  // 弹出层
  .popup{
    padding: 20rpx;
    .info{
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
      color: red;
    }
    .username{
      display: flex;
      align-items: center;
		  margin-bottom: 40rpx;
      margin-top: 20rpx;
    }
    .password{
      display: flex;
      align-items: center;
      border-top: 1rpx solid #eee;
      padding-top: 40rpx;
    }
    text{
      color: red;
    }
    input{
      line-height: 60rpx;
      height: 60rpx;
      border-radius: 10rpx;
      margin-left: 20rpx;
    }
    button{
      width: 100%;
      padding: 0;
      margin: 0;
      font-size: 28rpx;
      border-radius: 10rpx;
      margin-top: 40rpx;
    }
  }
}
</style>
