<template>
  <view class="container">
    <!-- 班级名称 -->
    <view class="title">{{ className }}</view>
    <scroll-view class="scroll_content" scroll-y>
      <view
        :class="['scroll_item', item.ischeck == 'check' ? 'checkColor' : '']"
        hover-class="Active"
        v-for="item in dormList"
        :key="item.id"
        :data-tung="item.tung"
        :data-dormnum="item.dormNum"
        :data-college="item.college"
        @click="handleToRecordMsg"
      >
        {{ item.dormNum }}
        <text :class="item.ischeck == 'check' ? 'checked' : ''"></text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { teaCheckDorm } from "../../api/index";
export default {
  data() {
    return {
      checker:'',
      username: "",
      dormList: [],
      className: "",
    };
  },
  onLoad(args) {
    this.username = args.username;
    this.checker = args.checker;
  },
  onShow() {
      this.getDormList();
  },
  methods: {
    // 获取班主任角色的本班寝室列表
    async getDormList() {
      const res = await teaCheckDorm(this.username);
      const dormInfo = res.data.data2;
      // 数组去重
      const map = new Map();
      this.dormList = dormInfo.filter(
        (item) => !map.has(item.dormNum) && map.set(item.dormNum, 1)
      );
      this.className = this.dormList[0].className;
    },
    // 点击寝室号跳转至历史记录
    handleToRecordMsg(e) {
      const {dormnum,tung,college} = e.currentTarget.dataset;
      uni.navigateTo({
         url: `/pages/teaRecordMsg/index?college=${college}&className=${this.className}&tung=${tung}&dormnum=${dormnum}&checker=${this.checker}`
      });
    }
  },
};
</script>

<style scoped lang="scss">
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  .title {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e6f3f9;
  }
  .scroll_content {
    flex: 12;
    height: calc(100vh - 46.4px);
    .checkColor {
          color: gray;
        }
    .scroll_item {
      line-height: 100rpx;
      width: 100%;
      text-align: center;
      /* 完成查寝后的 √ 样式*/
      text {
        height: 15rpx;
        width: 25rpx;
        display: inline-block;
      }
      .checked {
        border: 1rpx solid #09bb07;
        border-width: 0 0 2px 2px;
        transform: rotate(-45deg);
        -ms-transform: rotate(-45deg);
        -moz-transform: rotate(-45deg);
        -webkit-transform: rotate(-45deg);
        -o-transform: rotate(-45deg);
        vertical-align: baseline;
      }
    }
  }
}
</style>