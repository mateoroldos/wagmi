import { BigNumber } from 'ethers'

import { actHook, renderHook } from '../../../test'
import { useConnect } from '../accounts'
import {
  UseSendTransactionArgs,
  UseSendTransactionConfig,
  useSendTransaction,
} from './useSendTransaction'

const useSendTransactionWithConnect = (
  config: UseSendTransactionArgs & UseSendTransactionConfig = {},
) => {
  const connect = useConnect()
  const sendTransaction = useSendTransaction(config)
  return { connect, sendTransaction } as const
}

describe('useSendTransaction', () => {
  it('on mount', async () => {
    const { result } = renderHook(() =>
      useSendTransactionWithConnect({
        request: {
          to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          value: BigNumber.from('1000000000000000000'), // 1 ETH
        },
      }),
    )

    await actHook(async () => {
      const mockConnector = result.current.connect.connectors[0]
      result.current.connect.connect(mockConnector)
    })

    const res = result.current.sendTransaction
    expect(res).toMatchInlineSnapshot(`[Function]`)
  })

  it('sends transaction', async () => {
    const { result, waitFor } = renderHook(() =>
      useSendTransactionWithConnect({
        request: {
          to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          value: BigNumber.from('1000000000000000000'), // 1 ETH
        },
      }),
    )
    await actHook(async () => {
      const mockConnector = result.current.connect.connectors[0]
      result.current.connect.connect(mockConnector)
      result.current.sendTransaction.sendTransaction()
    })

    await waitFor(() => result.current.sendTransaction.isSuccess)

    const { data, ...res } = result.current.sendTransaction
    expect(data).toBeDefined()
    expect(res).toMatchInlineSnapshot(`
      {
        "context": undefined,
        "error": null,
        "failureCount": 0,
        "isError": false,
        "isIdle": false,
        "isLoading": false,
        "isPaused": false,
        "isSuccess": true,
        "reset": [Function],
        "sendTransaction": [Function],
        "sendTransactionAsync": [Function],
        "status": "success",
        "variables": {
          "request": {
            "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            "value": {
              "hex": "0x0de0b6b3a7640000",
              "type": "BigNumber",
            },
          },
        },
      }
    `)
  })

  it('sends transaction (deferred args)', async () => {
    const { result, waitFor } = renderHook(() =>
      useSendTransactionWithConnect(),
    )

    await actHook(async () => {
      const mockConnector = result.current.connect.connectors[0]
      result.current.connect.connect(mockConnector)
      result.current.sendTransaction.sendTransaction({
        request: {
          to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          value: BigNumber.from('1000000000000000000'), // 1 ETH
        },
      })
    })

    await waitFor(() => result.current.sendTransaction.isSuccess)

    const { data, ...res } = result.current.sendTransaction
    expect(data).toBeDefined()
    expect(res).toMatchInlineSnapshot(`
      {
        "context": undefined,
        "error": null,
        "failureCount": 0,
        "isError": false,
        "isIdle": false,
        "isLoading": false,
        "isPaused": false,
        "isSuccess": true,
        "reset": [Function],
        "sendTransaction": [Function],
        "sendTransactionAsync": [Function],
        "status": "success",
        "variables": {
          "request": {
            "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            "value": {
              "hex": "0x0de0b6b3a7640000",
              "type": "BigNumber",
            },
          },
        },
      }
    `)
  })

  it('fails on insufficient balance', async () => {
    const { result, waitFor } = renderHook(() =>
      useSendTransactionWithConnect({
        request: {
          to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          value: BigNumber.from('10000000000000000000000'), // 100,000 ETH
        },
      }),
    )

    await actHook(async () => {
      const mockConnector = result.current.connect.connectors[0]
      result.current.connect.connect(mockConnector)
      result.current.sendTransaction.sendTransaction()
    })

    await waitFor(() => result.current.sendTransaction.isError)

    const { error, ...res } = result.current.sendTransaction
    expect(error).toBeDefined()
    expect(res).toMatchInlineSnapshot(`
      {
        "context": undefined,
        "data": undefined,
        "failureCount": 1,
        "isError": true,
        "isIdle": false,
        "isLoading": false,
        "isPaused": false,
        "isSuccess": false,
        "reset": [Function],
        "sendTransaction": [Function],
        "sendTransactionAsync": [Function],
        "status": "error",
        "variables": {
          "request": {
            "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            "value": {
              "hex": "0x021e19e0c9bab2400000",
              "type": "BigNumber",
            },
          },
        },
      }
    `)
  })
})
