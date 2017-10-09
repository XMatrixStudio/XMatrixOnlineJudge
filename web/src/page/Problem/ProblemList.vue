<template>
  <el-row :gutter="10">
    <el-col :xs="{span: 22, offset: 1}" :span="18" :offset="3">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane v-for="(tab, index) in problem" :label="tab.name" :name="'tab' + index" :key="index">
          <el-table :data="tab.content" style="width: 100%">
            <el-table-column type="expand">
              <template scope="props">
                <el-form label-position="left" inline class="demo-table-expand">
                  <el-form-item label="题目">
                    <span>{{ props.row.title }}</span>
                  </el-form-item>
                  <el-form-item label="所属店铺">
                    <span>{{ props.row.shop }}</span>
                  </el-form-item>
                  <el-form-item label="商品 ID">
                    <span>{{ props.row.id }}</span>
                  </el-form-item>
                  <el-form-item label="店铺 ID">
                    <span>{{ props.row.shopId }}</span>
                  </el-form-item>
                  <el-form-item label="商品分类">
                    <span>{{ props.row.category }}</span>
                  </el-form-item>
                  <el-form-item label="店铺地址">
                    <span>{{ props.row.address }}</span>
                  </el-form-item>
                  <el-form-item label="商品描述">
                    <span>{{ props.row.desc }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column label="ID" prop="pid">
            </el-table-column>
            <el-table-column label="题目" prop="title">
              <template scope="props">
                <a :href="'problem/' + props.row.pid">{{props.row.title}}</a>
              </template>
            </el-table-column>
            <el-table-column label="标签">
              <template scope="props">
                <el-tag v-for="(tag,index) in props.row.tags" :key="index" type="success" close-transition>{{tag}}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      activeName: 'tab0',
      problem: [
        {
          name: '算法',
          content: [{
            "_id": "59ab7437e6010858e5b04152",
            "pid": 10000,
            "class": "编程题",
            "category": "algorithms",
            "tags": ['数据结构', '并查集', '输入输出'],
            "title": "Hello, world",
            "timeLimit": 1000,
            "memoryLimit": 1000,
            "authorName": "MegaShow",
            "ACCounts": 10,
            "JudgeCounts": 38,
            "__v": 0,
          }, {
            "_id": "59ab743be6010858e5b04156",
            "pid": 10001,
            "class": "编程题",
            "category": "algorithms",
            "tags": ['二叉树'],
            "title": "Hi, world",
            "timeLimit": 1000,
            "memoryLimit": 1000,
            "authorName": "MegaShow",
            "ACCounts": 18,
            "JudgeCounts": 98,
            "__v": 0,
          }, {
            "_id": "59ab7437e6010858e5b04152",
            "pid": 10002,
            "class": "编程题",
            "category": "algorithms",
            "tags": ['队列', '红黑树'],
            "title": "Hello, world",
            "timeLimit": 1000,
            "memoryLimit": 1000,
            "authorName": "MegaShow",
            "ACCounts": 10,
            "JudgeCounts": 38,
            "__v": 0,
          }, {
            "_id": "59ab743be6010858e5b04156",
            "pid": 10003,
            "class": "编程题",
            "category": "algorithms",
            "tags": ['队列', '红黑树'],
            "title": "Hi, world",
            "timeLimit": 1000,
            "memoryLimit": 1000,
            "authorName": "MegaShow",
            "ACCounts": 78,
            "JudgeCounts": 98,
            "__v": 0,
          }]
        }, {
          name: '数据结构',
          content: [{
            "_id": "59ab7437e6010858e5b04152",
            "pid": 10004,
            "class": "编程题",
            "category": "algorithms",
            "tags": ['队列', '红黑树'],
            "title": "Hello, world3",
            "timeLimit": 1000,
            "memoryLimit": 1000,
            "authorName": "MegaShow",
            "ACCounts": 0,
            "JudgeCounts": 18,
            "__v": 0,
          }, {
            "_id": "59ab743be6010858e5b04156",
            "pid": 10332,
            "class": "编程题",
            "category": "algorithms",
            "tags": ['队列', '红黑树'],
            "title": "Hi, world",
            "timeLimit": 1000,
            "memoryLimit": 1000,
            "authorName": "MegaShow",
            "ACCounts": 8,
            "JudgeCounts": 19,
            "__v": 0,
          }]
        }, {
          name: '设计模式',
          content: [{
            "_id": "59ab7437e6010858e5b04152",
            "pid": 10044,
            "class": "编程题",
            "category": "algorithms",
            "tags": ['队列', '红黑树'],
            "title": "Hello, world2.0",
            "timeLimit": 1000,
            "memoryLimit": 1000,
            "authorName": "MegaShow",
            "ACCounts": 0,
            "JudgeCounts": 18,
            "__v": 0,
          }]
        }
      ]
    };
  },
  computed: {
    content() {
      return this.$store.state.user.logged;
    }
  },
  methods: {
    handleClick(tab, event) {
      return;
    },
    init() {
      this.$emit('changeNav', '2');
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="scss">

</style>
