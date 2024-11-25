// Generic API response structure

type KrakenRes<T> = {
	result?: T
	error: string[]
}

// API method result types

type KrakenAddOrderRes = {
	descr: {
		order: string
		close?: string
	}
	txid: string[]
}

type KrakenWithdrawRes = {
	refid: string
}

// Error codes

const KrakenResErrors: Record<string, string> = {
	"EOrder:Insufficient funds": "Insufficient funds"
}

export { type KrakenRes, type KrakenAddOrderRes, type KrakenWithdrawRes, KrakenResErrors }
