import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

const db = {
  loginUserData: new Datastore({
    filename: path.join(remote.app.getPath('userData'), '/loginUserData.db')
  }),
  customSetting: new Datastore({
    filename: path.join(remote.app.getPath('userData'), '/customSetting.db')
  })
}

export default {
  db
}
