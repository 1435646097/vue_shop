<template>
  <div>
    <!-- 面包屑导航条 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 头部添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
    </el-card>
    <el-table :data="roleList" border stripe>
      <el-table-column type="expand">
        <template v-slot="scope">
          <el-row
            v-for="(item1, i1) in scope.row.children"
            :key="item1.id"
            :class="['bdbottom', i1 == 0 ? 'bdtop' : '', 'vcenter']"
          >
            <el-col :span="5">
              <el-tag
                type="primary"
                closable
                @close="deleteRightsById(scope.row, item1.id)"
                >{{ item1.authName }}</el-tag
              >
              <i class="el-icon-caret-right"></i>
            </el-col>
            <el-col :span="19">
              <el-row
                v-for="(item2, i2) in item1.children"
                :key="item2.id"
                :class="[i2 != 0 ? 'bdtop' : '', 'vcenter']"
              >
                <el-col :span="6">
                  <el-tag
                    type="success"
                    closable
                    @close="deleteRightsById(scope.row, item2.id)"
                    >{{ item2.authName }}</el-tag
                  >
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-tag
                    type="warning"
                    v-for="item3 in item2.children"
                    :key="item3.id"
                    closable
                    @close="deleteRightsById(scope.row, item3.id)"
                    >{{ item3.authName }}</el-tag
                  >
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="#" type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delete"
            >删除</el-button
          >
          <el-button
            size="mini"
            type="warning"
            icon="el-icon-setting"
            @click="showSetRightsDialog(scope.row)"
            >分配权限</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 设置权限区域 -->
    <el-dialog
      title="设置用户权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="resetRights()"
    >
      <!-- 对话框的主体部分 -->
      <el-tree
        :data="rightsList"
        :props="rightsProps"
        show-checkbox
        node-key="id"
        default-expand-all
        @check="clickNode"
        :default-checked-keys="delKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 对话框的底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      rightsList: [],
      delKeys: [],
      rightsProps: {
        children: 'children',
        label: 'authName'
      },
      setRightsDialogVisible: false,
      roleId: ''
    }
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status != 200)
        return this.$message.error('获取角色信息失败，请重试')
      this.roleList = res.data
      console.log(this.roleList)
    },
    async deleteRightsById(row, id) {
      const result = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((error) => error)
      console.log(result)
      if (result != 'confirm') {
        return this.$message.info('您取消了此操作')
      }
      const { data: res } = await this.$axios.delete(
        `roles/${row.id}/rights/${id}`
      )
      if (res.meta.status != 200) {
        return this.$message.error('删除异常，请重试')
      }
      row.children = res.data
    },
    //展示用户权限
    async showSetRightsDialog(role) {
      const { data: res } = await this.$axios.get('rights/tree')
      if (res.meta.status != 200) {
        return this.$message.error('获取权限失败，请重试')
      }
      this.rightsList = res.data
      this.loadRoleRights(role, this.delKeys)
      this.roleId = role.id
      this.setRightsDialogVisible = true
    },
    //点击树状节点的复选框时触发
    clickNode(data, self) {
      console.log(data)
      console.log(self)
    },
    //递归加载角色所拥有的权限
    loadRoleRights(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.loadRoleRights(item, arr)
      })
    },
    //重置角色权限
    resetRights() {
      this.delKeys = []
    },
    //设置角色权限
    async setRoleRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      const { data: res } = await this.$axios.post(
        `roles/${this.roleId}/rights`,
        {
          rids: keys.join(',')
        }
      )
      if (res.meta.status != 200) {
        return this.$message.error('分配角色权限失败，请联系管理员')
      }
      this.$message.success('分配角色权限成功')
      this.setRightsDialogVisible = false
      this.getRoleList()
    }
  },
  created() {
    // 获取角色列表
    this.getRoleList()
  }
}
</script>

<style lang="scss" scoped>
.el-tag {
  margin-left: 5px;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
