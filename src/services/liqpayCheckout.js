/**
 * Submit a hidden form POST to LiqPay's hosted checkout. LiqPay
 * accepts the `{ data, signature }` envelope as form-encoded fields
 * and replies with their checkout HTML, which means we need a
 * top-level navigation (not a fetch / XHR — those are cross-origin
 * and don't render the response).
 *
 * Building a transient `<form>` and calling `.submit()` is the
 * canonical pattern from LiqPay's docs.
 */
export const submitLiqpayCheckout = ({ checkoutUrl, data, signature }) => {
  if (!checkoutUrl || !data || !signature) {
    throw new Error('Missing LiqPay envelope fields')
  }

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = checkoutUrl
  form.acceptCharset = 'utf-8'
  form.style.display = 'none'

  const dataField = document.createElement('input')
  dataField.type = 'hidden'
  dataField.name = 'data'
  dataField.value = data
  form.appendChild(dataField)

  const sigField = document.createElement('input')
  sigField.type = 'hidden'
  sigField.name = 'signature'
  sigField.value = signature
  form.appendChild(sigField)

  document.body.appendChild(form)
  form.submit()
}
