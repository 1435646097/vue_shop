<template>
  <div>
    <!-- 面包屑导航条 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-row>
      <el-col>
        <el-button type="primary" @click="shoAddCateDialog">添加分类</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <tree-table
          :data="goodsList"
          :columns="columns"
          :selection-type="false"
          :expand-type="false"
          show-index
        >
          <!-- 是否有效 -->
          <template v-slot:isok="scope">
            <i
              class="el-icon-error"
              style="color:red"
              v-if="scope.row.cat_deleted"
            ></i>
            <i class="el-icon-success" style="color:lightgreen" v-else></i>
          </template>
          <!-- 排序 -->
          <template v-slot:order="scope">
            <el-tag v-if="scope.row.cat_level == 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.cat_level == 1"
              >二级</el-tag
            >
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
          <!-- 操作 -->
          <template v-slot:opt="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button type="danger" size="mini" icon="el-icon-delete"
              >删除</el-button
            >
          </template>
        </tree-table>
      </el-col>
    </el-row>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[2, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
    <!-- 添加类别的dialog -->
    <el-dialog
      title="提示"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 主体区域 -->
      <div>
        <el-form
          ref="addCateFormRef"
          :rules="addCateFormRules"
          :model="addCateForm"
          label-width="80px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              v-model="selectedKeys"
              :options="cateParentList"
              :props="CascaderProps"
              @change="cascaderChange"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
      </div>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入商品分类名称', trigger: 'blur' }
        ]
      },
      addCateDialogVisible: false,
      selectedKeys: [],
      cateParentList: [],
      CascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      goodsList: []
    }
  },
  methods: {
    //获取商品分类列表
    async getGoodsList() {
      const { data: res } = await this.$axios.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败，请重试!!!')
      }
      console.log(res)
      this.goodsList = res.data.result
      this.total = res.data.total
    },
    //展示添加分类的对话框
    shoAddCateDialog() {
      this.addCateDialogVisible = true
    },
    //获取级联商品类别
    async getcateParentList() {
      const { data: res } = await this.$axios.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.message.error('获取级联商品类别失败，请重试！！！')
      }
      this.cateParentList = res.data
    },
    //监听级联选择改变
    cascaderChange() {
      this.addCateForm.cat_level = this.selectedKeys.length
      this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
    },
    //监听添加商品类别对话框的关闭事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
      this.selectedKeys = []
    },
    //添加商品分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写正确的信息!!!')
        }
        const { data: res } = await this.$axios.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加异常请稍后重试!!!')
        }
        this.addCateDialogClosed()
        this.getGoodsList()
        this.getcateParentList()
        this.addCateDialogVisible = false
      })
    },
    //PageSize改变时发生
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    //当前页改变时发生
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    }
  },
  created() {
    this.getGoodsList()
    this.getcateParentList()
  }
}
</script>
