import inquirer from "inquirer"
import * as path from 'path'
import { createProccess } from '../Workers/create'
import { Worker } from 'worker_threads'
import { ChildProcess } from "child_process"

// console.log(TURING.Version());


export default class {
	running: boolean = false
	processes: ChildProcess[] = []
	constructor() {

	}
	stop() {
		console.log('stop');

		if (this.running && this.processes.length) {
			this.processes.forEach(pro => {
				pro.kill()
			})
			this.processes = []
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
					const main = createProccess(path.resolve(__dirname, '../Workers/main'))
					const ui = createProccess(path.resolve(__dirname, '../Workers/ui'))

					ui.addListener('message', (data: UIData) => {
						main.send(data)
					})

					this.processes = [main, ui]
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