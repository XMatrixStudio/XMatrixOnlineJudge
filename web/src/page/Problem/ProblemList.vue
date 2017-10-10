<template>
  <el-row :gutter="10">
    <el-col :xs="{span: 22, offset: 1}" :span="18" :offset="3">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane v-for="(tab, index) in problem" :label="tab.name" :name="'tab' + index" :key="index">
          <el-table stripe :data="tab.content" :default-sort="{prop: 'pid', order: 'ascending'}">
            <el-table-column type="expand">
              <template scope="props">
                <el-form label-position="left" inline class="demo-table-expand">
                  <el-form-item label="类型">
                    <span>{{ props.row.class }}</span>
                  </el-form-item>
                  <el-form-item label="出题人">
                    <span>{{ props.row.authorName }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column sortable label="ID" prop="pid" width="70">
            </el-table-column>
            <el-table-column label="题目" prop="title">
              <template scope="props">
                <router-link :to="'/problem/' + props.row.pid">{{props.row.title}}</router-link>
              </template>
            </el-table-column>
            <el-table-column label="标签">
              <template scope="props">
                <el-tag v-for="(tag,index) in props.row.tags" :key="index" type="success" close-transition>{{tag}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column sortable label="通过人数" width="120" prop="ACCounts">
              <template scope="props">
                {{props.row.ACCounts}} ({{Math.ceil(props.row.ACCounts / props.row.JudgeCounts * 1000)/10}}%)
              </template>
            </el-table-column>
            <el-table-column sortable label="评测数" prop="JudgeCounts" width="100">
            </el-table-column>
          </el-table>
          <div class="paginagion">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="tab.currentPage" :page-size="10" layout="prev, pager, next, jumper" :total="tab.total">
            </el-pagination>
          </div>
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
          category: 'algorithms',
          currentPage: 1,
          total: 50,
          content: [{
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
          }, {
            "_id": "59ab743be6010858e5b04156",
            "pid": 10001,
            "class": "编程题",
            "category": "algorithms",
            "tags": ['二叉树'],
            "title": "Hi, world",
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
            "authorName": "MegaShow",
            "ACCounts": 78,
            "JudgeCounts": 98,
            "__v": 0,
          }]
        }, {
          name: '数据结构',
          category: 'dataStructure',
          currentPage: 1,
          total: 500,
          content: [{
            "_id": "59ab7437e6010858e5b04152",
            "pid": 10004,
            "class": "编程题",
            "category": "dataStructure",
            "tags": ['队列', '红黑树'],
            "title": "Hello, world3",
            "authorName": "MegaShow",
            "ACCounts": 0,
            "JudgeCounts": 18,
            "__v": 0,
          }, {
            "_id": "59ab743be6010858e5b04156",
            "pid": 10332,
            "class": "编程题",
            "category": "dataStructure",
            "tags": ['队列', '红黑树'],
            "title": "Hi, world",
            "authorName": "MegaShow",
            "ACCounts": 8,
            "JudgeCounts": 19,
            "__v": 0,
          }]
        }, {
          name: '设计模式',
          category: "design",
          currentPage: 1,
          total: 5,
          content: [{
            "_id": "59ab7437e6010858e5b04152",
            "pid": 10044,
            "class": "编程题",
            "category": "design",
            "tags": ['队列', '红黑树'],
            "title": "Hello, world2.0",
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
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="scss">
.el-tag {
  margin: 3px;
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

.paginagion {
  margin-top: 20px;
  text-align: center;
}
</style>
