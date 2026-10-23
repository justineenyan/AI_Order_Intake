import type { FrontendChatResponse } from '../../types/chat'
import Confirmation from './Confirmation'
import DataTable from './DataTable'
import OrderSummary from './OrderSummary'
import ProductSelector from './ProductSelector'
import ReceiptUpload from './ReceiptUpload'

// `active` is false for older messages so you can't confirm a stale order summary.
export default function ResponseCard({ response, active }: { response: FrontendChatResponse; active: boolean }) {
  const { uiHint, data } = response
  if (!uiHint || uiHint === 'TEXT' || data == null) {
    // receipt upload is still useful without any data
    if (uiHint === 'RECEIPT_UPLOAD') return <ReceiptUpload data={null} active={active} />
    return null
  }

  switch (uiHint) {
    case 'PRODUCT_SELECTOR':
      return <ProductSelector data={data} active={active} />
    case 'ORDER_SUMMARY':
      return <OrderSummary data={data} active={active} />
    case 'RECEIPT_UPLOAD':
      return <ReceiptUpload data={data} active={active} />
    case 'DATA_TABLE':
      return <DataTable data={data} />
    case 'CONFIRMATION':
      return <Confirmation data={data} />
    default:
      return null
  }
}
