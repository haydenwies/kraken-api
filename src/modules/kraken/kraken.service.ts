import * as crypto from "crypto"
import * as querystring from "querystring"

import { makeRequest } from "../../utils/https"
import { ServiceRes } from "../../types/service-response"
import {
	KrakenAddOrderResult,
	KrakenBalanceResult,
	KrakenResponse,
	KrakenWithdrawResult
} from "./kraken.type"

class KrakenService {
	private API_KEY: string
	private API_SECRET: string
	private API_WITHDRAW_KEY: string

	private HOSTNAME = "api.vip.uat.lobster.kraken.com"

	constructor(krakenApiKey?: string, krakenApiSecret?: string, krakenApiWithdrawKey?: string) {
		if (!krakenApiKey) throw new Error("Cannot find KRAKEN_API_KEY")
		if (!krakenApiSecret) throw new Error("Cannot find KRAKEN_API_SECRET")
		if (!krakenApiWithdrawKey) throw new Error("Cannot find KRAKEN_API_WITHDRAW_KEY")

		this.API_KEY = krakenApiKey
		this.API_SECRET = krakenApiSecret
		this.API_WITHDRAW_KEY = krakenApiWithdrawKey
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
	}): Promise<KrakenResponse<T>> {
		// Convert POST data to URL-encoded string
		const postData: string = querystring.stringify(data)

		// Create SHA-256 hash of nonce + POST data
		const api_sha256 = crypto.createHash("sha256")
		api_sha256.update(
			Buffer.concat([Buffer.from(nonce, "utf8"), Buffer.from(postData, "utf8")])
		)
		const api_sha256_digest: Buffer = api_sha256.digest()

		// Create HMAC using SHA-512
		const secretBuffer: Buffer = Buffer.from(this.API_SECRET, "base64")
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
				"API-Key": this.API_KEY,
				"API-Sign": api_signature,
				"User-Agent": "Kraken REST API"
			}
		}

		// Make request and parse
		const res = await makeRequest(options, postData)
		const resJson: KrakenResponse<T> = JSON.parse(res)

		// TODO Add error handler here

		return resJson
	}

	private makeNonce(): string {
		return String(Date.now() * 1000)
	}

	private handleError(errors: string[]): string[] | void {
		const errorsRes: string[] = []

		errors.forEach((error) => {
			switch (error) {
				case "EOrder:Insufficient funds": // Add order
					errorsRes.push("Insufficient funds")
					break
				case "EFunding:Insufficient funds": // Withdraw
					errorsRes.push("Insufficient funds")
					break
				default:
					break
			}
		})

		if (errorsRes.length > 0) {
			return errorsRes
		} else {
			return
		}
	}

	public async getBalance(): Promise<KrakenBalanceResult> {
		// https://docs.kraken.com/api/docs/rest-api/get-account-balance/

		const path = "/0/private/Balance"
		const nonce = this.makeNonce()
		const data = {
			nonce: nonce
		}

		const krakenRes = await this.makeRequest<KrakenBalanceResult>({
			path: path,
			nonce: nonce,
			data: data
		})

		const error = this.handleError(krakenRes.error)

		if (error) throw new Error(error.toString())
		else if (!krakenRes.result) throw new Error("No Kraken result")
		else return krakenRes.result
	}

	public async addOrder(): Promise<KrakenAddOrderResult> {
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

		const krakenRes = await this.makeRequest<KrakenAddOrderResult>({
			path: path,
			nonce: nonce,
			data: data
		})

		const error = this.handleError(krakenRes.error)

		if (error) throw new Error(error.toString())
		else if (!krakenRes.result) throw new Error("No Kraken result")
		else return krakenRes.result
	}

	public async withdraw(): Promise<KrakenWithdrawResult> {
		// https://docs.kraken.com/api/docs/rest-api/withdraw-funds/

		const errors = ["EFunding:Insufficient funds"]

		const path = "/0/private/Withdraw"
		const nonce = this.makeNonce()
		const data = {
			nonce: nonce,
			asset: "XBT",
			key: this.API_WITHDRAW_KEY,
			amount: "0.725"
			// address: "bc1kar0ssrr7xf3vy5l6d3lydnwkre5og2zz3f5ldq" // Address is added as safety check cross ref with 'key'
		}

		const krakenRes = await this.makeRequest<KrakenWithdrawResult>({
			path: path,
			nonce: nonce,
			data: data
		})

		const error = this.handleError(krakenRes.error)

		if (error) throw new Error(error.toString())
		else if (!krakenRes.result) throw new Error("No Kraken result")
		else return krakenRes.result
	}
}

const krakenService = new KrakenService(
	process.env.KRAKEN_API_KEY,
	process.env.KRAKEN_API_SECRET,
	process.env.KRAKEN_API_WITHDRAW_KEY
)

export default krakenService
