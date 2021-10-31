import { cMoveMouse, moveMouse } from "../Action/index";
import { createFyl } from "ts-turing";
import { UI } from "../UI/UI";


const ui = new UI(
	false
	// true
)

ui.bindHandle()
ui.updateWindowInfo()
const { message, screenPosition } = ui.detectSence()
if (screenPosition) {
	console.log(screenPosition);

	moveMouse(screenPosition)
}
// ui.update()

// ui.print()
// console.log(ui.allObjects);
