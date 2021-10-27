import Pannel from "./Base/Pannel";
import iohook from 'iohook'

const pannel = new Pannel()

iohook.on('keypress', (msg) => {
	if (msg.keychar === 27) {
		pannel.stop()
	}
})

iohook.start()
pannel.work()



