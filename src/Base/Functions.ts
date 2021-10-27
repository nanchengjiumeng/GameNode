import path from "path"
import { createProccess } from "../Workers/create"
import AbortController from 'abort-controller'

export function GuaJi(): AbortController {
	const GuaJiController = new AbortController()
	const { signal } = GuaJiController
	const equeHistory: MirElement[][] = [] // 缓存的装备历史
	const main = createProccess(path.resolve(__dirname, '../Workers/main'), { signal })
	const ui = createProccess(path.resolve(__dirname, '../Workers/ui'), { signal })
	const eque = createProccess(path.resolve(__dirname, '../Workers/ui-equements'), { signal })

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

	main.addListener('message', (data) => {
		ui.send(data)
	})

	main.send({ type: 'GuaJi' })

	return GuaJiController
}

export function CeShi(): AbortController {
	const GuaJiController = new AbortController()
	const { signal } = GuaJiController
	const equeHistory: MirElement[][] = [] // 缓存的装备历史
	const ui = createProccess(path.resolve(__dirname, '../Workers/ui'), { signal })
	const eque = createProccess(path.resolve(__dirname, '../Workers/ui-equements'), { signal })

	eque.addListener('message', (data: MirElement[]) => {
		if (equeHistory.length > 10) equeHistory.shift()
		equeHistory.push(data)
	})

	ui.addListener('message', (data: UIData) => {
		const eques = equeHistory[equeHistory.length - 1]
		data.elements = eques ? data.elements.concat(eques) : data.elements
		// console.log(data.elements);
	})
	setTimeout(() => { ui.send({ type: 'update' }) }, 3000)


	return GuaJiController
}