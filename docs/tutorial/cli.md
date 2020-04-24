# CLI

`@de2/cli` 是一个全局安装的 `npm` 包，提供了终端里的命令行功能，可以通过 `de init` 快速创建一个基于 [mini-ali-de](https://github.com/Alibaba-mp/mini-ali-de) 框架的小程序脚手架。

## 安装

```sh
tnpm install -g @de2/cli
```

终端运行`de --help`验证是否安装成功。

![de-help](https://gw.alipayobjects.com/mdn/rms_e9e22c/afts/img/A*JxFATKmTyp4AAAAAAAAAAABkARQnAQ)

## 使用

### 创建项目

```sh
de init
```

你会被提示选取一个模板:

* appx - 创建一个 De 小程序模板项目
* page - 创建一个 De 小程序模板页面
* component - 创建一个 De 小程序模板组件

![de-init](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/122912/1566303072643-222b3a26-be07-4043-a78a-a9d8f6525728.png?x-oss-process=image/resize,w_1492)


确认选择的模板后，你可以选择是否在当前目录下新建:

![de-init](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/122912/1566303084152-a61f3fff-4e68-48c2-942f-dc3012b2d04d.png)


如果不在当前目录新建，可以手工输入一个相对路径创建：

![de-init](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/122912/1566303092541-7109b9fe-a355-44b4-a6f3-5469fc4edbdf.png?x-oss-process=image/resize,w_1492)

::: warning 注意
De 会判断你选择的目录是否为空文件夹，如果不是，会终止创建并报错
:::

完成模板的自定义后，即可完成创建，示例如下图：

![de-directory](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/122912/1566303100919-40b34a65-ab34-42a7-8f0c-0a86ea7130ad.png?x-oss-process=image/resize,w_1492)

### 其他可选项

`de init`有一些可选项，你可以运行以下命令进行探索：

```sh
de init --help

Usage: init [options]

Options:
  --template [template]  指定创建模板
  --path [path]          指定创建目录
  -h, --help             输出帮助信息
```

#### --template [template]

`--template`可以用来指定创建的模板。

如果指定，命令行将不再询问选择哪个模板。

```sh
de init --template=page
```

#### --path [path]

`--path`可以用来指定项目创建目录。

使用本参数但不指定相对目录，默认在当前目录创建，命令行不再询问路径。

```sh
de init --path
```

也可以指定一个相对目录进行创建：

```sh
de init --path=local-test
```

<!-- ## 编译配置

::: tip
目前仅支持 less 与 typecript
:::

### less

### typescript -->


> WIP: @de2/cli
