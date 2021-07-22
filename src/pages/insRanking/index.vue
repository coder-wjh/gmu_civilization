<template>
  <view class="container">
    <!-- 下拉框选择 -->
    <view class="title">
      <view class="rank"><image src="../../static/instructor/rank.png"></image></view>
      <view class="select">
        <uni-combox
          :candidates="states"
          placeholder="请选择状态"
          style="text-align:center"
          v-model="state"
        ></uni-combox>
      </view>
      <view class="btnContainer"
        ><button size="mini" @click="handleConfirm">确认</button></view
      >
    </view>
    <!-- 寝室列表 -->
    <view class="content">
      <!-- 默认信息 -->
      <view class="default" v-if="!recordList.length">
        <p>Please select state first...</p>
      </view>
      <!-- 寝室信息 -->
      <view class="dormList" v-else>
        <view class="scroll_title">
          <uni-tag text="序号" type="primary" :inverted="true"></uni-tag>
          <uni-tag text="寝室号" type="primary" :inverted="true"></uni-tag>
          <uni-tag text="次数" type="primary" :inverted="true"></uni-tag>
        </view>
        <scroll-view class="scrollView" scroll-y enable-flex>
          <view
            class="dormItem"
            hover-class="Active"
            v-for="(item, index) in recordList"
            :key="index"
            @click="handleToRecord"
            :data-dormnum="item.data2"
          >
            <view class="item">
              <uni-tag :text="index + 1" type="primary"></uni-tag>
            </view>
            <view class="item">
              <uni-tag :text="item.data2" type="success"></uni-tag>
            </view>
            <view class="item">
              <uni-tag :text="item.message" type="default"></uni-tag>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import uniCombox from "@dcloudio/uni-ui/lib/uni-combox/uni-combox.vue";
import uniTag from "@dcloudio/uni-ui/lib/uni-tag/uni-tag.vue";
import { getStateAndCount } from '../../api/index';
export default {
  components: {
    uniCombox,
    uniTag,
  },
  data() {
    return {
      states: ["优秀", "良好", "一般", "较差", "脏乱差"],
      college: "信息工程学院",
      classes: [],
      state: "",
      className: "",
      currentPage:1,
      pageSize:15,
      recordList: [], //查寝记录数组
    };
  },
  methods: {
    // 点击确定获取查寝信息
    async handleConfirm() {
      if (!this.state) {
        uni.showToast({
          title: "请先选择条件",
          icon: "none",
        });
        return;
      }
      let result = await getStateAndCount({college:this.college, state:this.state});
      if (!result.data.data3) {
        uni.showToast({
          title: "暂无数据",
          icon: "none",
        });
        this.recordList = [];
        return;
      }
      const arr = result.data.data3;
      this.recordList = arr.sort(this.handleSort("message"));
    },
    // 降序函数
    handleSort(property) {
      return function (a, b) {
        const val1 = a[property];
        const val2 = b[property];
        return val2 - val1;
      };
    },
    // 点击寝室号跳转至对应寝室查寝记录列表页面
    handleToRecord(e) {
      const { dormnum } = e.currentTarget.dataset;
      uni.navigateTo({
        url: `/pages/insRecordMsg/index?dormNum=${dormnum}&state=${this.state}&className=${this.className}`,
      });
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  .title {
    height: 80rpx;
    display: flex;
    .rank{
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
    flex: 1;
    .default {
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
      .scroll_title {
        height: 80rpx;
        display: flex;
        justify-content: space-around;
        align-items: center;
        border-bottom: 1rpx solid #666;
      }
      .scrollView {
        height: calc(100vh - 80px);
        .checkColor {
          color: gray;
        }
        .dormItem {
          height: 100rpx;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #ccc;
          .item {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }
    }
  }
}
</style>