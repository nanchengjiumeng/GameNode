import path from "path"
import { createProccess } from "../Workers/create"
import AbortController from 'abort-controller'
import { AbortSignal } from 'abort-controller'
import { LOST_TARGET, MAIN_EXIT_0031, MAP_CHANGE } from "../Constants/Emergencies"

function createBaseProcess(signal: AbortSignal) {
	const main = createProccess(path.resolve(__dirname, '../Workers/main'), { signal })
	const ui = createProccess(path.resolve(__dirname, '../Workers/ui'), { signal })
	const eque = createProccess(path.resolve(__dirname, '../Workers/ui-equements'), { signal })
	const tmp = createProccess(path.resolve(__dirname, '../Workers/tmp'), { signal })

	const equeHistory: MirElement[][] = [] // 缓存的装备历史
	const tmpHistory: UIDdataSence[] = []

	eque.addListener('message', (data: MirElement[]) => {
		if (equeHistory.length > 10) equeHistory.shift()
		equeHistory.push(data)
	})

	tmp.addListener('message', async (data: UIDdataSence) => {
		if (tmpHistory.length > 10) tmpHistory.shift()
		tmpHistory.push(data)
	})

	ui.addListener('message', (data: UIData) => {
		data.tmp = tmpHistory[tmpHistory.length - 1]
		const eques = equeHistory[equeHistory.length - 1] || []
		data.elements = [...data.elements, ...eques]
		main.send(data)
	})

	main.addListener('message', (data: MainProcessMessage) => {
		if (data.type === 'update') {
			ui.send(data)
		}
	})

	return main
}


export const CreateControllerForAction = (action: string, params?: any) => () => {
	const controller = new AbortController()
	const main = createBaseProcess(controller.signal)
	main.send({ type: action, params })
	return { controller, main }
}

export const HuiShou = CreateControllerForAction('HuiShou')
export const Gua = CreateControllerForAction('GuaJi', {
	path: '幽灵地堡一层->幽灵地堡二层->幽灵地堡'
	// path: '幽灵地堡一层->幽灵地堡二层->幽灵地堡三层'
})

export function CeShi(): AbortController {
	const { controller: HuiShouController, main } = HuiShou()
	main.addListener('message', (evt: MainProcessMessage) => {
		if (evt.type === MAIN_EXIT_0031) {
			HuiShouController.abort()
			console.log(1);
		}
	})
	return HuiShouController
}

export function GuaJi(): AbortController {
	let { controller: Controller, main } = Gua()
	main.addListener("message", ({ type }: any) => {
		if (type === LOST_TARGET || type === MAP_CHANGE) {
			Controller.abort()
			// return GuaJi()
		}
	})
	return Controller
}