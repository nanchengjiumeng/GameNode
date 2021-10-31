import path from "path"
import { createProccess } from "../Workers/create"
import AbortController from 'abort-controller'
import { PACKAGET_FILL, PACKAGET_NOT_FILL, WINDOW_DEATH } from "../Constants/Emergencies"
import { moveMouseThenLeftClick } from "../Action/index"
import Computed from "../UI/Computed"

export function GuaJi(): AbortController {
	const GuaJiController = new AbortController()
	const { signal } = GuaJiController
	const equeHistory: MirElement[][] = [] // 缓存的装备历史
	const main = createProccess(path.resolve(__dirname, '../Workers/main'), { signal })
	const ui = createProccess(path.resolve(__dirname, '../Workers/ui'), { signal })
	const eque = createProccess(path.resolve(__dirname, '../Workers/ui-equements'), { signal })
	const tmp = createProccess(path.resolve(__dirname, '../Workers/tmp'), { signal })

	eque.addListener('message', (data: MirElement[]) => {
		if (equeHistory.length > 10) equeHistory.shift()
		equeHistory.push(data)
	})

	ui.addListener('message', (data: UIData) => {
		const eques = equeHistory[equeHistory.length - 1]
		data.elements = eques ? data.elements.concat(eques) : data.elements
		// console.log(data.elements);
		main.send(data)
	})

	main.addListener('message', (data: { type: string, msg?: string }) => {
		if (data.type === 'error') {
			GuaJiController.abort()
			Emergencies(data.msg)
		} else if (data.type === 'update') {
			ui.send(data)
		}
	})

	tmp.addListener('message', async (data: { message: string, screenPosition: UIPosition }) => {
		console.log(data);

		if (data.message === WINDOW_DEATH) {
			GuaJiController.abort()
			await moveMouseThenLeftClick(data.screenPosition)
			await Computed.sleep(5000)
			GuaJi()
		}

		if (data.message === PACKAGET_FILL) {
			GuaJiController.abort()
			HuiChengThen(GuaJi)
		}
	})

	main.send({ type: 'GuaJi' })

	return GuaJiController
}

export function Emergencies(msg: string | undefined) {
	if (msg) {

		console.log(msg);
	} else {
		console.log('未知的紧急事件');
	}

}

export function HuiChengThen(callback) {
	const HuiShouController = new AbortController()
	const { signal } = HuiShouController
	const main = createProccess(path.resolve(__dirname, '../Workers/main'), { signal })
	const tmp = createProccess(path.resolve(__dirname, '../Workers/tmp'), { signal })
	const ui = createProccess(path.resolve(__dirname, '../Workers/ui'), { signal })
	ui.addListener('message', (data: UIData) => {
		main.send(data)
	})
	main.addListener('message', (data: { type: string, msg?: string }) => {
		if (data.type === 'update') {
			ui.send(data)
		}
	})
	tmp.addListener('message', async (data: { message: string, screenPosition: UIPosition }) => {
		if (data.message === PACKAGET_NOT_FILL) {
			HuiShouController.abort()
			callback()
		}
	})
	main.send({ type: 'HuiShou' })
	return HuiShouController
}

export function CeShi(): AbortController {
	const HuiShouController = HuiChengThen(() => {
		console.log('123');
	})
	return HuiShouController

}