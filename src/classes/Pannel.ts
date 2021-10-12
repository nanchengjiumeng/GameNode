import { MapWorkerRunnerStopReason } from "../constants/index";
import inquirer from "inquirer"
import test from '../test/test'
import { logger } from "../workers/index";

console.log(process.cwd());


export default class {
	running: boolean = false
	runner!: WorkerRunner<any>
	constructor() {

	}
	stop() {
		if (this.running) {
			this.runner.stop()
			this.running = false
			setTimeout(() => {
				this.start()
			}, 10)
		}
		// console.log(chalk.red('已经停止'));
	}
	async start() {
		await this.work()
		await this.runner.__runner
	}

	async work() {
		return inquirer
			.prompt([
				{
					type: "list",
					name: "FUNCTIONS",
					message: "请选择使用的功能?\r",
					choices: [
						test.description
					]
				}
				/* Pass your questions in here */
			])
			.then((answers) => {
				// Use user feedback for... whatever!!
				this.running = true
				let stop = () => { }
				const worker = new Promise<WorkerRunnerReturn<any>>((resolve) => {
					let reason: WorkerRunnerStopReason = 200
					let interval = (setInterval(() => {
						logger.log(JSON.stringify(answers))
					}, 1000))
					stop = () => {
						clearInterval(interval)
						// console.clear()
						reason = 402
						resolve({
							reason,
							data: null
						})
					}
				})

				worker.then((res) => {
					const text = MapWorkerRunnerStopReason.find(r => r.reason === res.reason)?.text || 'unknown'
					if (text) {
						logger.error(text)
					}
				})

				this.runner = {
					stop,
					__runner: worker
				}
			})
			.catch((error) => {
				if (error.isTtyError) {
					// Prompt couldn't be rendered in the current environment
				} else {
					// Something else went wrong
				}
			});
	}

}