import inquirer from "inquirer"
import * as path from 'path'
import { create as createWorker } from '../Workers/create'
import { Worker } from 'worker_threads'

export default class {
	running: boolean = false
	workers: Worker[] = []
	constructor() {

	}
	stop() {
		if (this.running && this.workers.length) {
			this.workers.forEach(worker => {
				worker.terminate()
			})
			this.workers = []
			this.running = false
			// this.start()
		}
	}
	start() {
		return this.work()
		// await this.runner.__runner
	}

	async work() {
		return inquirer
			.prompt([
				{
					type: "list",
					name: "FUNCTIONS",
					message: "请选择使用的功能?\r",
					choices: [
						"挂机"
					]
				}
				/* Pass your questions in here */
			])
			.then((answers) => {
				if (answers.FUNCTIONS === '挂机') {
					// Use user feedback for... whatever!!
					this.running = true
					const mainWorker = createWorker(path.resolve(__dirname, '../Workers/main'))
					const uiWorker = createWorker(path.resolve(__dirname, '../Workers/ui'))

					uiWorker.addListener('message', (data: UIData) => {
						mainWorker.postMessage(data)
					})

					this.workers = [mainWorker, uiWorker]
				}
			})
			.catch((error) => {
				console.log(error);

				if (error.isTtyError) {
					// Prompt couldn't be rendered in the current environment
				} else {
					// Something else went wrong
				}
			});
	}

}