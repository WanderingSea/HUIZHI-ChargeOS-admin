<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script>
export default {
  name: 'VctgoDoc',
  data() {
    return {
      url: 'https://www.hist.edu.cn/'  //http://doc.huizhidata.com/
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>
