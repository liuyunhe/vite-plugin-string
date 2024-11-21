// 导入 Vite 插件类型和 Rollup 工具函数
import type { Plugin } from 'vite'
import { createFilter, dataToEsm, FilterPattern } from '@rollup/pluginutils'

/**
 * 定义插件的配置接口
 * @field include 可选的文件包含模式
 * @field exclude 可选的文件排除模式
 * @field compress 可选的代码压缩配置，可以是布尔值或自定义压缩函数
 */
export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  compress?: boolean | ((code: string) => string | Promise<string>)
}

/**
 * 创建一个 Vite 插件，用于处理特定文件类型的字符串内容
 * @param userOptions 用户提供的配置选项
 * @returns 一个 Vite 插件对象
 */
export default function (userOptions: Options = {}): Plugin {
  // 合并默认配置与用户配置
  const options: Options = Object.assign(
    {
      // 默认包含的文件类型
      include: [
        '**/*.vs',
        '**/*.fs',
        '**/*.vert',
        '**/*.frag',
        '**/*.glsl',
        '**/*.wgsl',
      ],
      // 默认开启代码压缩
      compress: true,
    } as Options,
    userOptions
  )

  // 创建文件过滤器，用于判断文件是否需要处理
  const filter = createFilter(options.include, options.exclude)

  // 确定使用默认压缩还是用户自定义的压缩方法
  const compress =
    options.compress === true ? defaultCompress : options.compress

  // 返回插件对象
  return {
    name: 'vite-plugin-string',
    // 文件转换处理函数
    async transform(source, id) {
      // 如果文件不需要处理，则忽略
      if (!filter(id)) return

      // 返回处理后的代码和源码映射
      return {
        code: dataToEsm(compress ? await compress(source) : source),
        map: null,
      }
    },
  }
}

/**
 * 默认的代码压缩函数
 * @param code 原始代码字符串
 * @returns 压缩后的代码字符串
 */
export function defaultCompress(code: string) {
  let needNewline = false
  // 移除注释、多余空格和换行符
  return code
    .replace(
      /\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/g,
      ''
    )
    .split(/\n+/)
    .reduce((result, line) => {
      // 移除行内多余空格和制表符
      line = line.trim().replace(/\s{2,}|\t/, ' ')
      // 处理以 # 开头的预处理器指令
      if (line.charAt(0) === '#') {
        if (needNewline) {
          result.push('\n')
        }
        result.push(line, '\n')
        needNewline = false
      } else {
        // 移除操作符周围的多余空格
        result.push(
          line.replace(
            /\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|-|!|;)\s*/g,
            '$1'
          )
        )
        needNewline = true
      }
      return result
    }, [] as string[])
    .join('')
    .replace(/\n+/g, '\n')
}
