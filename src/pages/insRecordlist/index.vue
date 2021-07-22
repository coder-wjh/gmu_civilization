<template>
  <view class="container">
    <!-- 下拉框选择 -->
    <view class="title">
      <view class="classes"><image src="../../static/instructor/class.png"></image></view>
      <view class="select">
        <uni-combox 
          :candidates="classes" 
          placeholder="请选择班级"
          style="text-align:center"
          v-model="className">
        </uni-combox>
      </view>
      <view class="btnContainer"><button size="mini" @click="handleConfirm">确认</button></view>
    </view>
    <!-- 寝室列表 -->
    <view class="content">
      <!-- 默认信息 -->
      <view class="default" v-if="!recordList.length">
        <p>Please select className first...</p>
      </view>
      <!-- 寝室信息 -->
      <view class="dormList" v-else>
        <scroll-view class="scrollView" scroll-y>
          <view
            class='dormItem'
            hover-class="Active"
            v-for="item in recordList"
            :key="item.code"
            @click="handleToRecord"
            :data-dormnum = "item.data2"
          >
            {{ item.data2}}
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import uniCombox from "@dcloudio/uni-ui/lib/uni-combox/uni-combox.vue";
import { findAllClass, getStateAndCount } from '../../api/index'
export default {
  components: {
    uniCombox
  },
  data() {
    return {
      states: ["优秀", "良好", "一般", "较差", "脏乱差"],
      college:'信息工程学院',
      classes:[],
      state: '',
      className:'',
      recordList:[], //查寝记录数组
    };
  },
  onLoad(args) {
    this.getClasses();
  },
  methods: {
    // 获取学院所有班级
    async getClasses() {
      const result = await findAllClass({college:'信息工程学院', position:'辅导员'});
      this.classes = result.data.data;
    },
    // 点击确定获取查寝信息
    async handleConfirm() {
      if(this.className){
        const result = await getStateAndCount({college:this.college, className:this.className});
        if(!result.data.data3){
          uni.showToast({
            title: '暂无数据',
            icon: 'none'
          })
          this.recordList = [];
          return;
        }
        this.recordList= result.data.data3;
      }else{
        uni.showToast({
          title: '请先选择班级',
          icon: 'none'
        })
        return;
      }
    },
    // 点击寝室号跳转至对应寝室查寝记录列表页面
    handleToRecord(e) {
      const {dormnum} = e.currentTarget.dataset;
      uni.navigateTo({
         url: `/pages/insRecordMsg/index?dormNum=${dormnum}&state=${this.state}&className=${this.className}`
      });
    }

  }
};
</script>

<style scoped lang="scss"> 
.container{
  height: 100%;
  display: flex;
  flex-direction: column;
  .title {
    height: 80rpx;
    display: flex;
    .classes{
      flex: 2;
      display: flex;
      justify-content: center;
      align-items: center;
      image{
        height: 60rpx;
        width: 60rpx;
      }
    }
    .select {
      flex: 6;
    }
    .btnContainer {
      flex: 2;
      display: flex;
      align-items: center;
    }
  }
  .content {
    height: calc(100vh - 40px);
    .default {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #c2c2c2;
      font-size: 32rpx;
      font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
        sans-serif;
    }
    .dormList {
      .title {
        background-color: #e6f3f9;
        height: 80rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        text{
          color:#007AFF;
        }
      }
      .scrollView {
        height: calc(100vh - 40px);
        .checkColor {
          color: gray;
        }
        .dormItem {
          height: 100rpx;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
}
</style>