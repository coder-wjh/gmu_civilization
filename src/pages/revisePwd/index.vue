<template>
  <view class="container">
    <view class="form">
      <view class="username"><text>*</text>用户名:<input type="text" v-model="user" disabled/></view>
      <view class="oldPwd"><text>*</text>原密码:<input type="password" v-model="oldPwd"/></view>
      <view class="newPwd"><text>*</text>新密码:<input type="password" v-model="newPwd"/></view>
      <button type="primary" @click="confirm">确认</button>
    </view>
  </view>
</template>

<script>
import { changePwd } from '../../api/index'
export default {
  data() {
    return{
      user:'',
      oldPwd:'',
      newPwd:''
    }
  },
  onLoad(args) {
    this.user = args.user;
  },
  methods:{
    async confirm() {
      const {newPwd, oldPwd, user} = this;
      if(!newPwd){
        uni.showToast({
          title: '密码不能为空',
          icon: 'none'
        })
        return;
      }
      if(oldPwd === newPwd){
        uni.showToast({
          title: '原密码和新密码不能一致',
          icon: 'none'
        })
        return;
      }
      const result = await changePwd(user, oldPwd, newPwd);
      if(result.data.code == 200) {
        uni.showToast({
          title: '修改成功',
          icon: 'success'
        })
        // 修改成功返回上一页，延时调用
        setTimeout(function(){
          uni.navigateBack();
        }, 1000)
      }else if(result.data.code == 404){
        uni.showToast({
          title: '原用户名或密码错误',
          icon: 'none'
        })
        return;
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .container{
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .form{
      width: 90%;
      height: 50%;
      text{
        color:red;
      }
      input{
          border: 1rpx solid #eee;
          height: 60rpx;
          line-height: 60rpx;
          width: 80%;
          border-radius: 10rpx;
          padding: 5rpx;
        }
      .title{
        text-align: center;
        font-size: 36rpx;
        font-weight: bold;
      }
      .username{
        display: flex;
        justify-items: center;
        margin-top: 50rpx;
      }
      .oldPwd{
        display: flex;
        justify-items: center;
        margin-top: 50rpx;
      }
      .newPwd{
        display: flex;
        justify-items: center;
        margin-top: 50rpx;
      }
      button{
      width: 100%;
      padding: 0;
      margin: 0;
      font-size: 32rpx;
      border-radius: 10rpx;
      margin-top: 80rpx;
      }
    }
  }
</style>