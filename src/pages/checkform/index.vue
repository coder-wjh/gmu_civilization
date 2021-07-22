<template>
  <!-- pages/form/form.wxml -->
  <view class="form_container">
    <view class="title">寝室:{{ dormnum }}</view>
    <view class="content">
      <view class="basicInfo">
        <!-- 下拉选择学院 -->
        <view class="selectCollege">
          <view><text class="icon">*</text>学院信息:</view>
          <!-- <uni-combox
          class="combox"
          :candidates="collegeList"
          placeholder="请选择学院信息"
          v-model="college"
        ></uni-combox> -->
          <view class="college">{{ college }}</view>
        </view>
        <!-- 寝室人员 -->
        <view class="dormNumber">
          <text class="icon">*</text>
          寝室成员:
          <text v-for="item in dormNumber" :key="item.id">{{ item.name }}</text>
        </view>
        <!-- 班级 -->
        <view class="className">
          <text class="icon">*</text>
          <text class="item_title">寝室班级:</text>
          <text>{{ className }}</text>
        </view>
        <!-- 查寝时间 -->
        <view class="currentTime">
          <text class="icon">*</text>
          <view class="time_title">查寝时间:</view>
          <text>{{ checkTime }}</text>
        </view>
        <!-- 选择是否合格 -->
        <view class="selection_group">
          <view class="section_title"
            ><text class="icon">*</text> 是否合格:
            <icon type="info" color="gray" size="12" />
            <text class="tip">较差/脏乱差均为不合格</text>
          </view>
          <radio-group name="evaluation" @change="selectedRadio">
            <label><radio checked="true" value="优秀" />优秀 </label>
            <label><radio value="良好" /> 良好</label>
            <label><radio value="一般" />一般</label>
            <label><radio value="较差" />较差</label>
            <label><radio value="脏乱差" />脏乱差</label>
          </radio-group>
        </view>
      </view>
      <view class="checkInfo">
        <!-- 合格区域 -->
        <block v-if="qualified">
          <!-- 详细描述 -->
          <view class="des_group">
            <view class="des_title">合格描述:</view>
            <view class="textarea_container">
              <textarea
                :maxlength="50"
                placeholder="请输入..."
                v-model="qualifiedDescribe"
              ></textarea>
            </view>
          </view>
          <!-- 上传图片 -->
          <view class="img_group">
            <view class="img_title"
              >合格图片:
              <icon type="info" color="gray" size="12" />
              <text class="tip">点击可预览图片,长按可选择删除</text>
            </view>
            <view class="img_wrap">
              <button type="default" @click="handleChooseImg">+</button>
              <view
                class="upimgWrap"
                v-for="(item, index) in chooseImgs"
                :key="index"
                @click="previewBigImg"
                @longpress="longpressImg"
                :data-index="index"
              >
                <upload-imgs :src="item"></upload-imgs>
              </view>
            </view>
          </view>
        </block>
        <!-- 不合格区域 -->
        <block v-else>
          <!-- 详细描述 -->
          <view class="des_group">
            <view class="des_title"
              ><text class="icon">*</text>不合格描述:</view
            >
            <view class="textarea_container">
              <textarea
                :maxlength="50"
                placeholder="请输入..."
                v-model="unqualifiedDescribe"
              ></textarea>
            </view>
          </view>
          <!-- 上传图片 -->
          <view class="img_group">
            <view class="img_title"
              ><text class="icon">*</text>不合格图片:
              <icon type="info" color="gray" size="12" />
              <text class="tip">点击可预览图片,长按可选择删除</text>
            </view>
            <view class="img_wrap">
              <button type="default" @click="handleChooseImg">+</button>
              <view
                class="upimgWrap"
                v-for="(item, index) in unChooseImgs"
                :key="index"
                @click="previewBigImg"
                @longpress="longpressImg"
                :data-index="index"
              >
                <upload-imgs :src="item"></upload-imgs>
              </view>
            </view>
          </view>
        </block>
      </view>
    </view>
    <!-- 提交/重置 -->
    <view class="last_group">
      <button type="default" @click="reset">重置</button>
      <button type="primary" @click="commit">提交</button>
    </view>
  </view>
</template>

<script>
import uniCombox from "@dcloudio/uni-ui/lib/uni-combox/uni-combox.vue";
import UploadImgs from "../../components/UploadImgs/UploadImgs";
import util from "../../utils/util";
import { getDormNum, insertCheckdorm } from "../../api/index";
export default {
  components: {
    uniCombox,
    UploadImgs
  },
  data() {
    return {
      checker: "", //查寝角色
      checkTime: null, //当前时间
      dormnum: "", //寝室id
      tung: "", //寝室栋数
      // collegeList: "", //dorm页面发送来的学院信息数组
      className: "",
      dormNumber: [], //寝室成员信息
      college: "", //用户点击选择的学院
      isSelected: true, //默认优秀
      state: "优秀", //合格状态: '优秀'/ '良好' / '一般'/ '较差' / '脏乱差',
      qualified: true, //是否合格
      qualifiedDescribe: "", //合格描述
      unqualifiedDescribe: "", //不合格描述
      chooseImgs: [], //被选中的合格图片路径数组
      unChooseImgs: [],
      uploadImgs: [], //上传后的合格图片路径
      unUploadImgs: [],
      qualifiedPicture: "", //需提交的图片路径参数
      unqualifiedPicture: ""
    };
  },

  //生命周期函数
  onLoad(args) {
    // 获取当前时间
    this.checkTime = util.formatTime(new Date());

    //接收dorm页发送的信息
    const eventChannel = this.getOpenerEventChannel();
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on("acceptDataFromOpenerPage", data => {
      this.tung = data.tung;
      this.dormnum = data.dormnum;
      this.college = data.college;
      this.className = data.className;
      this.checker = data.checker;
    });
    // 调用获取成员函数
    setTimeout(() => {
      this.getDormNumber();
    }, 100);
  },
  methods: {
    // 获取寝室成员
    async getDormNumber() {
      const result = await getDormNum(this.dormnum);
      if (result.data.code == 200) {
        this.dormNumber = result.data.data3;
      } else {
        uni.showToast({
          title: "获取寝室成员失败~",
          icon: "none"
        });
      }
    },
    // 监听radio-group选中项发生变化时触发change事件
    selectedRadio(e) {
      this.state = e.detail.value;
      if (e.detail.value == "较差" || e.detail.value == "脏乱差") {
        this.qualified = false;
      } else {
        this.qualified = true;
      }
      //切换后清空表单数据
      this.unqualifiedDescribe = "";
      this.unChooseImgs = [];
      this.unUploadImgs = [];
      this.qualifiedDescribe = "";
      this.chooseImgs = [];
      this.uploadImgs = [];
    },
    //点击+号， 选择图片并自动上传
    handleChooseImg() {
      if (this.chooseImgs.length > 2 || this.unChooseImgs.length > 2) {
        uni.showToast({
          title: "最多上传3张图片哦~",
          duration: 2000,
          icon: "none"
        });
        return;
      }
      uni.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: imageRes => {
          //获取本地存储的cookie
          let JSESSIONID = uni
            .getStorageSync("JSESSIONID")
            .split(";")[0]
            .split("=")[1];
          let cookie = "JSESSIONID=" + JSESSIONID;
          //将选择的图片保存在数组中
          if (this.qualified) {
            this.chooseImgs = [...this.chooseImgs, ...imageRes.tempFilePaths];
          } else {
            this.unChooseImgs = [
              ...this.unChooseImgs,
              ...imageRes.tempFilePaths
            ];
          }
          // 上传图片
          const tempFilePaths = imageRes.tempFilePaths;
          uni.uploadFile({
            url: "https://cxcy.gmu.cn/score/tupian",
            header: {
              "content-type": "multipart/form-data",
              cookie: cookie
            },
            filePath: tempFilePaths[tempFilePaths.length - 1],
            name: "file",
            success: res => {
              const result = JSON.parse(res.data);
              if (result.code == 200) {
                let url = result.data;
                // 将上传图片后得到的路径保存在数组中
                if (this.qualified) {
                  this.uploadImgs.push(url);
                } else {
                  this.unUploadImgs.push(url);
                }
              } else {
                uni.showToast({
                  title: "图片上传失败",
                  icon: "none"
                });
              }
            }
          });
        }
      });
    },
    //点击图片预览大图
    previewBigImg(e) {
      const _this = this;
      const index = e.currentTarget.dataset.index;
      if (this.qualified) {
        uni.previewImage({
          current: index, // 当前显示图片的http链接
          urls: _this.chooseImgs // 需要预览的图片http链接列表
        });
      } else {
        uni.previewImage({
          current: index, // 当前显示图片的http链接
          urls: _this.unChooseImgs // 需要预览的图片http链接列表
        });
      }
    },
    //长按图片选择是否删除
    longpressImg(e) {
      const _this = this;
      const index = e.currentTarget.dataset.index; //获取当前长按图片下标
      if (this.qualified) {
        uni.showModal({
          title: "提示",
          content: "确认要删除该图片吗?",
          success: function(res) {
            if (res.confirm) {
              _this.chooseImgs.splice(index, 1);
              _this.uploadImgs.splice(index, 1);
            } else if (res.cancel) {
              return false;
            }
          }
        });
      } else {
        uni.showModal({
          title: "提示",
          content: "确认要删除该图片吗?",
          success: function(res) {
            if (res.confirm) {
              _this.unChooseImgs.splice(index, 1);
              _this.unUploadImgs.splice(index, 1);
            } else if (res.cancel) {
              return false;
            }
          }
        });
      }
    },
    //点击重置按钮
    reset() {
      uni.showModal({
        title: "提示",
        content: "确认要重置吗",
        success: res => {
          if (res.confirm) {
            this.qualifiedDescribe = "";
            this.unqualifiedDescribe = "";
            this.chooseImgs = [];
            this.unChooseImgs = [];
          } else if (res.cancel) {
            return;
          }
        }
      });
    },
    //点击提交表单数据
    commit() {
      // 将添加的图片路径从数组中获取出来
      if (this.uploadImgs.length) {
        this.qualifiedPicture = this.uploadImgs.join(",");
      } else {
        this.unqualifiedPicture = this.unUploadImgs.join(",");
      }
      // 发送请求
      if (this.qualified) {
        //合格
        uni.showModal({
          title: "提示",
          content: "确认提交吗？",
          success: async res => {
            if (res.confirm) {
              //用户点击确定
              let result = await insertCheckdorm(
                this.tung,
                this.dormnum,
                this.checkTime,
                this.college,
                this.className,
                this.state,
                this.qualifiedDescribe,
                this.unqualifiedDescribe,
                this.qualifiedPicture,
                this.unqualifiedPicture,
                this.checker
              );
              if (result.data.code == 200) {
                uni.showToast({
                  title: "提交成功~",
                  icon: "success"
                });
                //提交成功后跳转到寝室列表页面
                setTimeout(() => {
                  uni.navigateBack({
                    delta: 2
                  });
                }, 300);
              } else {
                uni.showToast({
                  title: "提交失败~",
                  icon: "none"
                });
                return;
              }
            } else if (res.cancel) {
              // 用户点击取消
              return;
            }
          }
        });
      } else {
        //不合格，需要描述和上传图片
        if (!this.unqualifiedDescribe.trim()) {
          uni.showToast({
            title: "请先添加描述！",
            icon: "none"
          });
          return;
        }
        if (!this.unUploadImgs.length) {
          uni.showToast({
            title: "请先上传图片！",
            icon: "none"
          });
          return;
        }
        uni.showModal({
          title: "提交",
          content: "确认提交吗？",
          success: async res => {
            if (res.confirm) {
              //用户点击确定
              let result = await insertCheckdorm(
                this.tung,
                this.dormnum,
                this.checkTime,
                this.college,
                this.className,
                this.state,
                this.qualifiedDescribe,
                this.unqualifiedDescribe,
                this.qualifiedPicture,
                this.unqualifiedPicture,
                this.checker
              );
              if (result.data.code == 200) {
                uni.showToast({
                  title: "提交成功",
                  icon: "success"
                });
                //提交成功后跳转到寝室列表页面
                setTimeout(() => {
                  uni.navigateBack({
                    delta: 2
                  });
                }, 300);
              } else {
                uni.showToast({
                  title: "提交失败~",
                  icon: "none"
                });
              }
            } else if (res.cancel) {
              // 用户点击取消
              return;
            }
          }
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.form_container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #eee;
  .title {
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background-color: #fff;
  }
  .content {
    .icon {
      color: red !important;
    }
    .tip {
      color: #666;
      font-size: 24rpx;
    }
    flex: 8;
    display: flex;
    flex-direction: column;
    padding: 0 10rpx;
    .basicInfo {
      flex: 2;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      padding:0 8rpx;
      border-radius: 6rpx;
      margin: 10rpx 0;
      .selectCollege {
        flex: 1;
        display: flex;
        align-items: center;
        view {
          color: #000;
        }
        .college {
          margin-left: 20rpx;
        }
      }
      .dormNumber {
        flex: 1;
        display: flex;
        align-items: center;
        text:not(:first-child) {
          margin-left: 20rpx;
        }
      }
      .currentTime {
        flex: 1;
        display: flex;
        align-items: center;
        .time_title {
          margin-right: 20rpx;
        }
      }
      .className {
        flex: 1;
        display: flex;
        align-items: center;
        .item_title {
          margin-right: 20rpx;
        }
      }
      .selection_group {
        flex: 2;
        .section_title {
          padding-bottom: 20rpx;
        }
        radio-group {
          margin-left: 10rpx;
        }
        label {
          margin-right: 12rpx;
        }
      }
    }
    .checkInfo {
      flex: 3;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      border-radius: 6rpx;
      padding:0 8rpx;
      /* 描述区域 */
      .des_group {
        flex: 3;
        width: 100%;
        .des_title {
          width: 100%;
          height: 80rpx;
          line-height: 80rpx;
        }
        .textarea_container {
          padding: 30rpx;
          box-sizing: border-box;
          font-size: 32rpx;
          height: 200rpx;
          border: 1px solid #ccc;
          border-radius: 10rpx;
          textarea {
            width: 100%;
            height: 100%;
          }
        }
      }
      /* 上传图片区域 */
      .img_group {
        flex: 3;
        width: 100%;
        .img_title {
          width: 100%;
          height: 80rpx;
          line-height: 80rpx;
        }
        .img_wrap {
          height: 200rpx;
          border: 1rpx solid #ccc;
          border-radius: 10rpx;
          padding-left: 30rpx;
          display: flex;
          align-items: center;
          button {
            width: 120rpx;
            height: 120rpx;
            color: #ccc;
            font-size: 60rpx;
            text-align: center;
            line-height: 120rpx;
            margin: 0;
            padding: 0;
          }
          .upimgWrap {
            margin-left: 30rpx;
          }
        }
      }
    }
  }
  /* 提交/返回区域 */
  .last_group {
    flex: 1;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin-top: 10rpx;
    background-color: #fff;
    button {
      width: 44%;
      margin: 10rpx 0;
      padding: 0;
      font-size: 32rpx;
    }
  }
}
</style>
