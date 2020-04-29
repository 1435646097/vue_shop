<template>
  <div>
    <!-- 面包屑导航条 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 用户搜索与添加 -->
      <el-row :gutter="30">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            :clearable="true"
            @clear="setPageNum"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="setPageNum"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户信息展示 -->
      <el-table :data="usersList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="">
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStatuChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="DeleteUserById(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-share"
                size="mini"
                @click="setUserRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框区域 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="resetAddForm"
    >
      <!-- 主体信息 -->
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="80px"
      >
        <el-form-item label="账号" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部信息 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户的对话框区域 -->
    <el-dialog title="添加用户" :visible.sync="editDialogVisible" width="50%">
      <!-- 主体信息 -->
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="80px"
      >
        <el-form-item label="账号" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部信息 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 设置用户角色的对话框 -->
    <el-dialog title="提示" :visible.sync="setUserRoleVisible" width="50%">
      <div>
        <p>当前用户:{{ currentUser.username }}</p>
        <p>当前角色:{{ currentUser.role_name }}</p>
        <p>
          分配角色
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setUserRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="setUserRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, callback) => {
      var rex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (rex.test(value)) {
        callback()
      } else {
        callback(new Error('请输入合法的邮箱'))
      }
    }
    var checkPhone = (rule, value, callback) => {
      var rex = /^([1][3,4,5,6,7,8,9])\d{9}$/
      if (rex.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的手机号'))
      }
    }
    return {
      //用户列表数据
      usersList: [],
      //角色列表
      roleList: [],
      //分配角色时当前的用户
      currentUser: {},
      //选中的角色id
      selectedRoleId: '',
      //分页信息
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      total: 0,
      //添加用户的提示框
      addDialogVisible: false,
      //编辑用户的提示框
      editDialogVisible: false,
      setUserRoleVisible: false,
      //添加用户的数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {},
      // 编辑用户的规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      //添加用户的验证信息
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //获取用户列表
    async getUsersList() {
      const { data: res } = await this.$axios.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.usersList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUsersList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getUsersList()
    },
    //修改用户状态
    async userStatuChange(newRow) {
      console.log(newRow)
      const { data: res } = await this.$axios.put(
        `users/${newRow.id}/state/${newRow.mg_state}`
      )
      console.log(res)
      if (res.meta.status !== 200) {
        newRow.mg_state = !mg_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('修改用户状态成功')
    },
    //设置为第一页并重新查询
    setPageNum() {
      this.queryInfo.pagenum = 1
      this.getUsersList()
    },
    //重置添加表单
    resetAddForm() {
      this.$refs.addFormRef.resetFields()
    },
    //提交添加表单
    submitAddForm() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请填写完善的信息')
        const { data: res } = await this.$axios.post('users', this.addForm)
        if (res.meta.status != 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.getUsersList()
        this.addDialogVisible = false
      })
    },
    async showEditDialog(id) {
      const { data: res } = await this.$axios.get('users/' + id)
      if (res.meta.status != 200)
        return this.$message.error('编辑失败，请联系系统管理员')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    submitEditForm() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请填写完善的信息')
        const { data: res } = await this.$axios.put(
          'users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        if (res.meta.status != 200)
          return this.$message.error('编辑失败，请联系系统管理员')
        this.getUsersList()
        this.editDialogVisible = false
      })
    },
    //根据用户id删除该用户
    async DeleteUserById(id) {
      const result = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((error) => error)
      if (result != 'confirm') return this.$message.info('取消删除操作')
      const { data: res } = await this.$axios.delete('users/' + id)
      if (res.meta.status != 200) return this.$message.error('删除异常，请重试')
      this.$message.success('删除成功')
      this.getUsersList()
    },
    //显示分配用户角色的对话框
    async setUserRoleDialog(row) {
      this.currentUser = row
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status != 200) {
        return this.$message.error('获取角色列表失败，请重试')
      }
      this.roleList = res.data
      this.setUserRoleVisible = true
    },
    //分配用户角色
    async setUserRole() {
      const { data: res } = await this.$axios.put(
        `users/${this.currentUser.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status != 200) {
        return this.$message.error('分配用户角色失败，请重试')
      }
      this.$message.success('分配用户角色成功')
      this.roleList = []
      this.selectedRoleId = ''
      this.setUserRoleVisible = false
      this.getUsersList()
    }
  },
  created() {
    this.getUsersList()
  }
}
</script>
