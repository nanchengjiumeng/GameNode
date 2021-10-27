
import { UI } from "../UI/UI"


/**
 * ui进程，不断的获取新的ui数据，用于分发给主线程
 */
// const ui = new UI(true)
const ui = new UI(false)

ui.bindHandle()


while (true) {
	ui.updateEquements()
	process.send(ui.allObjects.filter((o) => o.type === 4))
}

