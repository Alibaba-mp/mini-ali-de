import * as fs from 'fs';
import * as glob from 'glob';
import * as mkdirp from 'mkdirp';
import * as path from 'path';

export function copyAndReplaceForFile(fromPath: string, destPath: string, data: any = {}) {
  if (!fs.existsSync(fromPath)) {
    return;
  }

  mkdirp.sync(path.dirname(destPath));

  if (fs.statSync(fromPath).isDirectory()) {
    if (!fs.existsSync(destPath)) {
      // 创建文件夹
      mkdirp.sync(destPath);
    }
  } else {
    // 复制文件并替换内容
    let content = fs.readFileSync(fromPath).toString();
    for (const k in data) {
      if (data.hasOwnProperty(k)) {
        const reg = new RegExp('<%=\\s*?' + k + '\\s*?%>', 'gi');
        if (reg.test(content)) {
          content = content.replace(reg, data[k]);
        }
      }
    }
    // 将可能被忽略的变量替换为空字符串
    content = content.replace(/<%=\s*?[\w\d\-_]*\s*?%>/gi, '');
    // 写文件到当前目录
    fs.writeFileSync(destPath, content);
  }
}

// copy from luna-client/lib/common/utils.js
export default function copyAndReplace(srcDir: string, destDir: string, data = {}, ignoreList: any[] = []) {
  if (!fs.existsSync(destDir)) {
    mkdirp.sync(destDir);
  }

  glob
    .sync('**', {
      cwd: srcDir,
      dot: true,
      ignore: ['**/**/.gitkeep', '.git/**'].concat(ignoreList),
    })
    .forEach(file => {
      const fromPath = path.join(srcDir, file);
      const destPath = path.join(destDir, file);

      copyAndReplaceForFile(fromPath, destPath, data);
    });
}
