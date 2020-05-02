<template>
  <div>
    <!-- 面包屑导航条 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告提示框 -->
      <el-alert
        title="注意：只允许第三级分类设置相关参数"
        type="warning"
        show-icon
      >
      </el-alert>
      <!-- 商品分类的级联选择 -->
      <el-row>
        <el-col>
          选择商品分类:
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 参数区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            simi="mini"
            :disabled="buttonIsDisable"
            @click="addDialogVisible = true"
            >添加动态参数</el-button
          >
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  type="primary"
                  closable
                  @close="handleTagClosed(index, scope.row)"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            simi="mini"
            :disabled="buttonIsDisable"
            @click="addDialogVisible = true"
            >添加静态属性</el-button
          >
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  type="primary"
                  closable
                  @close="handleTagClosed(index, scope.row)"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column label="属性名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      @close="addDialogClosed"
      width="50%"
    >
      <!-- 添加对话框的主体 -->
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="80px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 添加对话框的底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数的对话框 -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editDialogVisible"
      @close="editDialogClosed"
      width="50%"
    >
      <!-- 编辑对话框的主体 -->
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="80px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 编辑对话框的底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedCateKeys: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      cateList: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      editForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async handleChange() {
      this.getParamsList()
    },
    handleTabClick() {
      this.getParamsList()
    },
    async getParamsList() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const {
        data: res
      } = await this.$axios.get(
        `categories/${this.selectedCateKeys[2]}/attributes`,
        { params: { sel: this.activeName } }
      )
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async showEditDialog(attr_id) {
      const {
        data: res
      } = await this.$axios.get(
        `categories/${this.selectedCateKeys[2]}/attributes/${attr_id}`,
        { params: { attr_sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('编辑失败，请稍后重试！！！')
      }
      this.$message.success('编辑成功！！！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请输入正确的信息')
        }
        const { data: res } = await this.$axios.post(
          `categories/${this.selectedCateKeys[2]}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数异常，请稍后重试')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsList()
      })
    },
    async editParams() {
      const { data: res } = await this.$axios.put(
        `categories/${this.selectedCateKeys[2]}/attributes/${this.editForm.attr_id}`,
        {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('编辑属性异常，请重试!!!')
      }
      this.getParamsList()
      this.editDialogVisible = false
    },
    async deleteParams(attr_id) {
      const result = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((error) => error)
      if (result !== 'confirm') {
        return this.$message.info('您取消了删除')
      }
      const { data: res } = await this.$axios.delete(
        `categories/${this.selectedCateKeys[2]}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除异常，请稍后重试！！！')
      }
      this.$message.success('删除成功！！！')
      this.getParamsList()
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim() === '') {
        return
      }
      row.attr_vals.push(row.inputValue)

      row.inputVisible = false
      this.saveAttr(row)
      if (res.meta.status !== 200) {
        return this.$message.error('编辑失败，请稍后重试')
      }
      this.$message.success('编辑成功')
    },
    async saveAttr(row) {
      const { data: res } = await this.$axios.put(
        `categories/${this.selectedCateKeys[2]}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
    },
    showInput(row) {
      row.inputValue = ''
      row.inputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleTagClosed(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttr(row)
    }
  },
  async created() {
    const { data: res } = await this.$axios.get('categories')
    if (res.meta.status !== 200) {
      return this.$message.error('获取商品列表失败，请稍后重试')
    }
    this.cateList = res.data
  },
  computed: {
    buttonIsDisable() {
      if (this.selectedCateKeys.length === 3) {
        return false
      }
      return true
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="scss" scoped>
.el-cascader {
  margin: 15px 0px;
}
.el-tag {
  margin-left: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
