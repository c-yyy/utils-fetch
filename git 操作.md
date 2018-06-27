## 一些git常用操作

- 删除操作
```
// 删除本地分支
git branch -d <BranchName>

// 删除远程分支
git push origin --delete <BranchName>
```

- 回退操作
```
// 查看记录
git reflog
// 1.本地回退
git reset --hard Obfafd
// 2.强制push本地代码
git push -f
```

- 暂存操作

```
// 暂存
git  stash

// 查看暂存列表
git stash list

//还原最近一次的暂存修改
git stash pop

//还原某一次暂存
git stash pop stash@{2}

```

- 提交代码对比
```
git diff
```

- 拉取新分支
```
// 切换到master 更新
git checkout master
git pull

// 从当前分支拉去新的分支
git checkout -b dev

// 把新的分支push到远程仓库
git push origin dev

// 拉去远程分支 根据提示进行下一步关联
git pull

// 关联
git branch --set-upstream-to=origin/dev

```

- 拉取某次提交的改动
```
git cherry-pick <commit_id>

```


