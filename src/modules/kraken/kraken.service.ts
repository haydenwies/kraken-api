import * as crypto from "crypto"
import * as querystring from "querystring"

import { makeRequest } from "../../utils/https"
import { ServiceRes } from "../../types/service-response"
import { KrakenAddOrderRes, KrakenRes, KrakenResErrors, KrakenWithdrawRes } from "./kraken.type"

class KrakenService {
	private apiKey: string
	private apiSecret: string
	private apiWithdrawKey: string

	private HOSTNAME = "api.vip.uat.lobster.kraken.com"

	constructor(krakenApiKey?: string, krakenApiSecret?: string, krakenApiWithdrawKey?: string) {
		if (!krakenApiKey) throw new Error("Cannot find KRAKEN_API_KEY")
		if (!krakenApiSecret) throw new Error("Cannot find KRAKEN_API_SECRET")
		if (!krakenApiWithdrawKey) throw new Error("Cannot find KRAKEN_API_WITHDRAW_KEY")

		this.apiKey = krakenApiKey
		this.apiSecret = krakenApiSecret
		this.apiWithdrawKey = krakenApiWithdrawKey
	}

	// TODO Update to include GET method (make data param optional)
	private async makeRequest<T>({
		path,
		nonce,
		data
	}: {
		path: string
		nonce: string
		data: Record<string, string>
	}): Promise<KrakenRes<T>> {
		// Convert POST data to URL-encoded string
		const postData: string = querystring.stringify(data)

		// Create SHA-256 hash of nonce + POST data
		const api_sha256 = crypto.createHash("sha256")
		api_sha256.update(
			Buffer.concat([Buffer.from(nonce, "utf8"), Buffer.from(postData, "utf8")])
		)
		const api_sha256_digest: Buffer = api_sha256.digest()

		// Create HMAC using SHA-512
		const secretBuffer: Buffer = Buffer.from(this.apiSecret, "base64")
		const api_hmac = crypto.createHmac("sha512", secretBuffer)
		api_hmac.update(Buffer.concat([Buffer.from(path, "utf8"), api_sha256_digest]))
		const api_signature: string = api_hmac.digest("base64")

		// HTTP request options
		const options = {
			hostname: this.HOSTNAME,
			path: path,
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"API-Key": this.apiKey,
				"API-Sign": api_signature,
				"User-Agent": "Kraken REST API"
			}
		}

		const res = await makeRequest(options, postData)
		const resJson: KrakenRes<T> = JSON.parse(res)

		const maskedError = this.handleErrors(resJson.error)
		resJson.error = maskedError

		return resJson
	}

	private handleErrors(errors: string[]): string[] {
		const errorsRes: string[] = []

		if (errors.length > 0) {
			console.log("Checking errors")
			errors.forEach((error) => {
				console.log(error)
				const errorMsg = KrakenResErrors[error]
				if (errorMsg !== undefined) errorsRes.push(errorMsg)
			})
		}

		return errorsRes
	}

	private makeNonce(): string {
		return String(Date.now() * 1000)
	}

	public async addOrder(): Promise<ServiceRes<KrakenAddOrderRes>> {
		// https://docs.kraken.com/api/docs/rest-api/add-order/

		const path = "/0/private/AddOrder"
		const nonce = this.makeNonce()
		const data = {
			nonce: nonce,
			ordertype: "limit",
			type: "buy",
			volume: "1.25",
			pair: "XBTUSD",
			price: "27500"
		}

		const krakenRes = await this.makeRequest<KrakenAddOrderRes>({
			path: path,
			nonce: nonce,
			data: data
		})

		let res: ServiceRes<KrakenAddOrderRes>

		if (krakenRes.error.length > 0) res = { success: false, error: krakenRes.error }
		else if (krakenRes.result === undefined) throw new Error("No Kraken result")
		else res = { success: true, data: krakenRes.result }

		return res
	}

	public async withdraw(): Promise<ServiceRes<KrakenWithdrawRes>> {
		// https://docs.kraken.com/api/docs/rest-api/withdraw-funds/

		const path = "/0/private/Withdraw"
		const nonce = this.makeNonce()
		const data = {
			nonce: nonce,
			asset: "XBT",
			key: this.apiWithdrawKey,
			amount: "0.725"
			// address: "bc1kar0ssrr7xf3vy5l6d3lydnwkre5og2zz3f5ldq" // Address is added as safety check cross ref with 'key'
		}

		const krakenRes = await this.makeRequest<KrakenWithdrawRes>({
			path: path,
			nonce: nonce,
			data: data
		})

		let res: ServiceRes<KrakenWithdrawRes>
		console.log(krakenRes)

		if (krakenRes.error.length > 0) res = { success: false, error: krakenRes.error }
		else if (krakenRes.result === undefined) throw new Error("No Kraken result")
		else res = { success: true, data: krakenRes.result }

		return res
	}
}

export default KrakenService
