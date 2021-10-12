import Pannel from "./classes/Pannel";
import iohook from 'iohook'
import TsTuring = require("ts-turing");

try {
	const Turing = TsTuring.createTuring()
	console.log(Turing.Version());
} catch (e) {
	console.log(e);

}


const pannel = new Pannel()

iohook.on('keypress', (msg) => {
	if (msg.keychar === 27) {
		pannel.stop()
	}
})

iohook.start()
pannel.start()



