import crypto from "crypto"
import querystring from "querystring"

import { decodeResponseBody, parseResponseBody } from "../../utils/request"
import * as https from "https"

class KrakenService {
	private krakenApiKey: string
	private krakenApiSecret: string

	constructor(krakenApiKey?: string, krakenApiSecret?: string) {
		if (!krakenApiKey) throw new Error("Cannot find KRAKEN_API_KEY")
		if (!krakenApiSecret) throw new Error("Cannot find KRAKEN_API_SECRET")

		this.krakenApiKey = krakenApiKey
		this.krakenApiSecret = krakenApiSecret
	}

	public async addOrder() {
		const api_domain: string = "https://api.vip.uat.lobster.kraken.com"
		const api_path: string = "/0/private/AddOrder"
		const api_nonce: string = String(Date.now() * 1000)
		const postData = {
			nonce: api_nonce,
			ordertype: "limit",
			type: "buy",
			volume: "1.25",
			pair: "XBTUSD",
			price: "27500"
		}

		const api_post: string = querystring.stringify(postData)

		// Create SHA-256 hash of nonce + POST data
		const api_sha256 = crypto.createHash("sha256")
		api_sha256.update(
			Buffer.concat([Buffer.from(api_nonce, "utf8"), Buffer.from(api_post, "utf8")])
		)
		const api_sha256_digest: Buffer = api_sha256.digest()

		const secretBuffer: Buffer = Buffer.from(this.krakenApiSecret, "base64")
		const api_hmac = crypto.createHmac("sha512", secretBuffer)
		api_hmac.update(Buffer.concat([Buffer.from(api_path, "utf8"), api_sha256_digest]))
		const api_signature: string = api_hmac.digest("base64")

		const options: https.RequestOptions = {
			hostname: "api.vip.uat.lobster.kraken.com",
			path: api_path,
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"API-Key": this.krakenApiKey,
				"API-Sign": api_signature,
				"User-Agent": "Kraken REST API"
			}
		}

		const req = https.request(options, (res) => {
			let data = ""

			res.on("data", (chunk) => {
				data += chunk
			})

			res.on("end", () => {
				console.log("API JSON DATA:")
				console.log(data)
			})
		})

		req.on("error", (error) => {
			console.error("Error making request:", error)
		})

		req.write(api_post)
		req.end()
	}
}

export default KrakenService
