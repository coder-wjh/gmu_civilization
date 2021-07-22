<template>
  <view class="container">
    <uni-search-bar
      class="uniSearch"
      :radius="100"
      :maxlength="10"
      :clearButton="none"
      placeholder="请输入合格状态"
      @input="handleInput"
      @confirm="handleSearch"
      @cancel="handleCancel"
    ></uni-search-bar>
    <view class="scroll_title">
      <!-- <text>查寝日期</text>
      <text>是否合格</text>
      <text>是否已读</text> -->
      <uni-tag text="走访时间" type="primary" :inverted="true"></uni-tag>
      <uni-tag text="合格状态" type="primary" :inverted="true"></uni-tag>
      <uni-tag text="是否已读" type="primary" :inverted="true"></uni-tag>
    </view>
    <scroll-view class="sroll_content" enable-flex scroll-y>
      <view
        class="sroll_item"
        hover-class="Active"
        @click="handleToFeedback"
        :data-id="item.id"
        v-for="(item, index) in dormInfo"
        :key="index"
      >
        <view class="item_time">
          <!-- <uni-tag :text="item.checkTime" type="primary"></uni-tag> -->
          <view class="checkTime">{{ item.checkTime }}</view>
        </view>
        <view class="item">
          <uni-tag
            v-if="item.state == '优秀'"
            text="优秀"
            type="success"
          ></uni-tag>
          <uni-tag
            v-else-if="item.state == '良好'"
            text="良好"
            type="success"
          ></uni-tag>
          <uni-tag
            v-else-if="item.state == '一般'"
            text="一般"
            type="success"
          ></uni-tag>
          <uni-tag
            v-else-if="item.state == '较差'"
            text="较差"
            type="warning"
          ></uni-tag>
          <uni-tag v-else text="脏乱差" type="error"></uni-tag>
        </view>
        <view class="item">
          <uni-tag
            v-if="item.stuReadIt == 'read'"
            text="已读"
            type="default"
          ></uni-tag>
          <uni-tag v-else text="未读" type="warning"></uni-tag>
        </view>
      </view>
    </scroll-view>
    <view class="pagination">
      <uni-pagination
        show-icon="true"
        :total="total"
        :pageSize="pageSize"
        :current="currentPage"
        @change="handlePageChange"
      ></uni-pagination>
    </view>
  </view>
</template>

<script>
import uniSearchBar from "@dcloudio/uni-ui/lib/uni-search-bar/uni-search-bar.vue";
import uniTag from "@dcloudio/uni-ui/lib/uni-tag/uni-tag.vue";
import uniPagination from "@dcloudio/uni-ui/lib/uni-pagination/uni-pagination.vue";
import { stuGetRecord, searchDormRecord, changeRead } from "../../api/index";
export default {
  components: {
    uniSearchBar,
    uniTag,
    uniPagination,
  },
  data() {
    return {
      username: "",
      dormInfo: [], //学生账号查寝信息数组
      checkedInfo: [],
      queryObj: {}, //修改已读状态所需的参数
      value: "", //搜索框输入内容
      searchObj: {}, //搜索参数对象
      currentPage: 1,
      pageSize: 15,
      total: 0,
      flag: true, //控制点击上一页/下一页发送哪个请求
    };
  },
  //监听页面加载
  onLoad(options) {
    this.username = options.username;
    this.dormNum = options.dormNum;
    this.state = options.state;
    this.getCheckList();
  },
  onShow() {
    if (this.flag) {
      this.getCheckList();
    } else {
      this.handleSearch();
    }
  },
  methods: {
    //学生账号获取查寝记录的方法
    async getCheckList() {
      let res = await stuGetRecord(
        this.username,
        this.currentPage,
        this.pageSize
      );
      this.dormInfo = res.data.data2;
      this.total = res.data.data3;
      /*  const array = res.data.data2;
      // 去掉时间，保留日期
      for(let i in array){
        array[i].checkTime=array[i].checkTime.substring(0,10);  
      }
      this.dormInfo = array; */
    },
    //监听搜索框的输入
    handleInput(e) {
      this.value = e.value;
    },
    IsInArray(arr, val) {
      var testStr = "," + arr.join(",") + ",";
      return testStr.indexOf("," + val + ",") != -1;
    },
    //回车确认搜索
    async handleSearch(e) {
      const array = ["优秀", "良好", "一般", "较差", "脏乱差"];
      const flag = this.IsInArray(array, this.value);
      if (!flag) {
        wx.showToast({
          title: "输入不合法",
          icon: "none",
        });
        return;
      } else {
        const state = this.value;
        const dormNum = this.dormInfo[0].dormNum;
        const result = await searchDormRecord(
          state,
          dormNum,
          this.currentPage,
          this.pageSize
        );
        this.dormInfo = result.data.data2;
        // 搜索请求成功后，使flag变为false
        this.flag = false;
        this.total = result.data.data;
      }
    },
    //点击取消按钮
    async handleCancel() {
      // 使flag变为true，之后点击上一页/下一页就是全部的数据
      this.flag = true;
      this.getCheckList();
    },
    //点击跳转到反馈页面 发送请求修改是否已读状态
    async handleToFeedback(e) {
      const id = e.currentTarget.dataset.id;
      this.dormInfo.some((item) => {
        if (item.id == id) {
          this.queryObj = item;
        }
      });
      // 发送请求修改已读未读状态
      await changeRead({ ...this.queryObj });
      // 将点击的对应查寝对象保存到本地
      uni.setStorageSync("checkedInfo", this.queryObj);
      uni.navigateTo({
        url: `/pages/feedback/index?`,
      });
    },
    //点击页码按钮时触发
    handlePageChange(e) {
      this.currentPage = e.current;
      if (this.flag) {
        this.getCheckList();
      } else {
        this.handleSearch();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  .uniSearch {
    width: 100%;
    height: 80rpx;
  }
  .scroll_title {
    height: 100rpx;
    width: 100%;
    padding-bottom: 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-bottom: 1rpx solid #666;
  }
  .sroll_content {
    flex: 1;
    height: calc(100vh - 132px);
    .sroll_item {
      height: 94rpx;
      width: 100%;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #ccc;
      .item_time {
        flex: 1;
        font-size: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        .checkTime {
          text-align: center;
          color: #fff;
          line-height: 70rpx;
          background-color: #007aff;
          border-radius: 6rpx;
        }
      }
      .item {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .pagination {
    background-color: #f8f8f8;
  }
}
</style>
