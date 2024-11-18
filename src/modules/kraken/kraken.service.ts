import crypto from "crypto"
import querystring from "querystring"

import { decodeResponseBody, parseResponseBody } from "../../utils/request"

class KrakenService {
	private krakenApiKey: string
	private krakenApiSecret: string

	constructor(krakenApiKey?: string, krakenApiSecret?: string) {
		if (!krakenApiKey) throw new Error("Cannot find KRAKEN_API_KEY")
		if (!krakenApiSecret) throw new Error("Cannot find KRAKEN_API_SECRET")

		this.krakenApiKey = krakenApiKey
		this.krakenApiSecret = krakenApiSecret
	}

	private getKrakenSignature(urlPath: string, data: Record<string, any>) {
		let encoded
		if (typeof data === "string") {
			const jsonData = JSON.parse(data)
			encoded = jsonData.nonce + data
		} else if (typeof data === "object") {
			const dataStr = querystring.stringify(data)
			encoded = data.nonce + dataStr
		} else {
			throw new Error("Invalid data type")
		}

		const sha256Hash = crypto.createHash("sha256").update(encoded).digest()
		const message = urlPath + sha256Hash.toString("binary")
		const secretBuffer = Buffer.from(this.krakenApiSecret, "base64")
		const hmac = crypto.createHmac("sha512", secretBuffer)
		hmac.update(message, "binary")
		const signature = hmac.digest("base64")
		return signature
	}

	public async addOrder() {
		const payload = {
			nonce: Date.now().toString(),
			ordertype: "limit",
			type: "buy",
			volume: "1.25",
			pair: "XBTUSD",
			price: "27500",
			cl_ord_id: "6d1b345e-2821-40e2-ad83-4ecb18a06876"
		}

		const signature = this.getKrakenSignature("/0/private/AddOrder", payload)

		console.log(signature)

		const res = await fetch("https://api.vip.uat.lobster.kraken.com/0/private/AddOrder", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				"API-Key": this.krakenApiKey,
				"API-Sign": signature
			},
			body: JSON.stringify(payload)
		})

		// console.log(res)
		const contentType = res.headers.get("content-type")
		console.log(`Content Type, ${contentType}`)
		// console.log("Body:", res.body)

		const decodedBody = await decodeResponseBody(res.body)
		console.log(`Body: ${decodedBody}`)

		// const parsedBody = await parseResponseBody(decodedBody)

		// console.log(parsedBody)
	}
}

export default KrakenService
