import * as fs from 'fs'

export default class MirMapFile {
	public header!: MirMapFileHeader
	public binary: MirMapBinaryArray = []
	public error = false
	constructor(
		public src: string,
		public hd: boolean = true
	) {
		if (hd) {
			this.readMapFileHD()
		} else {
			this.readMapFileNromal()
		}
	}


	readMapFileHD() {
		try {
			const buf = fs.readFileSync(this.src);
			const bufHeader = buf.slice(0, 52);
			const bufMapInfo = buf.slice(52);
			this.header = {
				width: bufHeader.readInt16LE(0),
				height: bufHeader.readInt16LE(2),
				title: bufMapInfo.length + '',
				updateDate: bufHeader.slice(20, 28).readInt32LE(0),
				reserved: bufHeader.slice(28).toString()
			}
			for (let h = 0; h < this.header.height; h++) {
				// map.mapInfoList[h] = new Array(mapHeader.width)
				this.binary[h] = new Array(this.header.width)
			}
			for (let x = 0; x < this.header.width; x++) {
				for (let y = 0; y < this.header.height; y++) {
					const start = x * (14 * this.header.height) + y * 14
					const end = start + 14
					const bufMapInfoBlock = bufMapInfo.slice(start, end)
					const BkImg = (bufMapInfoBlock.readUInt16LE(0) + 65536).toString(2).slice(1)
					const FrImg = (bufMapInfoBlock.readUInt16LE(4) + 65536).toString(2).slice(1)
					const canPass = BkImg[0] !== "1" && FrImg[0] !== "1"
					this.binary[y][x] = canPass ? 0 : 1
				}
			}
		} catch (e) {
			this.error
		}
	}

	readMapFileNromal(): void {
		try {
			const buf = fs.readFileSync(this.src);
			const bufHeader = buf.slice(0, 52);
			const bufMapInfo = buf.slice(52);
			this.header = {
				width: bufHeader.readInt16LE(0),
				height: bufHeader.readInt16LE(2),
				title: bufMapInfo.length + '',
				updateDate: bufHeader.slice(20, 28).readInt32LE(0),
				reserved: bufHeader.slice(28).toString()
			}
			for (let h = 0; h < this.header.height; h++) {
				this.binary[h] = new Array(this.header.width)
			}
			for (let x = 0; x < this.header.width; x++) {
				for (let y = 0; y < this.header.height; y++) {
					const start = x * (36 * this.header.height) + y * 36
					const end = start + 36
					const bufMapInfoBlock = bufMapInfo.slice(start, end)
					const BkImg = (bufMapInfoBlock.readUInt16LE(0) + 65536).toString(2).slice(1)
					const FrImg = (bufMapInfoBlock.readUInt16LE(4) + 65536).toString(2).slice(1)
					const canPass = BkImg[0] !== "1" && FrImg[0] !== "1"
					this.binary[y][x] = canPass ? 0 : 1
				}
			}
		} catch {
			this.error = true
		}
	}

	copyBinary() {
		return JSON.parse(JSON.stringify(this.binary))
	}
}

