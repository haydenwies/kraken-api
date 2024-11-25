// Generic API response structure

type KrakenResponse<T> = {
	result?: T
	error: string[]
}

// API method result types

type KrakenBalanceResult = Record<string, string>

type KrakenAddOrderResult = {
	descr: {
		order: string
		close?: string
	}
	txid: string[]
}

type KrakenWithdrawResult = {
	refid: string
}

export {
	type KrakenResponse,
	type KrakenAddOrderResult,
	type KrakenWithdrawResult,
	type KrakenBalanceResult
}
