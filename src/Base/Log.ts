import chalk from "chalk";
export default class Log {
	public list: string[] = []
	public console = console

	error(text: string, record = false) {
		if (record) this.list.push(text)
		this.console.log(chalk.red(text))
	}

	primary(text: string, record = false) {
		if (text === this.list[this.list.length - 1]) return
		this.list.push(text)
		if (record) this.list.push(text)
		this.console.log(chalk.blue(text))
	}

	log(text: string, record = false) {
		if (record) this.list.push(text)
		this.console.log(text)
	}
}