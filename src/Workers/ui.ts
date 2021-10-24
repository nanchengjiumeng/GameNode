
import { parentPort } from "worker_threads";
import { UI } from "../UI/UI";

/**
 * ui进程，不断的获取新的ui数据，用于分发给主线程
 */
const ui = new UI(true)

// ui.destroyed()

const start = ui.bindHandle()



while (start) {
	ui.update()
	const data: UIData = {
		elements: ui.allObjects,
		mapName: ui.mapName,
		hp: ui.characterHp
	}
	parentPort.postMessage(data)
}

