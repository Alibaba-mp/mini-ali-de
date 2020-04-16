module.exports = {
  question: [
    {
      name: "title",
      type: "input",
      message: "请输入小程序标题(defaultTitle)",
      validate: function (ans) {
        return /^.+$/.test(ans) ? true : '不为空';
      },
      default: "todo"
    }
  ]
};
