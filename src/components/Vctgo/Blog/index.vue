<template>
  <div>
    <svg-icon icon-class="form" @click="goto" />
  </div>
</template>

<script>
export default {
  name: 'VctgoBlog',
  data() {
    return {
      url: 'https://www.hist.edu.cn/'  //http://wenhui.huizhidata.com/
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>
