import inquirer from "inquirer"
import { logger } from "../Main/logger"
import { CeShi, GuaJi } from "./Functions"
import AbortController from "abort-controller"

// console.log(TURING.Version());


export default class {
	running: boolean = false
	contoller: AbortController
	constructor() {

	}
	stop() {
		logger.error('stop!!!!!!!!!!!!!')
		if (this.running) {
			this.contoller.abort()
			this.running = false
			// this.start()
		}
	}

	async work() {
		return inquirer
			.prompt([
				{
					type: "list",
					name: "FUNCTIONS",
					message: "请选择使用的功能?\r",
					choices: [
						"挂机",
						"测试"
					]
				}
				/* Pass your questions in here */
			])
			.then((answers) => {
				this.running = true
				if (answers.FUNCTIONS === '挂机') {
					// Use user feedback for... whatever!!
					this.contoller = GuaJi()
				} else if (answers.FUNCTIONS === "测试") {
					this.contoller = CeShi()
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