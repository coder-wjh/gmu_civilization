<template>
  <view class="upimgContainer">
    <image class="image" :src="src" />
    <icon class="icon" type="clear" size="20" color="red" />
  </view>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      default: ""
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
.upimgContainer {
  width: 120rpx;
  height: 120rpx;
  position: relative;
  .image {
    width: 100%;
    height: 100%;
    border-radius: 15rpx;
  }
  .icon {
    position: absolute;
    top: -22rpx;
    right: -22rpx;
  }
}
</style>