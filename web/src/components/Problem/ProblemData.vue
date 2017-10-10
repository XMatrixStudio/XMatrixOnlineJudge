<template>
  <div>
    <el-card>
      <el-tag>#{{problemData.pid}}</el-tag>
      <span class="title">{{problemData.title}}</span>
      <el-form label-position="left" inline class="demo-table-expand">
        <el-form-item label="类型">
          <span>{{ problemData.class }}</span>
        </el-form-item>
        <el-form-item label="出题人">
          <span>{{ problemData.authorName }}</span>
        </el-form-item>
        <el-form-item label="通过数">
          <span>{{problemData.ACCounts}} ({{Math.ceil(problemData.ACCounts / problemData.JudgeCounts * 1000)/10}}%)</span>
        </el-form-item>
        <el-form-item label="评测数">
          <span>{{ problemData.JudgeCounts }}</span>
        </el-form-item>
        <el-form-item label="标签">
          <span>
            <el-tag v-for="(tag,index) in problemData.tags" :key="index" type="success" close-transition>{{tag}}</el-tag>
          </span>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card>
      <div id="markdownBox" class="markdown-body" v-html="compiledMarkdown"></div>
    </el-card>
  </div>
</template>

<script>
import marked from 'marked';
export default {
  data() {
    return {
      markdown: 'Loading...',
      problemData: {
        "_id": "59ab7437e6010858e5b04152",
        "pid": 10000,
        "class": "编程题",
        "category": "algorithms",
        "tags": ['数据结构', '并查集', '输入输出'],
        "title": "Hello, world",
        "authorName": "MegaShow",
        "ACCounts": 10,
        "JudgeCounts": 38,
        "__v": 0,

      }
    }
  },
  computed: {
    compiledMarkdown: function() {
      return marked(this.markdown, { sanitize: true })
    }
  },
  methods: {
    async init() {
      marked.setOptions({
        highlight: function(code) {
          return require('highlight.js').highlightAuto(code).value;
        }
      });
      let markdown_t = await this.$https.get('/static/problems/10000.md');
      this.markdown = markdown_t.data;
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="scss">
.problem_detail .el-card {
  margin-bottom: 10px;
}

.title {
  margin-top: 0;
  font-size: 30px;
  vertical-align: top;
}

.el-form-item {
  width: 45%;
  margin-right: 0;
  margin-bottom: 0;
}

.el-form-item__label {
  width: 90px;
  color: #99a9bf;
}

.el-card__body .el-tag {
  margin-top: 12px;
  margin-right: 10px;
}
</style>
