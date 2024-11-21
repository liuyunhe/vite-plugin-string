import { UserConfig } from 'vite'
import vitePluginString from '../src'

export default <UserConfig>{
  plugins: [vitePluginString()]
}
