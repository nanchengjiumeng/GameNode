
import { UI } from "../UI/UI"


/**
 * ui进程，不断的获取新的ui数据，用于分发给主线程
 */
// const ui = new UI(true)
const ui = new UI(false)

ui.bindHandle()

process.on("message", ({ type }) => {
	if (type === 'update') {
		ui.update()
		const data: UIData = {
			elements: ui.allObjects,
			mapName: ui.mapName,
			hp: ui.characterHp
		}
		process.send(data)
	}
})

	// parentPort.postMessage(data)
